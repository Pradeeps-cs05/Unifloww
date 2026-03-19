import { motion } from "framer-motion";
import { Sun } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/70 backdrop-blur-md shadow-md py-4 flex justify-center items-center"
    >
      <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
        <Sun className="w-6 h-6 text-yellow-500" /> Manager Dashboard
      </h1>
    </motion.header>
  );
}
