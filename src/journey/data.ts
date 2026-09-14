import type { JourneyCity, JourneyRoute } from './types';

type CitySeed = Omit<JourneyCity, 'routes'> & { landmarks: string[] };

const ROUTE_SUFFIXES = [
  '晨光序章', '水岸漫游', '旧城寻迹', '花园呼吸', '建筑巡礼',
  '街巷日常', '艺术散步', '城市天际', '暮色长跑', '终章环线'
] as const;

const DISTANCES = [3.2, 4.1, 4.8, 5.4, 3.7, 6.2, 4.5, 7.1, 5.8, 8.4] as const;
const PACE_MINUTES_PER_KM = [7.2, 7.5, 7.1, 7.8, 7.3, 7.6, 7.4, 7.7, 7.2, 7.5] as const;

const citySeeds: CitySeed[] = [
  { id: 'hangzhou', name: '杭州', englishName: 'Hangzhou', continent: '亚洲', longitude: 120.1551, latitude: 30.2741, accent: '#4f8f7a', description: '湖山相依，沿水光与茶香跑进江南日常。', landmarks: ['断桥', '白堤', '曲院风荷', '灵隐寺', '北山街', '龙井村', '钱江新城', '运河拱宸桥', '九溪烟树', '西湖环线'] },
  { id: 'beijing', name: '北京', englishName: 'Beijing', continent: '亚洲', longitude: 116.4074, latitude: 39.9042, accent: '#a55343', description: '从皇城中轴到城市绿肺，读懂古都的厚度。', landmarks: ['故宫角楼', '天坛', '什刹海', '奥林匹克森林公园', '景山', '雍和宫', '亮马河', '颐和园', '长安街', '中轴线'] },
  { id: 'shanghai', name: '上海', englishName: 'Shanghai', continent: '亚洲', longitude: 121.4737, latitude: 31.2304, accent: '#3e7b88', description: '黄浦江两岸，新旧城市在脚步之间交汇。', landmarks: ['外滩', '武康路', '苏州河', '世纪公园', '思南公馆', '豫园', '西岸美术馆', '陆家嘴', '北外滩', '黄浦江环线'] },
  { id: 'xian', name: '西安', englishName: "Xi'an", continent: '亚洲', longitude: 108.9398, latitude: 34.3416, accent: '#9b6544', description: '沿城墙与坊巷，跑过长安留下的千年刻度。', landmarks: ['永宁门', '大雁塔', '大明宫', '曲江池', '书院门', '回民街', '小雁塔', '钟鼓楼', '护城河', '长安城墙'] },
  { id: 'tokyo', name: '东京', englishName: 'Tokyo', continent: '亚洲', longitude: 139.6503, latitude: 35.6762, accent: '#b3544d', description: '传统街区与霓虹天际并行，发现城市的细密节奏。', landmarks: ['浅草寺', '隅田川', '皇居', '代代木公园', '神乐坂', '谷中银座', '上野美术馆', '东京塔', '台场海滨', '山手环线'] },
  { id: 'paris', name: '巴黎', englishName: 'Paris', continent: '欧洲', longitude: 2.3522, latitude: 48.8566, accent: '#9d624d', description: '沿塞纳河展开一册关于艺术、街道与光的手记。', landmarks: ['卢浮宫', '塞纳河左岸', '巴黎圣母院', '卢森堡公园', '蒙马特', '玛黑区', '奥赛博物馆', '埃菲尔铁塔', '香榭丽舍', '塞纳河环线'] },
  { id: 'london', name: '伦敦', englishName: 'London', continent: '欧洲', longitude: -0.1276, latitude: 51.5072, accent: '#566d78', description: '穿过桥、钟楼与皇家公园，听见雾都的层次。', landmarks: ['大本钟', '泰晤士河南岸', '伦敦塔桥', '海德公园', '考文特花园', '诺丁山', '泰特现代美术馆', '碎片大厦', '摄政运河', '泰晤士河环线'] },
  { id: 'new-york', name: '纽约', englishName: 'New York', continent: '北美洲', longitude: -74.006, latitude: 40.7128, accent: '#ba6d3f', description: '在网格街道与河岸之间，跑进不眠城市的脉搏。', landmarks: ['布鲁克林大桥', '哈德逊河', '高线公园', '中央公园', '格林尼治村', '第五大道', '大都会博物馆', '帝国大厦', '时代广场', '曼哈顿环线'] },
  { id: 'sydney', name: '悉尼', englishName: 'Sydney', continent: '大洋洲', longitude: 151.2093, latitude: -33.8688, accent: '#3d8390', description: '海港、悬崖与明亮天际组成南半球的呼吸。', landmarks: ['悉尼歌剧院', '环形码头', '海港大桥', '皇家植物园', '岩石区', '邦迪海滩', '新南威尔士美术馆', '达令港', '曼利海岸', '海港环线'] },
  { id: 'rio', name: '里约热内卢', englishName: 'Rio de Janeiro', continent: '南美洲', longitude: -43.1729, latitude: -22.9068, accent: '#4e8a68', description: '海湾、山脊和桑巴节拍共同点亮热带旅程。', landmarks: ['科帕卡巴纳', '瓜纳巴拉湾', '糖面包山', '弗拉门戈公园', '圣特蕾莎', '拉帕街区', '明日博物馆', '基督山', '伊帕内玛', '海湾环线'] },
  { id: 'cairo', name: '开罗', englishName: 'Cairo', continent: '非洲', longitude: 31.2357, latitude: 30.0444, accent: '#b0834f', description: '从尼罗河到古老石迹，丈量文明留下的时间。', landmarks: ['吉萨金字塔', '尼罗河岸', '狮身人面像', '爱资哈尔公园', '老开罗', '哈利利市场', '埃及博物馆', '开罗塔', '萨拉丁城堡', '尼罗河环线'] },
  { id: 'bangkok', name: '曼谷', englishName: 'Bangkok', continent: '亚洲', longitude: 100.5018, latitude: 13.7563, accent: '#a76c43', description: '寺塔、河岸与市井烟火交织成热带城市乐章。', landmarks: ['郑王庙', '湄南河', '大皇宫', '伦披尼公园', '石龙军路', '唐人街', '曼谷艺术文化中心', '王权云顶', '拉达那哥欣岛', '湄南河环线'] },
  { id: 'mumbai', name: '孟买', englishName: 'Mumbai', continent: '亚洲', longitude: 72.8777, latitude: 19.076, accent: '#a96546', description: '沿阿拉伯海奔跑，遇见电影梦与城市日常。', landmarks: ['印度门', '海滨大道', '维多利亚总站', '桑杰甘地国家公园', '科拉巴', '班德拉', '王子博物馆', '沃利天际线', '焦伯蒂海滩', '孟买海岸环线'] },
  { id: 'singapore', name: '新加坡', englishName: 'Singapore', continent: '亚洲', longitude: 103.8198, latitude: 1.3521, accent: '#438673', description: '花园、海湾和多元街区构成赤道上的精密城市。', landmarks: ['鱼尾狮公园', '滨海湾', '滨海湾花园', '植物园', '牛车水', '甘榜格南', '国家美术馆', '金沙天际', '东海岸公园', '滨海环线'] },
  { id: 'moscow', name: '莫斯科', englishName: 'Moscow', continent: '欧洲', longitude: 37.6173, latitude: 55.7558, accent: '#925046', description: '砖红城墙、河流与长街写下北方城市的厚重。', landmarks: ['红场', '莫斯科河', '圣瓦西里大教堂', '高尔基公园', '阿尔巴特街', '扎里亚季耶', '普希金博物馆', '莫斯科城', '麻雀山', '花园环线'] },
  { id: 'los-angeles', name: '洛杉矶', englishName: 'Los Angeles', continent: '北美洲', longitude: -118.2437, latitude: 34.0522, accent: '#b87848', description: '从电影山丘到太平洋，收藏西岸自由的光线。', landmarks: ['格里菲斯天文台', '圣莫尼卡海岸', '好莱坞大道', '格里菲斯公园', '银湖', '艺术区', '盖蒂中心', '市中心天际线', '威尼斯海滩', '太平洋环线'] },
  { id: 'rome', name: '罗马', englishName: 'Rome', continent: '欧洲', longitude: 12.4964, latitude: 41.9028, accent: '#a66047', description: '广场、石柱与松树让每一步都穿过古老时间。', landmarks: ['斗兽场', '台伯河', '万神殿', '博尔盖塞公园', '特拉斯提弗列', '纳沃纳广场', '卡比托利欧博物馆', '圣彼得大教堂', '西班牙阶梯', '古城环线'] },
  { id: 'dubai', name: '迪拜', englishName: 'Dubai', continent: '亚洲', longitude: 55.2708, latitude: 25.2048, accent: '#b98a4e', description: '海湾、沙色街区和未来天际线彼此映照。', landmarks: ['迪拜塔', '朱美拉海岸', '未来博物馆', '萨法公园', '法希迪老城', '黄金市集', '迪拜设计区', '码头天际线', '棕榈岛', '海湾环线'] },
  { id: 'berlin', name: '柏林', englishName: 'Berlin', continent: '欧洲', longitude: 13.405, latitude: 52.52, accent: '#65756b', description: '穿过历史断面、森林绿带和持续更新的街区。', landmarks: ['勃兰登堡门', '施普雷河', '博物馆岛', '蒂尔加滕', '克罗伊茨贝格', '东边画廊', '新国家美术馆', '电视塔', '滕珀尔霍夫', '柏林环线'] },
  { id: 'toronto', name: '多伦多', englishName: 'Toronto', continent: '北美洲', longitude: -79.3832, latitude: 43.6532, accent: '#47798a', description: '湖岸、街区与多元文化拼成一座舒展的城市。', landmarks: ['加拿大国家电视塔', '安大略湖岸', '古酿酒厂区', '高地公园', '肯辛顿市场', '约克维尔', '安大略美术馆', '金融区天际线', '多伦多群岛', '湖滨环线'] }
];

