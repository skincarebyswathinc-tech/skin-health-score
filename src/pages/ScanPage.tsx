import { AppNav } from "@/components/AppNav";
import { SelfieScanner } from "@/components/SelfieScanner";
import { motion } from "framer-motion";

const ScanPage = () => {
  return (
    <div className="page-container">
      <AppNav />
      <main className="page-content max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Skin Scan</h1>
          <p className="page-subtitle">Upload a clear selfie for AI analysis</p>
        </motion.div>
        <SelfieScanner />
      </main>
    </div>
  );
};

export default ScanPage;
