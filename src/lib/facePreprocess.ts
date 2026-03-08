/**
 * Face Preprocessing Pipeline
 * 
 * Pipeline stages:
 * 1. Face Detection — BlazeFace (TensorFlow.js) detects face bounding box + landmarks
 * 2. Face Alignment — Uses eye landmarks to calculate rotation, de-skews the face
 * 3. Facial Region Crop — Extracts face with padding for forehead/chin
 * 4. Lighting Normalization — CLAHE-inspired histogram equalization per channel
 * 5. Background Noise Reduction — Gaussian-approximated smoothing on edges
 * 6. Output — Clean 512×512 JPEG blob ready for AI skin analysis
 */

import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

let modelPromise: Promise<blazeface.BlazeFaceModel> | null = null;

/** Lazy-load the BlazeFace model (cached after first call) */
function getModel(): Promise<blazeface.BlazeFaceModel> {
  if (!modelPromise) {
    modelPromise = tf.ready().then(() => blazeface.load());
  }
  return modelPromise;
}

export interface FacePreprocessResult {
  croppedBlob: Blob;
  faceDetected: boolean;
  confidence: number;
  landmarks: { leftEye: [number, number]; rightEye: [number, number] } | null;
}

/** Load an image element from a File */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Stage 1: Face Detection
 * BlazeFace returns bounding box + 6 keypoints (right eye, left eye, nose,
 * mouth, right ear, left ear). We use the highest-confidence detection.
 */
async function detectFace(img: HTMLImageElement) {
  const model = await getModel();
  const predictions = await model.estimateFaces(img, false);

  if (!predictions.length) return null;

  // Pick highest probability face
  const best = predictions.reduce((a, b) =>
    (a.probability as number) > (b.probability as number) ? a : b
  );

  const topLeft = best.topLeft as [number, number];
  const bottomRight = best.bottomRight as [number, number];
  const landmarks = best.landmarks as number[][];

  return {
    box: { x: topLeft[0], y: topLeft[1], w: bottomRight[0] - topLeft[0], h: bottomRight[1] - topLeft[1] },
    confidence: best.probability as number,
    rightEye: landmarks[0] as [number, number],
    leftEye: landmarks[1] as [number, number],
    nose: landmarks[2] as [number, number],
  };
}

/**
 * Stage 2 & 3: Alignment + Crop
 * - Compute angle between eyes → rotate canvas to level the face
 * - Expand bounding box by 40% for forehead/chin/sides
 * - Crop to square and resize to 512×512
 */
function alignAndCrop(
  img: HTMLImageElement,
  face: NonNullable<Awaited<ReturnType<typeof detectFace>>>
): CanvasRenderingContext2D {
  const { box, leftEye, rightEye } = face;

  // Calculate rotation angle from eye positions
  const dx = rightEye[0] - leftEye[0];
  const dy = rightEye[1] - leftEye[1];
  const angle = Math.atan2(dy, dx);

  // Face center
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  // Expand box for full face coverage (forehead, chin)
  const padding = 0.45;
  const side = Math.max(box.w, box.h) * (1 + padding);
  const halfSide = side / 2;

  const outputSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  // White background for any exposed edges
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, outputSize, outputSize);

  // Apply rotation around face center, then draw
  ctx.save();
  ctx.translate(outputSize / 2, outputSize / 2);
  ctx.rotate(-angle);
  ctx.drawImage(
    img,
    cx - halfSide, cy - halfSide, side, side,
    -outputSize / 2, -outputSize / 2, outputSize, outputSize
  );
  ctx.restore();

  return ctx;
}

/**
 * Stage 4: Lighting Normalization
 * Simple per-channel histogram stretch to normalize contrast.
 * Maps the 1st–99th percentile range to 0–255 for each RGB channel,
 * reducing the impact of harsh shadows or overexposure.
 */
function normalizeLighting(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  for (let ch = 0; ch < 3; ch++) {
    // Build histogram
    const hist = new Uint32Array(256);
    for (let i = 0; i < totalPixels; i++) {
      hist[data[i * 4 + ch]]++;
    }

    // Find 1st and 99th percentile
    const lo1 = Math.floor(totalPixels * 0.01);
    const hi99 = Math.floor(totalPixels * 0.99);
    let cumSum = 0;
    let minVal = 0, maxVal = 255;

    for (let v = 0; v < 256; v++) {
      cumSum += hist[v];
      if (cumSum >= lo1 && minVal === 0) minVal = v;
      if (cumSum >= hi99) { maxVal = v; break; }
    }

    // Stretch
    const range = maxVal - minVal || 1;
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4 + ch;
      data[idx] = Math.max(0, Math.min(255, Math.round(((data[idx] - minVal) / range) * 255)));
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Stage 5: Background Noise Reduction
 * Apply a mild 3×3 Gaussian blur to soften JPEG artifacts and sensor noise
 * while preserving facial detail. Only applied once (not iterative).
 */
function reduceNoise(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const src = ctx.getImageData(0, 0, width, height);
  const dst = ctx.createImageData(width, height);

  // 3×3 Gaussian kernel (σ ≈ 0.8)
  const k = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kSum = 16;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let ch = 0; ch < 3; ch++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + ch;
            sum += src.data[idx] * k[ki++];
          }
        }
        dst.data[(y * width + x) * 4 + ch] = Math.round(sum / kSum);
      }
      dst.data[(y * width + x) * 4 + 3] = 255; // alpha
    }
  }

  // Copy edge pixels unchanged
  for (let x = 0; x < width; x++) {
    for (let ch = 0; ch < 4; ch++) {
      dst.data[x * 4 + ch] = src.data[x * 4 + ch];
      const lastRow = (height - 1) * width + x;
      dst.data[lastRow * 4 + ch] = src.data[lastRow * 4 + ch];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let ch = 0; ch < 4; ch++) {
      dst.data[y * width * 4 + ch] = src.data[y * width * 4 + ch];
      const lastCol = (y * width + width - 1);
      dst.data[lastCol * 4 + ch] = src.data[lastCol * 4 + ch];
    }
  }

  ctx.putImageData(dst, 0, 0);
}

/** Convert canvas to Blob */
function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas to blob failed"))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * Main pipeline entry point.
 * Takes a raw image File, runs all 5 preprocessing stages,
 * and returns a clean 512×512 face-cropped JPEG blob.
 */
export async function preprocessFace(file: File): Promise<FacePreprocessResult> {
  const img = await loadImage(file);

  // Stage 1: Detect
  const face = await detectFace(img);

  if (!face) {
    // No face found — return original image resized to 512
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 512, 512);
    const blob = await canvasToBlob(canvas);
    URL.revokeObjectURL(img.src);
    return { croppedBlob: blob, faceDetected: false, confidence: 0, landmarks: null };
  }

  // Stage 2 & 3: Align + Crop
  const ctx = alignAndCrop(img, face);

  // Stage 4: Normalize lighting
  normalizeLighting(ctx);

  // Stage 5: Reduce noise
  reduceNoise(ctx);

  // Output
  const blob = await canvasToBlob(ctx.canvas);
  URL.revokeObjectURL(img.src);

  return {
    croppedBlob: blob,
    faceDetected: true,
    confidence: face.confidence,
    landmarks: {
      leftEye: face.leftEye,
      rightEye: face.rightEye,
    },
  };
}
