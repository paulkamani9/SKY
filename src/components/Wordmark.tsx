/**
 * The SKY wordmark. Uppercase and widely letter-spaced, matching the way the
 * printed menu sets it as "S K Y". The shine lives in .sky-wordmark.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`sky-wordmark inline-block font-semibold uppercase ${className}`}
      style={{ letterSpacing: "0.32em" }}
    >
      SKY
    </span>
  );
}
