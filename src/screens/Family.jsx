import { useStore, setCurrentUser, needsCare } from '../store.js'
import { STAGE_NAMES } from '../catalog.js'

export default function Family() {
  const state = useStore()
  const users = Object.values(state.users)
  const ranked = [...users].sort((a, b) => b.totalPoints - a.totalPoints)
  const total = users.reduce((s, u) => s + u.totalPoints, 0)

  return (
    <div className="screen">
      <div className="family-hero">
        <div className="family-hero-label">全家累计积分</div>
        <div className="family-hero-value">{total}</div>
      </div>

      <div className="section">
        <h2>🏆 排行榜</h2>
        <div className="family-list">
          {ranked.map((u, i) => {
            const d = u.dino
            const img = d.stageImages[d.stage]
            return (
              <button
                key={u.id}
                className="family-row"
                style={{ borderColor: u.color }}
                onClick={() => setCurrentUser(u.id)}
              >
                <div className="rank">{['🥇','🥈','🥉','4️⃣'][i]}</div>
                <div className="family-avatar" style={{ background: img ? 'transparent' : u.color }}>
                  {img ? <img src={img} alt="" /> : <span>{u.emoji}</span>}
                </div>
                <div className="family-info">
                  <div className="family-name">
                    {u.name} · <span className="family-dino">{d.name}</span>
                    {needsCare(d) && <span className="family-alert">⚠️ 需照顾</span>}
                  </div>
                  <div className="family-sub">{STAGE_NAMES[d.stage]} · Lv.{d.stage + 1}</div>
                  <div className="family-mini-bars">
                    <MiniBar value={d.hunger} color="#fb923c" />
                    <MiniBar value={d.thirst} color="#38bdf8" />
                    <MiniBar value={d.mood} color="#f472b6" />
                  </div>
                </div>
                <div className="family-points">{u.totalPoints}<span>分</span></div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="section family-tip">
        点头像卡片可以切换到那位成员的账户 · 顶部的胶囊也一样。
      </div>
    </div>
  )
}

function MiniBar({ value, color }) {
  return (
    <div className="mini-bar"><div style={{ width: `${value}%`, background: color }} /></div>
  )
}
