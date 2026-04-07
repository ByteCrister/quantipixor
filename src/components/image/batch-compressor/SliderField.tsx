"use client";

export default function SliderField({
    label,
    value,
    min,
    max,
    step,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
  }) {
    return (
      <div>
        <p className="mb-1 text-xs text-[#141414]/65 dark:text-white/60">{label}</p>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-[#1856FF]"
        />
      </div>
    );
  }