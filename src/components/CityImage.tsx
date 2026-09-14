import { useEffect, useMemo, useState } from 'react';
import type { HTMLAttributeReferrerPolicy } from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '../lib/utils';

interface CityImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

const cityGradientStops = [
  ['rgba(34,211,238,0.28)', 'rgba(15,23,42,0.92)'],
  ['rgba(52,211,153,0.26)', 'rgba(8,47,73,0.9)'],
  ['rgba(250,204,21,0.22)', 'rgba(30,41,59,0.92)'],
  ['rgba(129,140,248,0.24)', 'rgba(15,23,42,0.92)']
];

function getGradientIndex(label: string) {
  return Array.from(label).reduce((sum, char) => sum + char.charCodeAt(0), 0) % cityGradientStops.length;
}

export default function CityImage({ src, alt, className, fallbackLabel, referrerPolicy = 'no-referrer' }: CityImageProps) {
  const [failed, setFailed] = useState(false);
  const label = fallbackLabel || alt || 'CITY';

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const gradient = useMemo(() => {
    const [accent, base] = cityGradientStops[getGradientIndex(label)];
    return `radial-gradient(circle at 34% 26%, ${accent}, transparent 34%), linear-gradient(135deg, ${base}, rgba(2,6,23,0.96))`;
  }, [label]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        referrerPolicy={referrerPolicy}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      aria-label={alt}
      className={cn('flex items-center justify-center overflow-hidden bg-slate-950', className)}
      style={{ background: gradient }}
    >
      <div className="flex flex-col items-center gap-2 text-center text-cyan-50/90">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100/20 bg-white/10 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
          <Landmark size={22} />
        </div>
        <span className="max-w-[110px] px-2 text-xs font-black leading-tight tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}
