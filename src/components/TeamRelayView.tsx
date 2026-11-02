import WeekendRelayWheel from './WeekendRelayWheel';
import { weekendPeriod, periodOpen } from '../journey/weekendRelay';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Gift, Globe2, MapPin, Users, Award, X } from 'lucide-react';
import CityImage from './CityImage';
import Modal from './journey/Modal';
import { resolveLocalImage } from '../lib/localImages';
import { previewPuzzleHistory } from '../journey/puzzleHistory';
import { PUZZLE_LOBBY_LIMIT } from '../journey/puzzleDemo';
import { puzzleProgressFeedback } from '../journey/puzzleFeedback';
import { currentPuzzle, periodParticipation, openPuzzleTeams, ownPieces, puzzleComplete, drawsLeft, type RelayDraw, type PuzzleCity, type PuzzleRoute, type PuzzleState, type PuzzleTeam, type PuzzleMember } from '../journey/puzzleTeam';
import styles from './TeamRelayView.module.css';

interface Props {
  state: PuzzleState; cities: PuzzleCity[]; routes: PuzzleRoute[]; storageFailed: boolean;
  onBack: () => void; onCreate: (city: PuzzleCity) => boolean; onJoin: (teamId:string) => boolean; onDraw: (id: string) => RelayDraw | undefined; now: number;
  onRun: (route: PuzzleRoute) => void;
  onSimulatePartner?: (route: PuzzleRoute) => void;
  onSimulateJoin?: () => void;
  preview?: boolean;
}
const time = (n: number) => new Date(n).toLocaleString('zh-CN', { timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false });
const cityNames = (team: PuzzleTeam) => [...new Set(team.pieces.map(p => p.route.name))].join(' · ');

function Passport({ team, now }: { team?: PuzzleTeam; now: number }) {
  return <div className={styles.passport} aria-label={`本轮护照，已完成 ${team?.pieces.length ?? 0} 棒，共 3 棒`}>
    <div className={styles.passportHeading}><Globe2 size={21} /><span>MOVEVI · {team?.city.name??'城市'}护照</span><span>{team ? puzzleComplete(team) ? '已集齐' : now>=team.period.endsAt ? '本期结束' : '记忆收集中' : '待出发'}</span></div>
    <div className={styles.stamps}>{[0,1,2].map(i => {
      const piece = team?.pieces[i];
      return <div key={i} className={`${styles.stamp} ${piece ? styles.stamped : ''}`}>
        <span className={styles.stampNumber}>第 {i+1} 棒</span>
        {piece ? <><CityImage src={piece.route.image} alt="" /><strong>{piece.route.name}</strong><small>{team?.members.find(m => m.id === piece.memberId)?.name}</small><Check className={styles.stampCheck} size={14} /></>
          : <><MapPin size={23} /><strong>{i === (team?.pieces.length ?? 0) ? '下一站' : '待抵达'}</strong><small>{i === 0 ? '从你出发' : i === 1 ? '跑友来接力' : '一起完成'}</small></>}
      </div>;
    })}</div>
    <p>{team?.pieces.length ? cityNames(team) : '跑到哪里，就把哪里留在护照里。'}</p>
  </div>;
}

function MemberAvatar({member}:{member?:PuzzleMember}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[member?.avatarUrl]);
  return <span className={styles.memberAvatar} role="img" aria-label={member?member.name+'的头像':'等待搭子'}>{member?.avatarUrl&&!failed?<img src={resolveLocalImage(member.avatarUrl)} alt="" onError={()=>setFailed(true)}/>:member?member.name.slice(0,1):<Users size={18}/>}</span>;
}