const makeRoutes = (city: CitySeed): JourneyRoute[] => city.landmarks.map((landmark, index) => {
  const nextLandmark = city.landmarks[(index + 1) % city.landmarks.length];
  const distanceKm = DISTANCES[index];
  const durationMinutes = Math.round(distanceKm * PACE_MINUTES_PER_KM[index]);

  return {
    id: `${city.id}-route-${index + 1}`,
    cityId: city.id,
    order: index + 1,
    name: `${landmark}·${ROUTE_SUFFIXES[index]}`,
    landmarks: [landmark, nextLandmark],
    distanceKm,
    durationMinutes,
    calories: Math.round(distanceKm * 64),
    description: `从${landmark}出发，途经${nextLandmark}，用一段轻快奔跑感受${city.name}的城市纹理。`
  };
});

export const JOURNEY_CITIES: JourneyCity[] = citySeeds.map(({ landmarks: _landmarks, ...city }) => ({
  ...city,
  routes: makeRoutes({ ...city, landmarks: _landmarks })
}));

export const JOURNEY_SEQUENCE = [
  'beijing', 'shanghai', 'tokyo', 'paris', 'new-york', 'london', 'rome', 'berlin',
  'moscow', 'dubai', 'cairo', 'mumbai', 'bangkok', 'singapore', 'sydney',
  'los-angeles', 'toronto', 'rio', 'hangzhou', 'xian'
] as const;

export const CITY_BY_ID = new Map(JOURNEY_CITIES.map(city => [city.id, city]));

export const getJourneyCity = (cityId: string) => CITY_BY_ID.get(cityId);

export const getJourneyRoute = (cityId: string, routeId: string) =>
  CITY_BY_ID.get(cityId)?.routes.find(route => route.id === routeId);
