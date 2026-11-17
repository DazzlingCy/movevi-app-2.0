import { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import styles from './HundredCitiesInfoView.module.css';

const assets = `${import.meta.env.BASE_URL}images/welfare/hundred-cities-`;

const leaders = [
  { rank: 1, name: '上善若水', cards: 1, distance: '6071.1', amount: '607.1' },
  { rank: 2, name: '小土', cards: 1, distance: '1536.5', amount: '153.7' },
  { rank: 3, name: 'Alice', cards: 13, distance: '928.2', amount: '92.8' },
  { rank: 4, name: '1212', cards: 11, distance: '924.6', amount: '92.5' },
  { rank: 5, name: '彭涛', cards: 12, distance: '636.0', amount: '63.6' },
  { rank: 6, name: '何小姐', cards: 11, distance: '469.6', amount: '47.0' },
];
const runner = { rank: 1714, name: 'whynot', cards: 3, distance: '3.1', amount: '0.3' };

const rules = [
  '活动仅统计用户在「跑遍全世界」活动内产生的跑步里程。该里程累计计入助力金额，每跑一公里，官方实时注资 0.1 元。',
  '第一期奖金池上限为 10,000 元。奖金池满额后，立即启动第一期旅行抽奖。',
  '第一期设 1 名中奖名额，对应旅行奖金总额为 10,000 元。',
  '中奖用户须从个人已解锁的城市中选择旅行目的地。',
  '每张城市抽奖卡权重均等。持卡用户的中奖概率与其合成的独立 ID 卡数量成正比，无额外加成。',
  '未被抽中的卡片将保留，可累计至下一期活动继续参与抽奖。',
  '抽奖将通过公众平台直播开奖，并对中奖用户进行公示。',
  '旅行奖金仅限用于实际旅行消费，不可兑换现金。奖金自中奖之日起 12 个月内有效，逾期未使用视为自动放弃。',
  '第一期为试运行活动。木卫六官方将根据后续用户参与热度，逐步增加中奖名额与奖励力度。',
  '本活动最终解释权归木卫六官方所有。',
];

export default function HundredCitiesInfoView({ kind, onBack }: { kind: 'ranking' | 'rules'; onBack: () => void }) {
  const [filter, setFilter] = useState('all');
  const ranking = kind === 'ranking';

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <button type="button" autoFocus aria-label="返回百人百城计划" onClick={onBack}><ChevronLeft size={24} aria-hidden="true" /></button>
        <h1>百人百城·全球圆梦计划</h1>
      </header>
      {ranking ? (
        <main id="main-content" className={`${styles.scroll} ${styles.ranking}`}>
          <header className={styles.rankingHero}>
            <img src={`${assets}rank-backdrop.webp`} width="1206" height="482" alt="" />
            <h2>助力里程排行榜</h2>
            <p>每跑一公里，都是在为全体锦鲤的圆梦之旅注资</p>
          </header>
          <section className={styles.profile} aria-label="我的助力数据">
            <div className={styles.profileHeader}>
              <img src={`${assets}rank-self.webp`} width="56" height="56" alt="" />
              <strong>{runner.name}</strong>
              <label className={styles.filter}>
                <select aria-label="排行榜范围" value={filter} onChange={event => setFilter(event.target.value)}>
                  <option value="all">全部</option>
                  <option value="mine">我的排名</option>
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
            </div>
            <dl className={styles.profileMetrics}>
              <div><dt>当前排名</dt><dd>{runner.rank}</dd></div>
              <div><dt>城市卡</dt><dd>{runner.cards}</dd></div>
              <div><dt>贡献里程</dt><dd>{runner.distance}<small>km</small></dd></div>
              <div><dt>助力金额</dt><dd><small>¥</small>{runner.amount}</dd></div>
            </dl>
          </section>

          <section className={styles.tableCard} aria-label="助力排名列表">
            <table>
              <thead><tr><th scope="col">排名</th><th scope="col">跑者</th><th scope="col">城市卡</th><th scope="col">贡献里程</th><th scope="col">助力金额</th></tr></thead>
              <tbody>
                {(filter === 'mine' ? [runner] : leaders).map(({ rank, name, cards, distance, amount }) => (
                  <tr key={rank}>
                    <td>{rank <= 3 ? <img className={styles.rankMedal} src={`${assets}medal-${rank}.webp`} alt={`第 ${rank} 名`} width="23" height="23" />
                      : <span className={styles.rankNumber}>{String(rank).padStart(2, '0')}</span>}</td>
                    <th scope="row"><span className={styles.runner}><img src={`${assets}rank-${rank === runner.rank ? 'self' : rank}.webp`} alt="" width="23" height="23" />{name}</span></th>
                    <td>{cards}</td><td>{distance}<small>km</small></td><td className={styles.contribution}>¥{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      ) : (
        <main id="main-content" className={`${styles.scroll} ${styles.rules}`}>
          <section className={styles.rulesCard} aria-labelledby="hundred-cities-rules-title">
            <h2 id="hundred-cities-rules-title">活动细则</h2>
            <ol>{rules.map(rule => <li key={rule}>{rule}</li>)}</ol>
          </section>
        </main>
      )}
    </div>
  );
}
