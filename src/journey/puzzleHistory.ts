import { weekendPeriod } from './weekendRelay';
import type { PuzzleCity, PuzzleRoute, PuzzleTeam } from './puzzleTeam';

/** Display-only fixtures for the explicit preview; never stored or used for eligibility. */
export function previewPuzzleHistory(teams:PuzzleTeam[],cities:PuzzleCity[],routes:PuzzleRoute[],now:number):PuzzleTeam[] {
  const history=teams.slice();
  const eligible=cities.filter(city=>routes.filter(r=>r.id===city.id).length>=3);
  if(!eligible.length)return history;
  const current=weekendPeriod(now);
  for(let offset=1;history.length<3;offset++) {
    const period=weekendPeriod(current.startsAt-offset*7*86400000);
    if(history.some(t=>t.period.id===period.id))continue;
    const city=eligible[(offset-1)%eligible.length],cityRoutes=routes.filter(r=>r.id===city.id).slice().sort((a,b)=>a.routeIndex-b.routeIndex);
    const joinedAt=period.startsAt+3600000,id='preview-history-'+period.id,partial=history.length===2;
    const partner={id:'preview-partner-'+offset,name:['小林','阿禾','小川'][(offset-1)%3],joinedAt,avatarUrl:'https://i.pravatar.cc/100?img='+(11+(offset-1)%3)};
    const contributions=partial?[{memberId:'self',route:cityRoutes[0]},{memberId:partner.id,route:cityRoutes[1]}]:[{memberId:'self',route:cityRoutes[0]},{memberId:'self',route:cityRoutes[1]},{memberId:partner.id,route:cityRoutes[2]}];
    history.push({id,city,createdAt:joinedAt,members:[{id:'self',name:'你',joinedAt},partner],period,draws:[],pieces:contributions.map((item,i)=>({id:id+'-'+i,slot:i,memberId:item.memberId,route:item.route,distanceKm:item.route.distanceKm,startedAt:joinedAt+(i+1)*3600000,finishedAt:joinedAt+(i+1)*3600000+item.route.minutes*60000}))});
  }
  return history;
}
