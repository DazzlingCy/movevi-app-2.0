import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './CoinRewardBadge.module.css';
import { useEdgeDrag } from './useEdgeDrag';

function LiveCoinDigits({ coins, from }: { coins: number; from?: number }) {
  const digits = String(coins);
  const previousDigits = String(from ?? coins).padStart(digits.length, ' ');
  return (
    <strong className={styles.liveDigits} key={coins}>
      {Array.from(digits, (digit, index) => (
        <span className={styles.digit} key={index}>
          {digit === previousDigits[index] ? digit : (
            <span className={styles.rollingDigit}><span>{previousDigits[index]}</span><span>{digit}</span></span>
          )}
        </span>
      ))}
    </strong>
  );
}

export default function CoinRewardBadge({ coins, fraction, className = '', variant = 'estimate' }: {
  coins: number;
  fraction: number;
  className?: string;
  variant?: 'live' | 'estimate' | 'receipt';
}) {
  const receipt = variant === 'receipt';
  const live = variant === 'live';
  const { ref, position, dragging, ...dragHandlers } = useEdgeDrag(live);
  const previous = useRef(coins);
  const [change, setChange] = useState<{ from: number; to: number } | null>(null);

  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = coins;
    if (coins > from) setChange({ from, to: coins });
  }, [coins]);

  useEffect(() => {
    if (!change) return;
    // Keep the old digit mounted through the last coin's landing and the roll.
    const timer = window.setTimeout(() => setChange(null), live ? 1450 : 1200);
    return () => window.clearTimeout(timer);
  }, [change, live]);

  const percent = Math.round(fraction * 100);
  const increment = change?.to === coins ? change : null;
  const burst = receipt ? coins : increment ? coins - increment.from : 0;

  return (
    <div ref={ref} className={`${styles.badge} ${receipt ? styles.receipt : className} ${live ? styles.draggable : ''}`}
      data-variant={variant} data-dragging={dragging}
      style={live && position ? { left: position.x, top: position.y, right: 'auto' } : undefined}
      tabIndex={live ? 0 : undefined} aria-label={live ? '运动金币浮窗，可拖动贴边，方向键调整位置' : undefined}
      {...(live ? dragHandlers : {})}>
      <div className={styles.ring} style={{ '--coin-reward-fill': `${fraction * 100}%` } as CSSProperties}
        role={receipt ? undefined : 'progressbar'} aria-label={receipt ? undefined : '运动金币进度'}
        aria-valuenow={receipt ? undefined : percent}
        aria-valuetext={receipt ? undefined : live ? `本公里 ${percent}%，按里程换算 ${coins} 金币，以结算为准` : `${percent}%，预计 ${coins} 金币`}>
        <span className={styles.packet} aria-hidden="true">
          <span className={styles.seal}>✦</span>
          {live ? <LiveCoinDigits coins={coins} from={increment?.from} />
            : <strong key={coins} data-counting={burst > 0}>{receipt ? '+' : ''}{coins}</strong>}
        </span>
      </div>
      {!live && (
        <span className={styles.caption} role={receipt ? 'status' : undefined}>
          {receipt ? <><span className={styles.srOnly}>获得 {coins} 金币，</span>金币已入账</> : '预计金币'}
        </span>
      )}
      {burst > 0 && (
        <span className={styles.burst} key={coins} aria-hidden="true">
          <i>✦</i><i>✦</i><i>✦</i>
          {live ? <span className={styles.landingGlow} /> : !receipt && <b>+{burst}</b>}
        </span>
      )}
    </div>
  );
}