export function RelayHistoryView({teams,now,onBack}:{teams:PuzzleTeam[];now:number;onBack:()=>void}) {
  const joinedAt=(t:PuzzleTeam)=>t.members.find(m=>m.id==='self')?.joinedAt??t.createdAt;
  const history=teams.filter(t=>t.members.some(m=>m.id==='self')).slice().sort((a,b)=>joinedAt(b)-joinedAt(a)||b.createdAt-a.createdAt);
  return <main className={`${styles.page} ${styles.historyPage}`}>
    <nav className={styles.nav} aria-label="活动记录导航"><button autoFocus onClick={onBack} aria-label="返回活动主页"><ChevronLeft size={22}/></button><span>活动记录</span><span aria-hidden="true"/></nav>
    <div className={styles.body}><div className={styles.historyHeading}><h1>历史参与</h1><span>{history.length} 条记录</span></div>
      {history.length?<div className={styles.historyList}>{history.map(t=>{
        const complete=puzzleComplete(t),ended=now>=t.period.endsAt;
        const status=complete?'已完成':t.archived?'旧版记录':ended?'未完成 · '+t.pieces.length+'/3':t.members.length<2?'待组队':'进行中 · '+t.pieces.length+'/3';
        return <article className={styles.historyCard} key={t.id} aria-label={t.city.name+'活动记录'}>
          <div className={styles.historyRecordHeading}>
            <time className={styles.historyDate} dateTime={new Date(joinedAt(t)).toISOString()}>{time(joinedAt(t))}</time>
            <span className={complete?styles.historyComplete:styles.historyStatus} data-state={complete?'complete':t.archived?'archived':ended?'ended':t.members.length<2?'waiting':'active'}>{status}</span>
          </div>
          <CityImage src={t.city.image} alt="" className={styles.historyCityPhoto}/>
          <div className={styles.historyContent}>
            <div className={styles.historyCity}><h2>{t.city.name}</h2></div>
            <div className={styles.historyMembers} aria-label="小队成员">{Array.from({length:Math.max(2,t.members.length)},(_,i)=>{const member=t.members[i];return <div key={member?.id??'empty'}><MemberAvatar member={member}/><span><strong>{member?.name??'等待搭子'}</strong><small>{member?ownPieces(t,member.id).length+' 条':'未加入'}</small></span></div>;})}</div>
          </div>
        </article>;
      })}</div>:<div className={styles.lobbyEmpty}><Users size={26}/><strong>还没有参加记录</strong><p>和搭子出发后，旅程会留在这里。</p></div>}
    </div>
  </main>;
}

function ActivityRules() {
  return <><ol className={styles.rules}>
    <li><strong>选城市，找搭子</strong><p>创建或加入两人小队，满员后出发。</p></li>
    <li><strong>各自跑，合计 3 条</strong><p>从小队城市选择 3 条不同路线，按 2＋1 完成，不必同时在线。</p></li>
    <li><strong>跑完一起抽奖</strong><p>全部完成后，完成 2 条路线可抽奖 2 次，完成 1 条路线可抽奖 1 次。</p></li>
  </ol><section className={styles.ruleDetails} aria-labelledby="relay-notice-title">
    <h3 id="relay-notice-title">参与须知</h3>
    <dl>
      <div><dt>活动时间</dt><dd>每周五 00:00 至周日 24:00（北京时间）。</dd></div>
      <div><dt>报名限制</dt><dd>每人每期仅一次机会，创建或加入后不能退出、换队或重复参加。</dd></div>
      <div><dt>路线要求</dt><dd>只计入满员后、本期内开始并完成的小队城市路线。</dd></div>
      <div><dt>完成计数</dt><dd>每人至少 1 条、最多 2 条；两人不可跑同一路线，小队内每条路线只计一次。</dd></div>
      <div><dt>活动到期</dt><dd>保留成果和已获得的抽奖机会。</dd></div>
    </dl>
    <p className={styles.prototypeNote}>当前为本机原型，跨设备组队、真实身份和现金发放尚未接入。</p>
  </section></>;
}

function LobbyTeam({team,eligible,canEnroll,periodActive,onJoin}:{team:PuzzleTeam;eligible:boolean;canEnroll:boolean;periodActive:boolean;onJoin:(id:string)=>void}) {
  return <button className={styles.lobbyTeam} disabled={!canEnroll||!eligible} onClick={()=>onJoin(team.id)} aria-label={'加入'+team.city.name+' · '+team.members[0].name+'的小队'}>
    <CityImage src={team.city.image} alt="" className={styles.lobbyPhoto}/>
    <span><strong>{team.city.name}</strong><small className={styles.lobbyHost}><MemberAvatar member={team.members[0]}/><span>{team.members[0].name}的小队 · 1/2 人</span></small></span>
    <b>{!eligible?'未解锁':canEnroll?'加入':periodActive?'已参与':'未开放'}</b>
  </button>;
}

