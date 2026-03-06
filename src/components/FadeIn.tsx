import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "fade-up" | "slide-up" | "scale-in" | "fade-in";

interface FadeInProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
}

const variants = {
  "fade-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.93 },
    visible: { opacity: 1, scale: 1 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export const FadeIn = ({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  className,
}: FadeInProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration, delay, ease: "easeOut" }}
    variants={variants[variant]}
  >
    {children}
  </motion.div>
);
