export interface WeekendPeriod { id: string; startsAt: number; endsAt: number }
const DAY=86400000, OFFSET=8*3600000;
/** Friday 00:00 through Monday 00:00, always in Beijing time. */
export function weekendPeriod(now: number): WeekendPeriod {
  const local=new Date(now+OFFSET), day=local.getUTCDay();
  const midnight=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate())-OFFSET;
  const delta=day===0?-2:day===6?-1:(5-day+7)%7;
  const startsAt=midnight+delta*DAY;
  return {id:new Date(startsAt+OFFSET).toISOString().slice(0,10),startsAt,endsAt:startsAt+3*DAY};
}
export const periodOpen=(period:WeekendPeriod,now:number)=>now>=period.startsAt&&now<period.endsAt;
export const WEEKEND_PRIZES=[
  {cents:18,count:80},{cents:38,count:148},{cents:88,count:40},
  {cents:188,count:25},{cents:588,count:5},{cents:888,count:2},
];
