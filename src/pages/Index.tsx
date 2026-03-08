import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScanFace, Activity, History, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <ScanFace className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">SkinPulse</span>
        </div>
        <Link to="/auth">
          <Button variant="hero" size="sm">Get Started</Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="container max-w-3xl text-center py-20 space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Skin Analysis
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Know your skin.
            <br />
            <span className="text-primary">Own your glow.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Upload a selfie and get instant AI analysis of your skin health — wrinkles, pores, redness, pigmentation, and hydration scored 0–100.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-base px-8">
                Start Free Scan
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 pt-12">
            {[
              { icon: ScanFace, title: "AI Scan", desc: "Upload a selfie for instant skin analysis" },
              { icon: Activity, title: "Health Score", desc: "Get a 0–100 score across 5 key metrics" },
              { icon: History, title: "Track Progress", desc: "See how your skin improves over time" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6 text-center">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
