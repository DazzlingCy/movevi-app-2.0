import { useState } from 'react';
import { UsersRound, UserRound } from 'lucide-react';
import { getRouteRunners } from '../data/routeRunners';
import styles from './RouteRunners.module.css';
import { resolveLocalImage } from '../lib/localImages';

function RunnerAvatar({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <UserRound size={15} /> : <img src={resolveLocalImage(src)} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}

export default function RouteRunners({ count, avatars, compact = false }: { count?: number; avatars?: readonly string[]; compact?: boolean }) {
  const runners = getRouteRunners(count, avatars);
  return <span className={`${styles.group} ${compact ? styles.compact : ''}`}>
    <span className={styles.avatars} aria-hidden="true">
      {runners.avatars.length ? runners.avatars.map((src, index) => <span className={styles.avatar} key={`${src}-${index}`}><RunnerAvatar src={src} /></span>) : <UsersRound size={17} />}
    </span>
    <span className={styles.label}>{runners.label}</span>
  </span>;
}
