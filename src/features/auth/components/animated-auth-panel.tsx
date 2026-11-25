import { resize } from "motion";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const spring: Transition = { type: "spring", duration: 0.5, bounce: 0 };
const instant: Transition = { duration: 0 };
const panelVariants = {
  enter: (direction: number) => ({ x: 24 * direction, opacity: 0 }),
  active: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: -24 * direction, opacity: 0 }),
};

export function AnimatedAuthPanel({
  step,
  direction,
  children,
}: {
  step: string;
  direction: 1 | -1;
  children: ReactNode;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const content = measureRef.current;
    if (content && !reducedMotion) {
      return resize(content, (_, { height }) => setHeight(height));
    }
  }, [reducedMotion]);

  const transition = reducedMotion ? instant : spring;

  return (
    <motion.div
      className="-mx-1 -my-1 overflow-hidden"
      initial={false}
      animate={{ height: reducedMotion ? "auto" : (height ?? "auto") }}
      transition={transition}
    >
      <div ref={measureRef} className="relative p-1">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={panelVariants}
            initial={reducedMotion ? false : "enter"}
            animate="active"
            exit="exit"
            transition={transition}
          >
            <PanelContent>{children}</PanelContent>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PanelContent({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  return (
    <div inert={!isPresent} aria-hidden={!isPresent || undefined}>
      {children}
    </div>
  );
}
