import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Check, Clock3, Flame, Footprints, Pencil, Play, X } from 'lucide-react';
import type { RunResult } from '../../journey/types';
import { dailyGoalPercentage, DEFAULT_DAILY_GOAL_KM, isValidDailyGoal } from '../../journey/dailyExercise';
import Modal from './Modal';
import styles from './HomeRunElements.module.css';

// Retain the last visible progress while the city list and run screens are open.
const seenCityProgress = new Map<string, number>();
const distanceFormatter = new Intl.NumberFormat('zh-CN', { minimumFractionDigits:1, maximumFractionDigits:3, useGrouping:false });

export function RunIcon({ animated = false }: { animated?: boolean }) {
  return <svg className={animated ? styles.runningFigure : undefined} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="15" cy="4" r="2" />
    <path d="m12 9-2 6" />
    <path className={styles.frontArm} d="m12 9 4 3 4-1" />
    <path className={styles.backArm} d="m12 9-3 4H5" />
    <path className={styles.frontLeg} d="m10 15 4 3-1 4" />
    <path className={styles.backLeg} d="m10 15-4 3-3-1" />
  </svg>;
}

export function CityRunProgress({ cityName, completed, total, current }: { cityName: string; completed: number; total: number; current: boolean }) {
  const count = Math.min(total, Math.max(0, completed));
  const finished = total > 0 && count === total;
  const progress = total > 0 ? count / total : 0;
  const marker = useRef<HTMLSpanElement>(null);
  const previous = useRef(seenCityProgress.get(cityName) ?? count);
  useEffect(() => {
    if (count > previous.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !marker.current?.closest('[data-reduced-motion="true"]')) {
      marker.current?.animate([{ translate: '0 0' }, { translate: '0 -4px' }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' });
    }
    previous.current = count;
    seenCityProgress.set(cityName, count);
  }, [cityName, count]);

  return <div className={styles.track} data-state={finished ? 'completed' : current ? 'current' : 'locked'} role="progressbar" aria-label={`${cityName}跑步路线进度`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={count} aria-valuetext={`已完成 ${count} / ${total} 条路线`}>
    <div className={styles.lanes} aria-hidden="true"><div className={styles.segments} style={{ gridTemplateColumns: `repeat(${Math.max(1,total)}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }, (_, index) => <i key={index} data-complete={index < count} />)}
    </div></div>
    {(current || finished) && <span ref={marker} className={styles.runner} style={{ left: `calc(${progress * 100}% + ${8 - 42 * progress}px)` } as CSSProperties} aria-hidden="true">{finished ? <Check /> : <RunIcon animated />}</span>}
    <svg className={styles.finish} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22V3h15v11H4" />
      <path d="M4 3h5v5H4zm5 5h5v6H9zm5-5h5v5h-5z" fill="currentColor" stroke="none" />
    </svg>
  </div>;
}

function DailyGoalRing({ distanceKm, goalKm, animate }: { distanceKm: number; goalKm: number; animate: boolean }) {
  const percentage = dailyGoalPercentage(distanceKm, goalKm);
  const state = percentage === 100 ? 'complete' : distanceKm <= 0 ? 'empty' : 'active';
  const fill = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!animate || percentage === 0 || motion.matches || fill.current?.closest('[data-reduced-motion="true"]')) return;
    const animation = fill.current?.animate([{ strokeDashoffset:100 }, { strokeDashoffset:100 - percentage }], { duration:2000, easing:'cubic-bezier(.3,0,.2,1)' });
    const cancel = () => animation?.cancel();
    motion.addEventListener('change', cancel);
    return () => { cancel(); motion.removeEventListener('change', cancel); };
  }, [percentage, goalKm, animate]);
  return <div className={styles.goalRing} data-state={state} data-complete={percentage === 100} role="progressbar" aria-label="今日里程目标" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={`${state === 'empty' ? '尚未开始，' : state === 'complete' ? '目标已达成，' : ''}已完成 ${percentage}%，今日 ${distanceKm} 公里，目标 ${goalKm} 公里`}>
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <circle className={styles.goalTrack} cx="30" cy="30" r="25" />
      <circle ref={fill} className={styles.goalFill} cx="30" cy="30" r="25" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - percentage} strokeOpacity={percentage > 0 ? 1 : 0} />
    </svg>
    <div className={styles.goalValue} aria-hidden="true"><strong>{percentage}<small>%</small></strong>
      {state === 'empty' && <span className={styles.goalStatus}><Play aria-hidden="true" />待开始</span>}
      {state === 'complete' && <span className={styles.goalStatus}><Check aria-hidden="true" />已达成</span>}
    </div>
  </div>;
}

export function TodayExerciseSummary({ today, goalKm, animate, onEdit }: { today: RunResult; goalKm: number; animate: boolean; onEdit: () => void }) {
  const distance = distanceFormatter.format(today.distanceKm);
  const state = today.distanceKm >= goalKm ? 'complete' : today.distanceKm <= 0 ? 'empty' : 'active';
  return <section className={styles.dailySummary} data-state={state} role="group" aria-label="今日运动数据">
        <button className={styles.editGoalAction} type="button" aria-label={`编辑今日目标，当前 ${goalKm} 公里`} aria-haspopup="dialog" onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); onEdit(); }} />
        <span className={styles.dailyLabel}>今日运动<Pencil aria-hidden="true" /></span>
        <DailyGoalRing distanceKm={today.distanceKm} goalKm={goalKm} animate={animate} />
        <strong className={styles.dailyDistance} aria-label={`今日跑步 ${distance} 公里`}>{distance}<small>km</small></strong>
        <span className={styles.dailyTarget}>目标 {goalKm} km</span>
    </section>;
}

export function DailyGoalEditor({ goalKm, onSave, onClose }: { goalKm: number; onSave: (value: number) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(String(goalKm));
  const [error, setError] = useState('');
  const id = useId();
  return <div className={styles.goalLayer}><Modal labelId={`${id}-title`} onClose={onClose} className={styles.goalEditor}>
    <form noValidate onSubmit={event => {
      event.preventDefault();
      const value = Number(draft);
      if (!isValidDailyGoal(value)) { setError('请输入 0.1–100 公里，最多一位小数'); return; }
      onSave(value);
    }}>
      <header><h2 id={`${id}-title`}>今日运动目标</h2><button type="button" className={styles.closeGoal} aria-label="关闭目标设置" onClick={onClose}><X aria-hidden="true" /></button></header>
      <label htmlFor={`${id}-distance`}>里程目标</label>
      <div className={styles.goalInput}><input id={`${id}-distance`} type="number" inputMode="decimal" min="0.1" max="100" step="0.1" value={draft} onChange={event => { setDraft(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} /><span>公里</span></div>
      <div className={styles.goalPresets} role="group" aria-label="快捷目标">{[3,DEFAULT_DAILY_GOAL_KM,10].map(value => <button type="button" key={value} aria-pressed={Number(draft) === value} onClick={() => { setDraft(String(value)); setError(''); }}>{value} 公里</button>)}</div>
      {error && <p id={`${id}-error`} className={styles.goalError} role="alert">{error}</p>}
      <button className={styles.saveGoal} type="submit">保存目标</button>
    </form>
  </Modal></div>;
}

export function HomeSportStats({ cumulative, completed }: { cumulative: RunResult; completed: boolean }) {
  return <div className={styles.cityTotals} data-complete={completed} role="group" aria-label="城市累计运动数据">
      <div><span><Footprints aria-hidden="true" />里程</span><strong aria-label={`累计里程 ${cumulative.distanceKm.toFixed(1)} 公里`}>{cumulative.distanceKm.toFixed(1)}<small>km</small></strong></div>
      <div><span><Clock3 aria-hidden="true" />时长</span><strong aria-label={`累计时长 ${(cumulative.durationSeconds / 3600).toFixed(1)} 小时`}>{(cumulative.durationSeconds / 3600).toFixed(1)}<small>h</small></strong></div>
      <div><span><Flame aria-hidden="true" />消耗</span><strong aria-label={`累计消耗 ${Math.round(cumulative.calories)} 千卡`}>{Math.round(cumulative.calories).toLocaleString('zh-CN')}<small>kcal</small></strong></div>
      </div>;
}