export function RelayPlazaContent({teams,routes,canEnroll,periodActive,onJoin}:{teams:PuzzleTeam[];routes:PuzzleRoute[];canEnroll:boolean;periodActive:boolean;onJoin:(id:string)=>void}) {
  return <><p>{teams.length} 支小队正在找搭子</p>{teams.length?teams.map(t=><div key={t.id}><LobbyTeam team={t} eligible={routes.some(r=>r.id===t.city.id)} canEnroll={canEnroll} periodActive={periodActive} onJoin={onJoin}/></div>):<div className={styles.lobbyEmpty}><Users size={24}/><strong>暂时没有待加入的小队</strong><p>可以回到主页创建小队。</p></div>}</>;
}

export function RelayJoinConfirmation({onCancel,onConfirm,team}:{onCancel:()=>void;onConfirm:()=>void;team?:PuzzleTeam}) {
  return <Modal labelId="relay-join-title" onClose={onCancel} backdropClassName={styles.createBackdrop} className={styles.joinDialog}>
    <h2 id="relay-join-title">{team?'确认加入'+team.city.name+'小队？':'确认加入小队？'}</h2>
    <p>加入后，本期不能换队。</p>
    <div className={styles.joinActions}><button onClick={onCancel}>取消</button><button onClick={onConfirm}>确认加入</button></div>
  </Modal>;
}

export function RelayRoutesContent({team,routes,now,onRun,preview=false,onSimulatePartner,onLottery}:{team:PuzzleTeam;routes:PuzzleRoute[];now:number;onRun:(route:PuzzleRoute)=>void;preview?:boolean;onSimulatePartner?:(route:PuzzleRoute)=>void;onLottery?:()=>void}) {
  const own=ownPieces(team),complete=puzzleComplete(team),active=periodOpen(team.period,now),ready=team.members.length===2;
  const partner=team.members.find(member=>member.id!=='self');
  const cityRoutes=routes.filter(r=>r.id===team.city.id).slice().sort((a,b)=>a.routeIndex-b.routeIndex);
  if(complete)return <section aria-label={team.city.name+'城市路线'}>
    <div className={styles.routeCityBanner}><CityImage src={team.city.image} alt="" loading="eager"/><div><h3>{team.city.name}</h3><p>小队已完成 {team.pieces.length} 条 · 你完成 {own.length} 条</p></div></div>
    <p className={styles.teamStatus} role="status">小队已完成，大转盘已解锁。</p>
    <div className={styles.routeList}>{team.pieces.map(piece=>{
      const member=team.members.find(member=>member.id===piece.memberId);
      return <div className={styles.inlineRoute} key={piece.id}><CityImage src={piece.route.image} alt="" className={styles.routePhoto}/><span><strong>{piece.route.title}</strong><small>{piece.route.distanceKm} km · 约 {piece.route.minutes} 分钟</small></span><span className={`${styles.routeDone} ${styles.partnerDone}`}><Check size={13}/><span>{member?.name??'搭子'}已完成</span></span></div>;
    })}</div>
    {onLottery&&<div className={styles.routeRewardFooter}><button className={styles.primary} onClick={onLottery} aria-label="打开幸运大转盘">{drawsLeft(team)?'去抽奖 · 剩余 '+drawsLeft(team)+' 次':'查看抽奖记录'}<ChevronRight size={16}/></button></div>}
  </section>;
  return <section aria-label={team.city.name+'城市路线'}>
      <div className={styles.routeCityBanner}><CityImage src={team.city.image} alt="" loading="eager"/><div><h3>{team.city.name}</h3><p>{cityRoutes.length} 条可跑 · 你已完成 {own.length}/2 条</p></div></div>
      {(complete||!active||ready)&&<p className={styles.teamStatus} role="status">{complete?'小队已完成，大转盘已解锁。':!active?'本期已结束，路线记录已保留。':own.length>=2?'已完成 2 条，下一棒交给搭子。':'选一条路线，开始这次旅程。'}</p>}
      <div className={styles.routeList}>{cityRoutes.length?cityRoutes.map((r,index)=>{
        const done=own.some(p=>p.route.routeId===r.routeId),canRun=active&&ready&&!complete&&own.length<2&&!done;
        const partnerDone=team.pieces.some(p=>p.memberId!=='self'&&p.route.routeId===r.routeId);
        const partnerPreview=preview&&!!onSimulatePartner&&index===2&&ready&&active&&!complete;
        return <div className={styles.inlineRoute} key={r.routeId}><CityImage src={r.image} alt="" className={styles.routePhoto}/><span><strong>{r.title}</strong><small>{r.distanceKm} km · 约 {r.minutes} 分钟</small></span>{partnerDone?<span className={`${styles.routeDone} ${styles.partnerDone}`}><Check size={13}/><span>{partner?.name??'搭子'}已完成{done&&' · 你已完成'}</span></span>:done?<span className={styles.routeDone}><Check size={13}/>已完成</span>:partnerPreview?<button className={styles.partnerRun} onClick={()=>onSimulatePartner?.(r)} aria-label={'模拟好友完成：'+r.title}>模拟好友完成</button>:canRun?<button onClick={()=>onRun(r)} aria-label={'开始路线：'+r.title}>开始</button>:<span className={styles.routeUnavailable}>{complete?'已结束':!active?'本期结束':!ready?'待满员':'已达上限'}</span>}</div>;
      }):<p className={styles.teamStatus}>该城市暂时没有可跑路线。</p>}</div>
  </section>;
}

