import test from 'node:test';
import assert from 'node:assert/strict';
import { createCarouselSettler, hasMeaningfulCarouselScroll } from './homeCarousel';

function virtualScheduler() {
  let time=0,id=0;
  const timers=new Map<number,{at:number;callback:()=>void}>();
  const frames=new Map<number,()=>void>();
  return {
    adapter:{
      delay(callback:()=>void,ms:number){const next=++id;timers.set(next,{at:time+ms,callback});return next;},
      clearDelay(key:number){timers.delete(key);},
      frame(callback:()=>void){const next=++id;frames.set(next,callback);return next;},
      cancelFrame(key:number){frames.delete(key);},
    },
    advance(ms:number){time+=ms;for(const [key,timer] of [...timers])if(timer.at<=time){timers.delete(key);timer.callback();}},
    paint(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback());},
    pendingFrames:frames,
    pendingTimers:timers,
  };
}

test('browse mode lasts through the idle delay and native snap frames before expanding',()=>{
  const clock=virtualScheduler(),events:string[]=[];
  const settler=createCarouselSettler(clock.adapter,()=>events.push('restore-snap'),()=>events.push('expand'));
  settler.arm();clock.advance(899);assert.deepEqual(events,[]);
  clock.advance(1);assert.deepEqual(events,['restore-snap']);
  clock.paint();assert.deepEqual(events,['restore-snap']);
  clock.paint();assert.deepEqual(events,['restore-snap','expand']);
});

test('continued inertia restarts idle instead of briefly expanding the card',()=>{
  const clock=virtualScheduler();let expansions=0;
  const settler=createCarouselSettler(clock.adapter,()=>{},()=>expansions++);
  settler.arm();clock.advance(850);settler.arm();clock.advance(50);clock.paint();clock.paint();
  assert.equal(expansions,0);
  clock.advance(850);clock.paint();clock.paint();assert.equal(expansions,1);
});

test('new scroll cancels a queued expansion, including an already delivered stale frame',()=>{
  const clock=virtualScheduler();let expansions=0;
  const settler=createCarouselSettler(clock.adapter,()=>{},()=>expansions++);
  settler.arm();clock.advance(900);clock.paint();
  const stale=[...clock.pendingFrames.values()][0];
  settler.arm();stale();assert.equal(expansions,0);
  assert.equal(clock.pendingTimers.size,1);
  clock.advance(900);clock.paint();clock.paint();assert.equal(expansions,1);
});

test('pointer hold or unmount cancels both timeout and queued frame work',()=>{
  const clock=virtualScheduler();let expansions=0;
  const settler=createCarouselSettler(clock.adapter,()=>{},()=>expansions++);
  settler.arm();settler.cancel();clock.advance(2000);clock.paint();clock.paint();
  settler.arm();clock.advance(900);settler.cancel();clock.paint();clock.paint();
  assert.equal(expansions,0);assert.equal(clock.pendingTimers.size,0);assert.equal(clock.pendingFrames.size,0);
});

test('a snap adjustment that starts scrolling synchronously invalidates the previous settle pass',()=>{
  const clock=virtualScheduler();let preparations=0,expansions=0;
  const settler=createCarouselSettler(clock.adapter,()=>{if(++preparations===1)settler.arm();},()=>expansions++);
  settler.arm();clock.advance(900);assert.equal(clock.pendingFrames.size,0);
  clock.advance(900);clock.paint();clock.paint();assert.equal(expansions,1);
});

test('fractional snap corrections do not reopen browse mode but real movement does',()=>{
  for(const delta of [0,.25,-.5,1.75,-2])assert.equal(hasMeaningfulCarouselScroll(400,400+delta),false);
  assert.equal(hasMeaningfulCarouselScroll(400,402.5),true);
  assert.equal(hasMeaningfulCarouselScroll(400,350),true);
});
