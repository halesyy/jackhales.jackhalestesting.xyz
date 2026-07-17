import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type motionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  viewportAmount?: "some" | "all" | number;
};

export function Reveal({ children, className, delay = 0, viewportAmount = 0.12 }: motionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: motionProps) {
  const reduceMotion = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };

  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.08 }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: motionProps) {
  const reduceMotion = useReducedMotion();
  const variants: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

export const MotionLink = motion.a;
export const MotionDiv = motion.div;
