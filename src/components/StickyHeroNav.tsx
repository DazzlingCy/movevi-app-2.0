import type { ReactNode } from 'react';
import styles from './StickyHeroNav.module.css';

/** Keep photo-page navigation in the scroll container, outside the shorter hero. */
export default function StickyHeroNav({ children, transparent = false }: { children: ReactNode; transparent?: boolean }) {
  return <nav className={`${styles.nav}${transparent ? ` ${styles.transparent}` : ''}`} aria-label="页面导航">{children}</nav>;
}
