import { useMemo } from "react";

export function PasswordStrength({ value }: { value: string }) {
  const { score, label } = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[a-z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    const clamped = Math.min(s, 5);
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Strong"];
    return { score: clamped, label: labels[clamped] };
  }, [value]);

  return (
    <div className="mt-2">
      <progress
        className="progress w-full"
        max={5}
        value={score}
        aria-label="Password strength"
      />
      <p className="text-xs opacity-70 mt-1">Strength: {label}</p>
    </div>
  );
}
