import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScanFace, Activity, History, Sparkles, ArrowRight, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Index = () => {
  return (
    <div className="page-container flex flex-col">
      {/* Nav */}
      <header className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-sm">
            <ScanFace className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">SkinPulse</span>
        </div>
        <Link to="/auth">
          <Button variant="hero" size="sm" className="rounded-full px-5">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="container max-w-3xl text-center py-16 sm:py-24 space-y-10">
          <motion.div
            custom={0} initial="hidden" animate="visible" variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Skin Analysis
          </motion.div>

          <motion.h1
            custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="font-display text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Know your skin.
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(172,55%,48%)] bg-clip-text text-transparent">
              Own your glow.
            </span>
          </motion.h1>

          <motion.p
            custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Upload a selfie and get instant AI analysis of your skin health — wrinkles, pores, redness, pigmentation, and hydration scored 0–100.
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-base px-10 rounded-full h-12 shadow-lg">
                Start Free Scan <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="grid sm:grid-cols-3 gap-4 pt-8"
          >
            {[
              { icon: ScanFace, title: "AI Scan", desc: "Instant skin analysis from a single selfie" },
              { icon: Activity, title: "Health Score", desc: "0–100 score across 5 dermatology metrics" },
              { icon: History, title: "Track Progress", desc: "Monitor how your skin improves over time" },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={5 + i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="glass-card p-6 text-center group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust bar */}
          <motion.div
            custom={8} initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Private & Secure</span>
            <span className="w-px h-4 bg-border" />
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Results in seconds</span>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
