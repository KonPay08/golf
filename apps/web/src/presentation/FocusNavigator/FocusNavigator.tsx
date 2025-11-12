import { forwardRef } from "react";
import { motion } from "motion/react";

export type FocusNavigatorProps = {
  direction: "up" | "down";
  onClick: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

const FocusNavigator = forwardRef<HTMLButtonElement, FocusNavigatorProps>(
  function FocusNavigator(
    {
      direction,
      onClick,
      disabled = false,
      "aria-label": ariaLabel,
    },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-label={ariaLabel || (direction === "up" ? "前のホールへ" : "次のホールへ")}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={[
          "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg",
          disabled
            ? "bg-gray-300/40 cursor-not-allowed"
            : "bg-gray-400/80 active:scale-95",
        ].join(" ")}
      >
      {direction === "up" ? (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      </motion.button>
    );
  }
);

export default FocusNavigator;
