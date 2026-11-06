import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import styles from './StickyHeroNav.module.css';

/** Keep photo-page navigation in the scroll container, outside the shorter hero. */
export default function StickyHeroNav({ children, transparent = false, overlapHero = true }: { children: ReactNode; transparent?: boolean; overlapHero?: boolean }) {
  return <nav className={`${styles.nav}${transparent ? ` ${styles.transparent}` : ''}${overlapHero ? '' : ` ${styles.inFlow}`}`} aria-label="页面导航">{children}</nav>;
}

export function HeroBackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button type="button" className={styles.back} onClick={onClick} aria-label={label}><ChevronLeft size={22} aria-hidden="true" /></button>;
}
