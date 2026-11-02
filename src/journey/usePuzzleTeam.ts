import { useEffect, useRef, useState } from 'react';
import { drawPuzzle, createPuzzle, finishPuzzle, joinPuzzle, PUZZLE_STORAGE, PUZZLE_DEMO_STORAGE, readPuzzle, type PuzzleCity, type PuzzlePiece, type PuzzleState, type RelayDraw } from './puzzleTeam';
import { weekendPeriod } from './weekendRelay';
import { PUZZLE_DEMO_CLOCK, createPuzzlePreviewSession, finishPuzzleDemoPartner, joinPuzzleDemoPartner, puzzleDemoPeriodTime, seedPuzzleDemoLobby, unjoinedPuzzleWeekend } from './puzzleDemo';
import type { PuzzleRoute } from './puzzleTeam';
export function usePuzzleTeam(demo=false,cities:PuzzleCity[]=[]) {
  const storageKey=demo?PUZZLE_DEMO_STORAGE:PUZZLE_STORAGE;
  const [initialPreview]=useState(()=>demo?createPuzzlePreviewSession(cities,Date.now()):null);
  const [state,setState]=useState(()=>initialPreview?.state??readPuzzle(undefined,storageKey)), latest=useRef(state);
  useEffect(()=>{
    const restored=demo&&initialPreview?initialPreview.state:readPuzzle(undefined,storageKey);
    latest.current=restored;setState(restored);
    if(demo)try{localStorage.setItem(storageKey,JSON.stringify(restored));}catch{setStorageFailed(true);}
  },[storageKey]);
  const [storageFailed,setStorageFailed]=useState(false);
  const realNow=Date.now();
  const [initialTime]=useState(()=>initialPreview?.now??realNow);
  const offset=useRef(initialTime-realNow);
  const [,tick]=useState(0);
  useEffect(()=>{const timer=setInterval(()=>tick(n=>n+1),15000);return()=>clearInterval(timer);},[]);
  const now=()=>Date.now()+offset.current;
  useEffect(()=>{
    if(!demo)return;
    const savedAt=Date.now();
    try{localStorage.setItem(PUZZLE_DEMO_CLOCK,JSON.stringify({time:savedAt+offset.current,savedAt,sceneVersion:1}));}catch{setStorageFailed(true);}
  },[demo]);
  const setDemoTime=(time:number)=>{
    if(!demo)return;
    const savedAt=Date.now();offset.current=time-savedAt;
    try{localStorage.setItem(PUZZLE_DEMO_CLOCK,JSON.stringify({time,savedAt,sceneVersion:1}));}catch{setStorageFailed(true);}
    tick(n=>n+1);
  };
  const update=(fn:(s:PuzzleState)=>PuzzleState)=>{
    const next=fn(latest.current);
    if(next!==latest.current){latest.current=next;setState(next);try{localStorage.setItem(storageKey,JSON.stringify(next));setStorageFailed(false);}catch{setStorageFailed(true);}}
    return next;
  };
  const simulateJoin=()=>update(s=>demo?joinPuzzleDemoPartner(s,now()):s);
  const citySignature=JSON.stringify(cities),periodId=weekendPeriod(now()).id;
  useEffect(()=>{
    if(demo)update(s=>seedPuzzleDemoLobby(s,cities,now()));
  },[demo,citySignature,periodId,state]);
  return {state,storageFailed,now,
    restartPreview:()=>{
      if(!demo)return;
      const session=createPuzzlePreviewSession(cities,Date.now());
      setDemoTime(session.now);update(()=>session.state);
    },
    demoFinishPartner:(route:PuzzleRoute)=>{
      if(demo)update(s=>finishPuzzleDemoPartner(s,now(),route));
    },
    create:(city:PuzzleCity)=>{
      const before=latest.current;return update(s=>createPuzzle(s,city,crypto.randomUUID(),now()))!==before;
    },
    join:(teamId:string)=>{
      const before=latest.current;return update(s=>joinPuzzle(s,teamId,{id:'self',name:'你',joinedAt:now()}))!==before;
    },
    demoLobby:(city:PuzzleCity)=>update(s=>{
      if(!demo||!city)return s;
      const period=weekendPeriod(now());
      const names=['小林','阿禾','小川','小岚','阿杰'];
      const index=names.findIndex((_,i)=>!s.teams.some(t=>t.period.id===period.id&&t.members.some(m=>m.id==='host-'+i)));
      return index<0?s:createPuzzle(s,city,crypto.randomUUID(),now(),{id:'host-'+index,name:names[index],avatarUrl:'https://i.pravatar.cc/100?img='+(11+index%3)});
    }),
    finish:(teamId:string,piece:PuzzlePiece)=>update(s=>finishPuzzle(s,teamId,piece,now())),
    draw:(teamId:string):RelayDraw|undefined=>{
      const id=crypto.randomUUID(), random=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
      const next=update(s=>drawPuzzle(s,teamId,'self',id,now(),random));
      return next.teams.find(t=>t.id===teamId)?.draws.find(d=>d.id===id);
    },
    demoPeriod:(open:boolean)=>{if(demo)setDemoTime(puzzleDemoPeriodTime(latest.current,now(),open));},
    demoUnjoined:()=>{if(demo)setDemoTime(unjoinedPuzzleWeekend(latest.current,now()));},
    demoJoin: simulateJoin,
  };
}
