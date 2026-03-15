// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

type LoadingBirdProps = {
  className?: string;
  alt?: string;
  duration?: string;
};

export default function LoadingBird({
  className = "",
  alt = "Loading",
  duration = "500ms",
}: LoadingBirdProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/assets/quackythebird/flying_nobg.png"
        alt={alt}
        className="w-48 h-48 object-contain mx-auto mt-3"
        style={{ animation: `spin ${duration} linear infinite` }}
      />
    </div>
  );
}