export default function TeamRelayView({state,cities,routes,storageFailed,onBack,onCreate,onJoin,onDraw,now,onRun,onSimulatePartner,onSimulateJoin,preview=false}:Props) {
  const period=weekendPeriod(now),periodActive=periodOpen(period,now);
  const participation=periodParticipation(state,period.id);
  const team=participation&&!participation.archived?participation:!periodActive?currentPuzzle(state):undefined;
  const myTeams=state.teams.filter(t=>t.members.some(m=>m.id==='self'));
  const complete=!!team&&puzzleComplete(team),own=team?ownPieces(team):[],count=team?.pieces.length??0;
  const displayMembers=team?team.members.slice().sort((a,b)=>Number(b.id==='self')-Number(a.id==='self')):[];
  const ready=!!team&&team.members.length===2;
  const ended=!!team&&now>=team.period.endsAt,canEnroll=periodActive&&!participation;
  const displayPeriod=team?.period??period;
  const stage=complete?'complete':ended?'ended':!ready?'waiting':own.length>=2?'waiting-partner':'active';
  const routeAction=complete?'查看已完成路线':ended?'查看本期路线':!ready?'查看城市路线':own.length>=2?'查看小队进度':'选择路线开启旅程';
  const outstandingTeams=myTeams.filter(t=>t.id!==team?.id&&drawsLeft(t)>0).sort((a,b)=>b.period.startsAt-a.period.startsAt);
  const outstandingDraws=outstandingTeams.reduce((sum,t)=>sum+drawsLeft(t),0);
  const canSimulateJoin=preview&&!!onSimulateJoin&&!!team&&!ready&&!ended&&!team.archived&&periodOpen(team.period,now);
  const available=openPuzzleTeams(state,now).filter(t=>!preview||routes.some(r=>r.id===t.city.id)).slice(0,PUZZLE_LOBBY_LIMIT);
  const [historyOpen,setHistoryOpen]=useState(false);
  const creatableCities=cities.filter(city=>routes.some(r=>r.id===city.id));
  const featuredCities=creatableCities.slice(0,3);
  const [createCityId,setCreateCityId]=useState('');
  const selectedCity=creatableCities.find(city=>city.id===createCityId);
  const [sheet,setSheet]=useState<'cities'|'reward'|'routes'|'lottery'|'plaza'|'join'|'draws'|null>(null);
  const [pendingJoinId,setPendingJoinId]=useState<string|null>(null),[joinOrigin,setJoinOrigin]=useState<'plaza'|null>(null);
  const [message,setMessage]=useState(''),[lotteryId,setLotteryId]=useState<string|null>(null);
  const pageRef=useRef<HTMLElement>(null);
  const previousTeam=useRef(team);
  useEffect(()=>{
    const feedback=puzzleProgressFeedback(previousTeam.current,team);
    if(team&&team.id!==previousTeam.current?.id){
      pageRef.current?.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
    previousTeam.current=team;
    if(feedback)setMessage(feedback);
  },[team]);
  const lotteryTeam=myTeams.find(t=>t.id===lotteryId)??team;
  const date=(n:number)=>new Date(n).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit'});
  useEffect(()=>{if(message){const timer=setTimeout(()=>setMessage(''),3600);return()=>clearTimeout(timer);}},[message]);
  const create=()=>{
    if(!selectedCity||!canEnroll)return;
    if(onCreate(selectedCity)){setSheet(null);setMessage(selectedCity.name+'小队创建成功，等待搭子加入。');}else setMessage('本期已参与或活动尚未开放，请查看当前小队。');
  };
  const openCreate=()=>{setCreateCityId('');setSheet('cities');};
  const requestJoin=(id:string)=>{
    if(!canEnroll)return;
    const target=available.find(t=>t.id===id);
    if(!target||!routes.some(r=>r.id===target.city.id)){setMessage('你还没有该城市的可跑路线，请选择其他小队。');return;}
    setPendingJoinId(id);setJoinOrigin(sheet==='plaza'?'plaza':null);setSheet('join');
  };
  const cancelJoin=()=>{setPendingJoinId(null);setSheet(joinOrigin);};
  const confirmJoin=()=>{
    const target=available.find(t=>t.id===pendingJoinId);
    if(!canEnroll||!target||!routes.some(r=>r.id===target.city.id)){
      cancelJoin();setMessage('小队已满、已过期或你本期已参加，请查看最新列表。');return;
    }
    if(onJoin(target.id)){setPendingJoinId(null);setSheet(null);setMessage('两人组队成功，现在可以开始路线。');}
    else {cancelJoin();setMessage('小队已满、已过期或你本期已参加，请查看最新列表。');}
  };
  const openLottery=(t:PuzzleTeam)=>{setLotteryId(t.id);setSheet('lottery');};
  if(historyOpen)return <RelayHistoryView teams={preview?previewPuzzleHistory(myTeams,cities,routes,now):myTeams} now={now} onBack={()=>setHistoryOpen(false)}/>;
  return <main ref={pageRef} className={`${styles.page} ${styles.homePage}`} data-modal-open={!!sheet}>
    <nav className={styles.nav} aria-label="活动导航"><button onClick={onBack} aria-label="返回活动"><ChevronLeft size={22}/></button><span>环球搭子小队</span><button onClick={()=>setHistoryOpen(true)}>活动记录</button></nav>

    <div className={styles.body}>
      <p className={styles.schedule}><span className={styles.scheduleLabel}>{ended?'本期已结束':'周末限定'}</span><span className={styles.scheduleDates}><time dateTime={new Date(displayPeriod.startsAt).toISOString()}>{date(displayPeriod.startsAt)}</time><span aria-hidden="true">—</span><time dateTime={new Date(displayPeriod.endsAt-1).toISOString()}>{date(displayPeriod.endsAt-1)}</time></span></p>
      {outstandingDraws>0&&<button className={styles.pendingRewards} onClick={()=>outstandingTeams.length===1?openLottery(outstandingTeams[0]):setSheet('draws')}><Gift size={18}/><span>往期还有 <strong>{outstandingDraws}</strong> 次抽奖机会</span><ChevronRight size={16}/></button>}
      {!team&&featuredCities.length>0&&<div className={styles.discoveryHero}>
        <div className={styles.heroPhotos} data-count={featuredCities.length} aria-hidden="true">{featuredCities.map(city=><div key={city.id}><CityImage src={city.image} alt="" loading="eager"/></div>)}</div>
        <div className={styles.heroCopy}><h1>一起跑，<br/>世界更近。</h1><p>各自开跑，也有搭子陪你坚持。</p></div>
      </div>}
      {!team&&!participation&&<section className={styles.createPanel} aria-labelledby="relay-create-title">
        <div className={styles.createHeading}><h2 id="relay-create-title">创建小队</h2><p>从你想去的城市出发</p></div>
        <button className={styles.primary} disabled={!canEnroll||!creatableCities.length} onClick={openCreate}>{!periodActive?'周五 00:00 开放':!creatableCities.length?'暂无可选城市':<>选择城市<ChevronRight size={16}/></>}</button>
      </section>}
      {team&&<section className={styles.inlineTeam} aria-labelledby="my-relay-team-title" data-complete={complete} data-stage={stage}>
        <div className={styles.teamCover}>
          <div className={styles.teamCoverHeading}><h2 id="my-relay-team-title">我的小队</h2><span className={styles.teamState} data-state={complete?'complete':ended?'ended':ready?'ready':'waiting'}>{complete&&<Check size={12}/>}{complete?'已完成':ended?'已结束':ready?'已组队':'等待搭子'}</span></div>
          <div className={styles.teamDestination}><CityImage src={team.city.image} alt="" className={styles.teamCityPhoto} loading="eager"/><div className={styles.teamCoverCopy}><p>{team.city.name}</p><div className={styles.coverProgress} role="progressbar" aria-label="小队路线进度" aria-valuemin={0} aria-valuemax={3} aria-valuenow={count}><span>已完成</span><strong>{count}<small> / 3 条路线</small></strong></div></div></div>
        </div>
        <div className={styles.teamContent}>
        <div className={styles.teamMembers} aria-label="小队成员">{[0,1].map(i=>{const member=displayMembers[i],contribution=member?ownPieces(team,member.id).length:0;return <div className={styles.teamMember} key={i} aria-label={member?member.name+'，已完成 '+contribution+' 条':'等待搭子加入'}><MemberAvatar member={member}/><span>{!member&&canSimulateJoin?<button className={styles.simulateJoin} aria-label="模拟搭子加入" onClick={()=>{onSimulateJoin?.();setMessage('搭子已加入，可以开始路线。');}}>模拟加入</button>:<strong>{member?.name??'等待搭子'}</strong>}{member&&<small><b>{contribution}</b> 条</small>}</span></div>;})}</div>
        {!complete&&(ended||own.length>=2)&&<p className={styles.teamStatus} role="status">{ended?'本期已结束，记录已保留。':'已完成 2 条，下一棒交给搭子。'}</p>}
        <button className={styles.allRoutesEntry} onClick={()=>setSheet('routes')}><span>{routeAction}</span><span>{stage==='waiting-partner'?count+'/3':(complete?count:routes.filter(r=>r.id===team.city.id).length)+' 条'}<ChevronRight size={16}/></span></button>
        <button className={styles.teamLottery} data-ready={complete&&drawsLeft(team)>0} onClick={()=>openLottery(team)} aria-label="查看幸运大转盘"><span className={styles.giftIcon}><Gift size={18}/></span><span><strong>幸运大转盘</strong>{complete&&<small>剩余 {drawsLeft(team)} 次</small>}</span><span className={`${styles.lotteryAction} ${!complete?styles.lotteryLocked:''}`}>{complete?(drawsLeft(team)?'立即抽奖':'查看记录'):ended?'本期未解锁':'完成 3 条后解锁'}<ChevronRight size={14}/></span></button>
        </div>
      </section>}
      <section className={styles.plaza} aria-labelledby="relay-plaza-title">
        <div className={styles.plazaHeading}><h2 id="relay-plaza-title">搭子广场</h2><button onClick={()=>setSheet('plaza')}>查看更多<ChevronRight size={14}/></button></div>
        {available.length?available.slice(0,3).map(t=><div key={t.id}><LobbyTeam team={t} eligible={routes.some(r=>r.id===t.city.id)} canEnroll={canEnroll} periodActive={periodActive} onJoin={requestJoin}/></div>):<div className={styles.lobbyEmpty}><Users size={25}/><strong>暂时没有待加入的小队</strong><p>{!periodActive?'周五再来找搭子。':canEnroll?'你可以先创建一支小队。':'稍后再来看看。'}</p></div>}
      </section>
      <section className={styles.homeRules} aria-labelledby="relay-rules-title"><h2 id="relay-rules-title">玩法说明</h2><ActivityRules/></section>
      {storageFailed&&<p role="alert" className={styles.error}>本次进度暂未保存，请保持页面打开。</p>}
    </div>
    {!sheet&&<div className={styles.toast} role="status" aria-live="polite" aria-atomic="true" data-visible={!!message}>{message}</div>}
    {sheet==='join'?<RelayJoinConfirmation team={state.teams.find(t=>t.id===pendingJoinId)} onCancel={cancelJoin} onConfirm={confirmJoin}/>:sheet&&<Modal labelId="relay-sheet-title" onClose={()=>setSheet(null)} backdropClassName={sheet==='cities'?styles.createBackdrop:undefined} className={sheet==='cities'?styles.createDialog:styles.sheet}>
      <div className={styles.sheetHeading}><h2 id="relay-sheet-title">{{plaza:'搭子广场',cities:'选一座城市',reward:'本期成果',routes:complete?'已完成路线':'全部路线',lottery:'搭子大转盘',draws:'待使用的抽奖机会'}[sheet]}</h2><button onClick={()=>setSheet(null)} aria-label="关闭"><X size={20}/></button></div>
      {sheet==='cities'?<><div className={styles.choices}>{creatableCities.map(city=><button key={city.id} aria-pressed={createCityId===city.id} className={createCityId===city.id?styles.citySelected:undefined} onClick={()=>setCreateCityId(city.id)}><CityImage src={city.image} alt="" className={styles.choicePhoto}/><span><strong>{city.name}</strong><small>{routes.filter(r=>r.id===city.id).length} 条可跑路线</small></span>{createCityId===city.id&&<Check size={18}/>}</button>)}</div>{!creatableCities.length&&<p>暂无可选城市。</p>}<p className={styles.note}>创建后，本期不能换城市或小队。</p><button className={`${styles.primary} ${styles.createConfirm}`} disabled={!selectedCity||!canEnroll} onClick={create}>{selectedCity?'创建'+selectedCity.name+'小队':'请选择城市'}</button></>
      :sheet==='plaza'?<RelayPlazaContent teams={available} routes={routes} canEnroll={canEnroll} periodActive={periodActive} onJoin={requestJoin}/>
      :sheet==='draws'?<div className={styles.pendingList}>{outstandingTeams.map(t=><button key={t.id} onClick={()=>openLottery(t)}><CityImage src={t.city.image} alt=""/><span><strong>{t.city.name}</strong><small>{date(t.period.startsAt)}—{date(t.period.endsAt-1)}</small></span><b>{drawsLeft(t)} 次</b><ChevronRight size={16}/></button>)}</div>
      :sheet==='lottery'&&lotteryTeam?<WeekendRelayWheel team={lotteryTeam} onDraw={onDraw} preview={preview}/>
      :sheet==='routes'&&team?<RelayRoutesContent team={team} routes={routes} now={now} preview={preview} onSimulatePartner={onSimulatePartner} onLottery={()=>openLottery(team)} onRun={route=>{if(!preview)setSheet(null);onRun(route);}}/>
      :sheet==='reward'?<>{team&&<Passport team={team} now={now}/>}<div className={styles.badge}><Award size={32}/><span><strong>环球同行者</strong><small>{complete?'本期限定徽章 · 已获得':'两人集齐三站后获得'}</small></span></div><div className={styles.rewardAmount}><span>按路线贡献抽奖<small>完成 2 条 → 2 次，完成 1 条 → 1 次</small></span><strong>{complete?own.length:'2＋1'} 次</strong></div>{complete&&team?<button className={styles.primary} onClick={()=>openLottery(team)}>立即抽奖 · 剩余 {drawsLeft(team)} 次</button>:<p>{ended?'本期已结束，未集齐不发放机会':'已完成 '+count+'/3 条，全部完成后一起解锁'}</p>}<p className={styles.note}>转盘为本机原型，尚未接入真实奖池和现金发放。</p></>:null}
      <div className={styles.toast} role="status" aria-live="polite" aria-atomic="true" data-visible={!!message}>{message}</div>
    </Modal>}
  </main>;
}
