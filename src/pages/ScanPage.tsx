import { AppNav } from "@/components/AppNav";
import { SelfieScanner } from "@/components/SelfieScanner";

const ScanPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container py-8 max-w-xl space-y-6">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold">Skin Scan</h1>
          <p className="text-muted-foreground">Upload a clear selfie for AI analysis</p>
        </div>
        <SelfieScanner />
      </main>
    </div>
  );
};

export default ScanPage;
