export type CityStatus = 'unlit' | 'in-progress' | 'lit' | 'upcoming';
export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

export interface RouteCompletionStats {
  completedAt: number;
  distance: number;
  durationSeconds: number;
  calories: number;
  lightValueEarned: number;
}

export interface CityData {
  id: string;
  name: string;
  englishName: string;
  continent: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  image: string;
  routes: number;
  spots: number;
  completed: number;
  status: CityStatus;
  completedRouteIndices?: number[];
  completedRouteTimestamps?: Record<number, number>;
  completedRouteStats?: Record<number, RouteCompletionStats>;
  justLit?: boolean;
  labelPosition?: LabelPosition;
  description?: string;
}

export const CITIES: CityData[] = [
  { id: '1', name: '杭州', englishName: 'Hangzhou', continent: '中国', x: 83.5, y: 33.8, lat: 30.2741, lng: 120.1551, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg/1280px-%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg', routes: 3, spots: 24, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'bottom', description: '记忆唤醒的起点，从婉约西湖到现代钱江新城，水光潋滟间感受文明与科技的交融。' },
  { id: '2', name: '北京', englishName: 'Beijing', continent: '中国', x: 82.33, y: 27.83, lat: 39.9042, lng: 116.4074, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg/1280px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg', routes: 3, spots: 15, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'top', description: '皇城根下的厚重与现代都市的脉动同频，穿越古都的中轴线，点亮华夏文明的心脏。' },
  { id: '3', name: '上海', englishName: 'Shanghai', continent: '中国', x: 84.8, y: 32.5, lat: 31.2304, lng: 121.4737, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg/1280px-Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg', routes: 3, spots: 83, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'right', description: '魔都霓虹闪烁，黄浦江畔的万国建筑群与陆家嘴的天际线诉说着新旧交替的繁华。' },
  { id: '5', name: '西安', englishName: 'Xi\'an', continent: '中国', x: 80.25, y: 30.94, lat: 34.3416, lng: 108.9398, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg/1280px-City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg', routes: 3, spots: 66, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'left', description: '十三朝古都的长安城，兵马俑的震撼，大雁塔的古音，穿越千年时光的丝界起点。' },
  { id: '6', name: '东京', englishName: 'Tokyo', continent: '亚洲其他', x: 88.80, y: 30.16, lat: 35.6762, lng: 139.6503, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg', routes: 3, spots: 120, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'right', description: '樱花、铁塔与喧闹的十字街头，二次元与传统的碰撞，在这座超级都市寻找失落的霓虹记忆。' },
  { id: '7', name: '巴黎', englishName: 'Paris', continent: '欧洲', x: 50.63, y: 22.83, lat: 48.8566, lng: 2.3522, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1280px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg', routes: 3, spots: 90, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'bottom', description: '浪漫之都的塞纳河畔，埃菲尔铁塔的星光，卢浮宫的艺术瑰宝，光之城的优雅与永恒。' },
  { id: '8', name: '伦敦', englishName: 'London', continent: '欧洲', x: 49.3, y: 21.0, lat: 51.5072, lng: -0.1276, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/1280px-London_Skyline_%28125508655%29.jpeg', routes: 3, spots: 140, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'top', description: '泰晤士河的钟声回荡，西区的戏剧人生，雾都的神秘与绅士风度，日不落帝国的光影印记。' },
  { id: '9', name: '纽约', englishName: 'New York', continent: '北美洲', x: 29.44, y: 27.38, lat: 40.7128, lng: -74.006, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/1280px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg', routes: 3, spots: 110, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'top', description: '大苹果城的摩天大楼森林，时代广场的喧嚣不夜城，自由女神的火炬，世界熔炉的无限活力。' },
  { id: '10', name: '悉尼', englishName: 'Sydney', continent: '大洋洲', x: 92.00, y: 68.83, lat: -33.8688, lng: 151.2093, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/1280px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg', routes: 3, spots: 85, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'right', description: '南半球的明珠，悉尼歌剧院的风帆，达令港的碧波浪影，大洋洲的阳光与海滩。' },
  { id: '11', name: '里约热内卢', englishName: 'Rio', continent: '南美洲', x: 38.00, y: 62.72, lat: -22.9068, lng: -43.1729, image: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Praia_de_Copacabana_-_Rio_de_Janeiro%2C_Brasil.jpg', routes: 3, spots: 50, completed: 0, status: 'upcoming', completedRouteIndices: [], labelPosition: 'right', description: '基督像俯瞰的绝美海湾，科帕卡巴纳海滩的热情，桑巴狂欢节的律动，热带雨林的自由。' },
  { id: '12', name: '开罗', englishName: 'Cairo', continent: '非洲', x: 58.66, y: 33.33, lat: 30.0444, lng: 31.2357, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Cairo_Opera_House%2C_Al_Hurriyah_Park_and_the_Nile_river_%2814797782354%29.jpg/1280px-Cairo_Opera_House%2C_Al_Hurriyah_Park_and_the_Nile_river_%2814797782354%29.jpg', routes: 3, spots: 60, completed: 0, status: 'upcoming', completedRouteIndices: [], labelPosition: 'right', description: '尼罗河畔的古老金字塔，狮身人面像的千古谜题，文明古国的神秘与黄沙中的信仰。' },
  { id: '13', name: '曼谷', englishName: 'Bangkok', continent: '亚洲其他', x: 76.8, y: 45.2, lat: 13.7563, lng: 100.5018, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Wat_Arun_Bangkok_Thailand.jpg/1280px-Wat_Arun_Bangkok_Thailand.jpg', routes: 3, spots: 72, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'bottom', description: '湄南河畔的金色寺塔、夜市烟火与热带街巷交织，跑进曼谷的水岸记忆与城市脉搏。' },
  { id: '14', name: '孟买', englishName: 'Mumbai', continent: '亚洲其他', x: 70.8, y: 41.2, lat: 19.076, lng: 72.8777, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gateway_of_India_%28cropped%29.jpg/1280px-Gateway_of_India_%28cropped%29.jpg', routes: 3, spots: 88, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'left', description: '阿拉伯海风掠过印度门与滨海大道，孟买在殖民建筑、电影梦与市井奔流中闪光。' },
  { id: '15', name: '新加坡', englishName: 'Singapore', continent: '亚洲其他', x: 78.4, y: 51.2, lat: 1.3521, lng: 103.8198, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=1200', routes: 3, spots: 65, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'right', description: '滨海湾的天际线、花园城市的绿意与海港节奏交汇，跑过一座精密而鲜活的热带都会。' },
  { id: '16', name: '莫斯科', englishName: 'Moscow', continent: '欧洲', x: 59.5, y: 19.4, lat: 55.7558, lng: 37.6173, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Moscow_July_2011-7a.jpg/1280px-Moscow_July_2011-7a.jpg', routes: 3, spots: 96, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'top', description: '红场的砖红色回声、教堂穹顶与莫斯科河的冷冽光影，组成北方古都的厚重路线。' },
  { id: '17', name: '洛杉矶', englishName: 'Los Angeles', continent: '北美洲', x: 18.2, y: 34.8, lat: 34.0522, lng: -118.2437, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Los_Angeles%2C_Winter_2016.jpg/1280px-Los_Angeles%2C_Winter_2016.jpg', routes: 3, spots: 105, completed: 0, status: 'unlit', completedRouteIndices: [], labelPosition: 'bottom', description: '从好莱坞山到太平洋海岸，洛杉矶把电影光影、棕榈大道与自由奔跑写进城市记忆。' },
];

export const CONTINENTS_ORDER = ['中国', '亚洲其他', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲'];

// Group cities by continent
export const CITIES_BY_CONTINENT = CITIES.reduce((acc, city) => {
  if (!acc[city.continent]) {
    acc[city.continent] = [];
  }
  acc[city.continent].push(city);
  return acc;
}, {} as Record<string, typeof CITIES>);

export interface RouteDetailConfig {
  title: string;
  distance: string;
  duration: string;
  calories: string;
  rating: string;
  spots: string;
  intro: string;
}

export const getRouteData = (cityId: string, routeIndex: number): RouteDetailConfig => {
  const city = CITIES.find(c => c.id === cityId);
  const cityName = city?.name || '未知城市';
  
  const routeConfigs: Record<string, RouteDetailConfig[]> = {
    '1': [ // 杭州
      { title: '西湖断桥残雪', distance: '3.5', duration: '25:00', calories: '210', rating: '4.9', spots: '断桥 — 白堤 — 平湖秋月', intro: '清晨的西湖边，微风拂柳。这条路线带你沿着白堤，感受「水光潋滟晴方好」的千古诗意。' },
      { title: '灵隐寻幽', distance: '4.2', duration: '40:00', calories: '320', rating: '4.8', spots: '灵隐寺 — 飞来峰 — 法喜寺', intro: '远离城市喧嚣，深入山林古刹。在古树参天中呼吸新鲜空气，让脚步和心灵一起放空。' },
      { title: '钱江新城夜灯', distance: '5.0', duration: '35:00', calories: '350', rating: '4.7', spots: '市民中心 — 城市阳台 — 大剧院', intro: '夜晚的钱江新城灯火辉煌，沿着江堤奔跑，迎着江风，看现代都市的繁华与江水的灵动交织。' }
    ],
    '2': [ // 北京
      { title: '故宫角楼掠影', distance: '4.0', duration: '30:00', calories: '260', rating: '5.0', spots: '神武门 — 角楼 — 景山前街', intro: '沿着紫禁城的红墙奔跑，在角楼的倒影中穿梭，感受数百年的历史厚重与现代活力的碰撞。' },
      { title: '奥森无限绿意', distance: '10.0', duration: '60:00', calories: '650', rating: '4.9', spots: '南园门 — 仰山 — 奥运湖', intro: '北京跑者的圣地，万亩森林氧吧。四季变幻的风景，平坦且专业的塑胶跑道，让你尽情挥洒汗水。' }
    ],
    '3': [ // 上海
      { title: '浦江城市记忆', distance: '5.2', duration: '35:00', calories: '340', rating: '4.9', spots: '外滩 — 豫园 — 田子坊', intro: '沿着黄浦江畔，穿梭于海派老建筑与繁华都市之间。在海派石库门中感受上海独有的岁月积淀和城市记忆。' }
    ],
    '5': [ // 西安
      { title: '千年长安城墙', distance: '6.0', duration: '40:00', calories: '390', rating: '5.0', spots: '南门永宁门 — 东门长乐门 — 大雁塔', intro: '在十三朝古都的完整城墙上奔跑，还原长安古都神采，感受丝路起点的千年印记。' }
    ],
    '6': [ // 东京
      { title: '浅草古雅旧街', distance: '3.8', duration: '28:00', calories: '250', rating: '4.8', spots: '浅草寺 — 雷门 — 隅田川公园', intro: '穿过挂着巨大红灯笼的雷门，在木制老屋和樱花树下的小巷中奔跑，感受传统时代的雅致魅力。' }
    ],
    '7': [ // 巴黎
      { title: '塞纳河畔夕阳', distance: '6.5', duration: '45:00', calories: '410', rating: '5.0', spots: '卢浮宫 — 新桥 — 奥赛博物馆', intro: '迎着塞纳河的微风，当夕阳的余晖洒在奥赛博物馆的钟楼上，这是属于巴黎独有的浪漫奔跑。' },
      { title: '铁塔星光', distance: '3.0', duration: '20:00', calories: '180', rating: '4.8', spots: '战神广场 — 埃菲尔铁塔 — 夏佑宫', intro: '在闪烁的铁塔下起跑，穿过战神广场的草坪，感受这座光之城最核心的脉动。' }
    ],
    '8': [ // 伦敦
      { title: '西区奇缘声影录', distance: '2.0', duration: '15:36', calories: '169', rating: '5.0', spots: '皇家歌剧院 — 考文特花园 — 沙夫茨伯里大街', intro: '在西区看一场精彩演出，是伦敦人最自然的生活方式。从莱西姆剧院出发，踏入音乐剧心脏-伦敦西区。这条路线，带你沉湎于伦敦的音乐与爱。' },
      { title: '泰晤士河漫步', distance: '5.5', duration: '38:00', calories: '340', rating: '4.8', spots: '大本钟 — 伦敦眼 — 泰特现代美术馆', intro: '沿着泰晤士河南岸，穿梭于古典与现代建筑之间，感受这座城市的厚重与新生。' }
    ],
    '9': [ // 纽约
      { title: '自由岛记忆线', distance: '4.5', duration: '30:00', calories: '290', rating: '4.8', spots: '炮台公园 — 埃利斯岛 — 自由女神像', intro: '迎着哈德逊河呼啸的冷风，遥望自由女神高举的火炬。这条路线记录着移民时代的世纪记忆。' }
    ],
    '12': [ // 开罗
      { title: '尼罗古河文明', distance: '5.0', duration: '38:00', calories: '320', rating: '4.9', spots: '吉萨金字塔群 — 狮身人面像 — 尼罗河谷', intro: '在泛着金光的古老黄沙中起跑，环绕叹为观止的金字塔群，探寻沉睡三千年的圣书象形文字与法老秘密。' }
    ]
  };

  const cityRoutes = routeConfigs[cityId];
  if (cityRoutes && cityRoutes[routeIndex - 1]) {
    return cityRoutes[routeIndex - 1];
  }

  // Generic fallback
  return {
    title: `${cityName}深度探索路线`,
    distance: (2 + (routeIndex % 5)).toFixed(1),
    duration: `${15 + (routeIndex % 5) * 10}:00`,
    calories: `${150 + (routeIndex % 5) * 60}`,
    rating: '4.5',
    spots: `${cityName}地标A — ${cityName}地标B — ${cityName}地标C`,
    intro: `通过这条路线，深入探索${cityName}的城市角落，感受独一无二的地域风情和人文景观。`
  };
};
