import { forwardRef } from "react";
import { motion } from "motion/react";

export type ScoreInputProps = {
  value?: number;
  par: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

const ScoreInput = forwardRef<HTMLDivElement, ScoreInputProps>(
  function ScoreInput(
    {
      value,
      par,
      onChange,
      min = 1,
      max = 15,
    },
    ref
  ) {
  const handleDecrement = () => {
    if (value === undefined) {
      onChange(par);
    } else if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value === undefined) {
      onChange(par);
    } else if (value < max) {
      onChange(value + 1);
    }
  };

  const canDecrement = value === undefined || value > min;
  const canIncrement = value === undefined || value < max;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="flex items-center gap-4 bg-white px-2 py-2 rounded-2xl shadow-xl"
    >
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          aria-label="スコアを減らす"
          className={[
            "text-6xl font-light leading-none px-8 py-6 rounded-lg",
            canDecrement
              ? "text-gray-700 active:scale-95 active:bg-gray-100"
              : "text-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          −
        </button>

        {/* Value Display */}
        <div className="min-w-20 text-center px-6">
          {value !== undefined ? (
            <span className="text-5xl font-medium text-gray-900 num-tabular">
              {value}
            </span>
          ) : (
            <motion.span
              className="text-5xl font-medium text-gray-900 num-tabular"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              {par}
            </motion.span>
          )}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          aria-label="スコアを増やす"
          className={[
            "text-6xl font-light leading-none px-8 py-6 rounded-lg",
            canIncrement
              ? "text-gray-700 active:scale-95 active:bg-gray-100"
              : "text-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          +
        </button>
    </motion.div>
  );
  }
);

export default ScoreInput;
