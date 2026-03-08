import { useState, useRef } from "react";
import { Upload, Loader2, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MetricsPanel } from "./MetricsPanel";
import { AnalysisLoading } from "./AnalysisLoading";
import { preprocessFace, type FacePreprocessResult } from "@/lib/facePreprocess";
import type { Scan } from "@/hooks/useScans";
import { motion, AnimatePresence } from "framer-motion";

export const SelfieScanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preprocessed, setPreprocessed] = useState<FacePreprocessResult | null>(null);
  const [preprocessing, setPreprocessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setResult(null);
    setPreprocessing(true);

    // Show original preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const ppResult = await preprocessFace(file);
      setPreprocessed(ppResult);

      // Update preview to preprocessed image
      const ppUrl = URL.createObjectURL(ppResult.croppedBlob);
      setPreview(ppUrl);

      if (!ppResult.faceDetected) {
        toast.warning("No face detected — the image will still be analyzed, but results may be less accurate.");
      } else {
        toast.success(`Face detected (${Math.round(ppResult.confidence * 100)}% confidence)`);
      }
    } catch (err) {
      console.error("Preprocessing failed:", err);
      toast.error("Face processing failed. The original image will be used.");
      // Keep original preview
      setPreprocessed(null);
    } finally {
      setPreprocessing(false);
    }
  };

  const analyzeSelfie = async () => {
    if (!user) return;

    setAnalyzing(true);
    try {
      // Use preprocessed blob if available, otherwise original file
      const uploadBlob = preprocessed?.croppedBlob ?? fileInputRef.current?.files?.[0];
      if (!uploadBlob) throw new Error("No image to analyze");

      const filePath = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("selfies")
        .upload(filePath, uploadBlob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("selfies")
        .getPublicUrl(filePath);

      const { data, error } = await supabase.functions.invoke("analyze-skin", {
        body: { imageUrl: publicUrl },
      });

      if (error) throw error;

      const scanData = {
        user_id: user.id,
        image_url: publicUrl,
        overall_score: data.overall_score,
        skin_age: data.skin_age,
        wrinkles_score: data.wrinkles_score,
        pores_score: data.pores_score,
        redness_score: data.redness_score,
        pigmentation_score: data.pigmentation_score,
        hydration_score: data.hydration_score,
        summary: data.summary,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("scans")
        .insert(scanData)
        .select()
        .single();
      if (insertError) throw insertError;

      setResult(inserted as Scan);
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      queryClient.invalidateQueries({ queryKey: ["latest-scan"] });
      toast.success("Skin analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setPreprocessed(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (analyzing) {
    return <AnalysisLoading imageUrl={preview} />;
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {preview && (
              <div className="glass-card p-4">
                <img src={preview} alt="Scan" className="w-28 h-28 rounded-xl object-cover mx-auto" />
              </div>
            )}
            <MetricsPanel scan={result} />
            <div className="flex justify-center">
              <Button variant="outline" onClick={reset} className="gap-2 rounded-full">
                <RotateCcw className="w-4 h-4" /> New Scan
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card-elevated p-8"
          >
            {preview ? (
              <div className="space-y-6 text-center">
                <div className="relative inline-block rounded-2xl overflow-hidden max-w-xs mx-auto shadow-lg">
                  <img src={preview} alt="Selfie preview" className="w-full h-auto" />
                  {preprocessing && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-medium text-foreground">Detecting face…</span>
                    </div>
                  )}
                </div>

                {/* Face detection status */}
                {!preprocessing && preprocessed && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    preprocessed.faceDetected
                      ? "bg-accent text-accent-foreground"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {preprocessed.faceDetected ? (
                      <>✓ Face aligned & normalized · {Math.round(preprocessed.confidence * 100)}% confidence</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3" /> No face detected</>
                    )}
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={reset} disabled={preprocessing} className="gap-2 rounded-full">
                    <RotateCcw className="w-4 h-4" /> Retake
                  </Button>
                  <Button variant="hero" onClick={analyzeSelfie} disabled={preprocessing} className="gap-2 rounded-full px-6">
                    <Sparkles className="w-4 h-4" /> Analyze Skin
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="scan-upload-zone text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                  <Upload className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-1.5">Upload a Selfie</h3>
                <p className="text-sm text-muted-foreground">Take or upload a clear face photo</p>
                <p className="text-xs text-muted-foreground mt-3 opacity-60">JPG, PNG · Max 5 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
