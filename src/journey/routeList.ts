import { getRouteCategory, type RouteCategory } from '../data/routeCategories';
import type { JourneyCity } from './types';

const CATEGORY_ORDER: RouteCategory[] = ['自然类', '历史类', '文化类', '生活类'];

export function groupCityRoutes<T extends {category:RouteCategory}>(routes:readonly T[]) {
  return CATEGORY_ORDER.map(category=>({category,routes:routes.filter(route=>route.category===category)}))
    .filter(group=>group.routes.length>0);
}

// Keep route identities intact while sharing the visible list order with progression.
export function getCityRouteSequence(city: Pick<JourneyCity, 'name' | 'routes'>) {
  return groupCityRoutes(city.routes.map(route => ({
    route, category: getRouteCategory(city.name, route.order)
  }))).flatMap(group => group.routes.map(item => item.route));
}

export function findVisibleRouteGroup<T extends string>(groups:readonly {category:T;top:number}[],readingLine:number,atBottom=false):T|null {
  if(!groups.length)return null;
  if(atBottom)return groups[groups.length-1].category;
  let current=groups[0].category;
  for(const group of groups){if(group.top>readingLine+4)break;current=group.category;}
  return current;
}
