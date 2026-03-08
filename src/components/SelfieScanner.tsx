import { useState, useRef } from "react";
import { Upload, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MetricsPanel } from "./MetricsPanel";
import type { Scan } from "@/hooks/useScans";

export const SelfieScanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const analyzeSelfie = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) return;

    setAnalyzing(true);
    try {
      const file = fileInputRef.current.files[0];
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("selfies")
        .upload(filePath, file);
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

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 text-center">
        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block rounded-xl overflow-hidden max-w-xs mx-auto">
              <img src={preview} alt="Selfie preview" className="w-full h-auto" />
              {analyzing && (
                <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-primary-foreground">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="hero-outline"
                onClick={() => { setPreview(null); setResult(null); }}
                disabled={analyzing}
              >
                Retake
              </Button>
              <Button variant="hero" onClick={analyzeSelfie} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Analyze Skin
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-primary/30 rounded-xl p-12 cursor-pointer hover:border-primary/60 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary/60" />
            <h3 className="font-display text-lg font-semibold mb-1">Upload a Selfie</h3>
            <p className="text-sm text-muted-foreground">Take or upload a clear face photo for analysis</p>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 5MB</p>
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
      </div>

      {result && <MetricsPanel scan={result} />}
    </div>
  );
};
