"use client";

import type { ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
      {children}
    </span>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border-b border-hairline bg-transparent px-0.5 py-1 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-ink ${className}`}
    />
  );
}

export function RangeRow({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5">
      <span className="w-24 shrink-0 text-[12px] text-ink-soft">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1"
      />
      <span className="w-14 shrink-0 text-right font-mono text-[11px] text-ink">
        {format ? format(value) : value}
      </span>
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={title}
      onClick={() => onChange(!checked)}
      className={`relative h-[18px] w-[32px] shrink-0 border transition-colors ${
        checked ? "border-navy bg-navy" : "border-hairline bg-paper-deep"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[12px] w-[12px] bg-paper transition-all ${
          checked ? "left-[16px]" : "left-[2px] bg-ink-faint"
        }`}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex border border-hairline">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2 py-0.5 text-[11px] tracking-wide transition-colors ${
            value === o.value
              ? "bg-ink text-paper"
              : "bg-transparent text-ink-soft hover:bg-paper-deep"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function IconButton({
  onClick,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="px-1 text-[12px] leading-none text-ink-faint hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-hairline px-2 py-1 text-[11px] tracking-wide text-ink-soft hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}
