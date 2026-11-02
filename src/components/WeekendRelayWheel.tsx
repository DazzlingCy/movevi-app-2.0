import { useEffect, useRef, useState } from 'react';
import { drawsLeft, ownPieces, puzzleComplete, type PuzzleTeam, type RelayDraw } from '../journey/puzzleTeam';
import { WEEKEND_PRIZES } from '../journey/weekendRelay';
import styles from './WeekendRelayWheel.module.css';
export default function WeekendRelayWheel({team,onDraw,preview=false}:{team:PuzzleTeam;onDraw:(id:string)=>RelayDraw|undefined;preview?:boolean}) {
  const [rotation,setRotation]=useState(0),[spinning,setSpinning]=useState(false),[result,setResult]=useState<number|null>(null);
  const [error,setError]=useState('');
  const guard=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  useEffect(()=>{setRotation(0);setResult(null);setError('');setSpinning(false);guard.current=false;return()=>{if(timer.current)clearTimeout(timer.current);};},[team.id]);
  const unlocked=puzzleComplete(team),remaining=drawsLeft(team),history=team.draws.filter(d=>d.memberId==='self');
  const displayedResult=spinning?null:result??history[history.length-1]?.cents??null;
  const spin=()=>{
    if(guard.current||!remaining)return;
    guard.current=true;setError('');
    let draw:RelayDraw|undefined;
    try{draw=onDraw(team.id);}catch{guard.current=false;setError('暂时无法抽奖，请稍后重试。');return;}
    if(!draw){guard.current=false;setError('暂时无法抽奖，请稍后重试。');return;}
    setSpinning(true);setResult(null);
    const index=WEEKEND_PRIZES.findIndex(p=>p.cents===draw.cents);
    const target=(360-index*60-30+360)%360;
    setRotation(previous=>previous+(360-previous%360)%360+1440+target);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current=setTimeout(()=>{setResult(draw.cents);setSpinning(false);guard.current=false;},reduced?30:3200);
  };
  return <section className={styles.page} aria-label="周末现金大转盘">
    <div className={styles.chances}>
      {unlocked&&<p className={styles.contribution}>你完成 {ownPieces(team).length} 条，获得 {ownPieces(team).length} 次</p>}
      <p className={styles.intro}>{unlocked?'剩余':'抽奖机会'} <strong>{remaining}</strong> 次</p>
    </div>
    <div className={styles.frame}><span className={styles.pointer} aria-hidden="true"/><div className={styles.wheel} style={{transform:`rotate(${rotation}deg)`}} aria-hidden="true">
      {WEEKEND_PRIZES.map((p,i)=>{
        const angle=(i*60+30)*Math.PI/180;
        return <span className={styles.prize} key={p.cents} style={{left:`${50+31*Math.sin(angle)}%`,top:`${50-31*Math.cos(angle)}%`}}><b style={{transform:`rotate(${-rotation}deg)`}}>¥{(p.cents/100).toFixed(2)}</b></span>;
      })}
    </div><span className={styles.hub} aria-hidden="true"><span>现金</span><strong>大转盘</strong></span></div>
    <div className={styles.result} data-result={displayedResult!==null} role="status" aria-live="polite">
      {displayedResult!==null?<><span>{result!==null?'本次抽中':'最近抽中'}</span><strong><small>¥</small>{(displayedResult/100).toFixed(2)}</strong></>:<span>{spinning?'转盘转动中…':!unlocked?'小队共同完成 3 条路线后解锁':'转一下，收下这个周末的小惊喜'}</span>}
    </div>
    <button className={styles.button} disabled={!remaining||spinning} onClick={spin}>{spinning?'抽奖中…':!unlocked?'暂未解锁':remaining?'转一次':'本期机会已用完'}</button>
    {error&&<p className={styles.error} role="alert">{error}</p>}
    {history.length>0&&<section className={styles.history} aria-label="我的抽奖记录"><h3>我的抽奖记录</h3><ol>{history.slice().reverse().map((d,i)=><li key={d.id}><span>第 {history.length-i} 次</span><strong><small>¥</small>{(d.cents/100).toFixed(2)}</strong></li>)}</ol></section>}
    <details className={styles.rules}><summary>奖项与规则</summary><p>两人完成 3 条不同路线后，完成 2 条获得 2 次，完成 1 条获得 1 次。{preview?'当前为流程预览，重新进入活动或刷新将从头开始。':'进度与结果保存在本机，刷新不会重置，活动结束后保留未用机会。'}结果在转动前保存。</p><p>奖项金额：0.18 / 0.38 / 0.88 / 1.88 / 5.88 / 8.88 元。初始各 80 / 148 / 40 / 25 / 5 / 2 份，本机按剩余份数随机抽取。扇区大小不代表概率。</p></details>
    <p className={styles.note}>本机抽奖演示，尚未接入真实奖池或现金发放。</p>
  </section>;
}
