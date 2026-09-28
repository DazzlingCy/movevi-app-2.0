import { useEffect, useState, type CSSProperties } from 'react';
import {
  BookOpen, Building2, Castle, Check, ChevronLeft, Church, Clapperboard, Clock3, Columns3,
  Drama, Factory, Flag, Globe2, Hotel, Landmark, MapPin, Mountain, Palmtree, Pyramid,
  RadioTower, Route, Snowflake, Sparkles, Telescope, TowerControl, TrainFront, Trees, Waves, X,
  type LucideIcon
} from 'lucide-react';
import { getJourneyCity } from '../journey/data';
import { getCountryLevelProgress } from '../journey/state';
import type { JourneyCity, JourneyState } from '../journey/types';

interface JourneyLevelViewProps {
  state: JourneyState;
  onBack: () => void;
}

const cityRecordIcons: Record<string, LucideIcon> = {
  hangzhou: Waves,
  beijing: Landmark,
  shanghai: Building2,
  xian: Castle,
  tokyo: RadioTower,
  paris: Church,
  london: Clock3,
  'new-york': Hotel,
  sydney: Drama,
  rio: Mountain,
  cairo: Pyramid,
  bangkok: Palmtree,
  mumbai: TrainFront,
  singapore: Trees,
  moscow: Snowflake,
  'los-angeles': Clapperboard,
  rome: Columns3,
  dubai: TowerControl,
  berlin: Factory,
  toronto: Telescope
};

export default function JourneyLevelView({ state, onBack }: JourneyLevelViewProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const level = getCountryLevelProgress(state);
  const completedCities = state.completedCityIds
    .map(cityId => getJourneyCity(cityId))
    .filter((city): city is NonNullable<typeof city> => Boolean(city));
  const completedCountries = completedCities.reduce<Array<{ countryCode: string; countryName: string; cities: JourneyCity[] }>>((records, city) => {
    const existing = records.find(record => record.countryCode === city.countryCode);
    if (existing) existing.cities.push(city);
    else records.push({ countryCode: city.countryCode, countryName: city.countryName, cities: [city] });
    return records;
  }, []);
  const nextLevel = Math.min(level.maxLevel, level.level + 1);
  const isMaxLevel = level.level >= level.maxLevel;
  const progress = Math.min(100, (level.completedCountries / level.maxLevel) * 100);

  useEffect(() => {
    if (!rulesOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRulesOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [rulesOpen]);

  return (
    <main className="level-record-page" id="main-content">
      <header className="level-record-nav">
        <button type="button" onClick={onBack} aria-label="返回"><ChevronLeft /></button>
        <span>环球等级</span>
        <button className="level-record-nav__rule" type="button" onClick={() => setRulesOpen(true)} aria-label="查看等级规则"><BookOpen aria-hidden="true" /><span>规则</span></button>
      </header>

      <div className="level-record-content">
        <section className="level-record-intro" aria-labelledby="level-record-title">
          <div>
            <span><Sparkles aria-hidden="true" />MOVEVI WORLD LEVEL</span>
            <h1 id="level-record-title">你已点亮世界的<br /><strong>{level.completedCountries}</strong> 个国家和地区</h1>
            <p>继续完成新的国家旅程，拓展你的环球足迹。</p>
          </div>
          <div className="level-record-badge" aria-label={`当前环球等级 LV.${level.level}`}>
            <Globe2 aria-hidden="true" />
            <strong>LV.{level.level}</strong>
          </div>
        </section>

        <section className="level-record-progress" aria-labelledby="level-progress-title">
          <header>
            <div><h2 id="level-progress-title">环球等级</h2><span>LV.{level.level}</span></div>
            <p><strong>{level.completedCountries}</strong> 当前等级</p>
          </header>
          <div className="level-record-progress__track" role="progressbar" aria-label="环球等级进度" aria-valuemin={0} aria-valuemax={level.maxLevel} aria-valuenow={level.completedCountries}>
            <i style={{ width: `${progress}%` }} />
          </div>
          <footer>
            <span>{isMaxLevel ? '已达到最高等级' : <>距离 <b>LV.{nextLevel}</b> 还差 <strong>1</strong> 个国家或地区</>}</span>
            <small>{level.completedCountries}/{level.maxLevel}</small>
          </footer>
        </section>

        <section className="level-record-cities" aria-labelledby="completed-city-records-title">
          <header>
            <span><MapPin aria-hidden="true" /></span>
            <div><h2 id="completed-city-records-title">已完成国家和地区</h2><p>同一国家的多个完成城市合并记录</p></div>
            <strong>{completedCountries.length}</strong>
          </header>
          <div className="level-record-cities__list">
            {completedCountries.map((country, index) => {
              const representativeCity = country.cities[0];
              const CountryIcon = cityRecordIcons[representativeCity.id] ?? Route;
              const completedRouteCount = country.cities.reduce((total, city) => total + city.routes.length, 0);
              return (
                <article key={country.countryCode}>
                  <span className="level-record-city__icon" style={{ '--city-icon-accent': representativeCity.accent } as CSSProperties}><CountryIcon aria-hidden="true" /></span>
                  <div>
                    <strong>{country.countryName}<small>{country.cities.map(city => city.name).join(' · ')}</small></strong>
                    <p><Flag aria-hidden="true" />{country.cities.length} 座城市<i aria-hidden="true" />{completedRouteCount}/{completedRouteCount} 路线</p>
                  </div>
                  <span className="level-record-city__status"><Check aria-hidden="true" />已点亮</span>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                </article>
              );
            })}
          </div>
        </section>

      </div>

      {rulesOpen && (
        <div className="level-record-rules-overlay" onMouseDown={event => { if (event.currentTarget === event.target) setRulesOpen(false); }}>
          <section className="level-record-rules-dialog" role="dialog" aria-modal="true" aria-labelledby="level-record-rules-title">
            <header>
              <span><Globe2 aria-hidden="true" /></span>
              <div><h2 id="level-record-rules-title">等级规则</h2><p>按国家和地区去重计算</p></div>
              <button type="button" onClick={() => setRulesOpen(false)} aria-label="关闭等级规则" autoFocus><X /></button>
            </header>
            <ol>
              <li><span>1</span><p>完成一座城市的全部路线，即点亮其所属国家或地区，环球等级 <strong>+1</strong>。</p></li>
              <li><span>2</span><p>同一国家或地区的多个完成城市只计算一次，例如北京和上海共同计为中国。</p></li>
              <li><span>3</span><p>环球等级上限为 <strong>LV.195</strong>。</p></li>
            </ol>
          </section>
        </div>
      )}
    </main>
  );
}
