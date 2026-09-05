import { useState } from 'react'
import { useStore, setStageImage, setDinoName, useItem, careReasons } from '../store.js'
import { STAGE_NAMES, STAGE_EXP, ITEM_BY_ID, getGrowthStats } from '../catalog.js'
import ConfirmModal from '../ConfirmModal.jsx'

export default function Home() {
  const state = useStore()
  const u = state.users[state.currentUserId]
  const d = u.dino
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(d.name)
  const [pendingFeed, setPendingFeed] = useState(null)

  const isMaxStage = d.stage >= STAGE_NAMES.length - 1
  const nextStage = d.stage + 1
  const expForNext = isMaxStage ? null : STAGE_EXP[nextStage]
  const expInStage = d.exp - STAGE_EXP[d.stage]
  const expNeeded = expForNext != null ? expForNext - STAGE_EXP[d.stage] : 0
  const expRemaining = expForNext != null ? expForNext - d.exp : 0

  const onPickImageForStage = (stageIdx) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setStageImage(u.id, stageIdx, reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const stageImg = d.stageImages[d.stage]

  const feedable = Object.entries(u.inventory)
    .map(([id, qty]) => ({ ...ITEM_BY_ID[id], qty }))
    .filter(it => it && (it.type === 'food' || it.type === 'water'))

  const confirmFeed = () => {
    if (!pendingFeed) return
    useItem(u.id, pendingFeed)
    setPendingFeed(null)
  }

  const reasons = careReasons(d)

  return (
    <div className="screen">
      {reasons.length > 0 && (
        <div className="care-banner">
          <div className="care-emoji">⚠️</div>
          <div className="care-text">
            <div><b>{d.name}</b> 需要照顾了！</div>
            <div className="care-reasons">{reasons.join(' · ')}</div>
          </div>
        </div>
      )}
      {/* 1. 成长时间线（放在最上面）*/}
      <div className="section">
        <div className="section-head">
          <h2>🌱 成长时间线</h2>
          <div className="timeline-hint">左右滑动 · 点卡片可换外观图</div>
        </div>
        <div className="timeline">
          {STAGE_NAMES.map((label, idx) => {
            const img = d.stageImages[idx]
            const unlocked = idx <= d.stage
            const current = idx === d.stage
            const history = d.stageHistory?.[idx]
            return (
              <label
                key={idx}
                className={
                  'timeline-stage'
                  + (unlocked ? '' : ' locked')
                  + (current ? ' current' : '')
                }
                style={current ? { borderColor: u.color } : undefined}
              >
                <div className="timeline-image">
                  {img
                    ? <img src={img} alt={label} />
                    : <div className="timeline-placeholder">{u.emoji}</div>
                  }
                  {!unlocked && <div className="timeline-lock">🔒</div>}
                  {current && <div className="timeline-badge">当前</div>}
                </div>
                <div className="timeline-label">
                  <span>{label}</span>
                  <small>Lv.{idx + 1}</small>
                </div>
                <div className="timeline-summary">
                  {renderStageSummary(unlocked, current, history, d, idx)}
                </div>
                <div className="timeline-action">
                  {img ? '更换外观' : '选一张图'}
                </div>
                <input type="file" accept="image/*" onChange={onPickImageForStage(idx)} hidden />
              </label>
            )
          })}
        </div>

        {/* 下一目标 */}
        <div className="next-goal">
          {isMaxStage ? (
            <div className="goal-title">🏆 已达究极形态，恭喜！</div>
          ) : (
            <>
              <div className="goal-title">🎯 距离解锁「{STAGE_NAMES[nextStage]}」</div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: `${(expInStage / expNeeded) * 100}%` }} />
              </div>
              <div className="goal-info">
                <span>还差 <b>{expRemaining}</b> 经验</span>
                <span className="goal-hint">{estimateMeals(expRemaining)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. 恐龙主卡（放在时间线下面）*/}
      <div className="dino-card" style={{ borderColor: u.color }}>
        <div className="dino-header">
          {editing ? (
            <form
              className="name-edit"
              onSubmit={(e) => { e.preventDefault(); setDinoName(u.id, nameDraft); setEditing(false) }}
            >
              <input
                autoFocus maxLength={12} value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={() => { setDinoName(u.id, nameDraft); setEditing(false) }}
              />
            </form>
          ) : (
            <div className="dino-title" onClick={() => { setNameDraft(d.name); setEditing(true) }}>
              {d.name} <span className="edit-hint">✏️</span>
            </div>
          )}
          <div className="dino-stage">{STAGE_NAMES[d.stage]} · Lv.{d.stage + 1}</div>
        </div>
        <div className="dino-owner">主人：{u.name}</div>

        <div className="dino-image">
          {stageImg
            ? <img src={stageImg} alt="dino" />
            : <div className="dino-placeholder">{u.emoji}<div className="hint">点上方时间线卡片可以选恐龙</div></div>
          }
        </div>

        <div className="bars">
          <Bar label="🍖 饱食度" value={d.hunger} color="#fb923c" />
          <Bar label="💧 口渴度" value={d.thirst} color="#38bdf8" />
          <Bar label="💖 心情"   value={d.mood}   color="#f472b6" />
        </div>

        {(() => {
          const g = getGrowthStats(d.stage, d.exp)
          const totalAtk = g.strength + d.atk
          return (
            <div className="growth-stats">
              <div className="growth-item">
                <div className="growth-label">📏 身高</div>
                <div className="growth-value">{g.height}<small>cm</small></div>
              </div>
              <div className="growth-item">
                <div className="growth-label">⚖️ 体重</div>
                <div className="growth-value">{formatWeight(g.weight)}</div>
              </div>
              <div className="growth-item">
                <div className="growth-label">💪 力量</div>
                <div className="growth-value">{g.strength}</div>
              </div>
              <div className="growth-item">
                <div className="growth-label">⚔️ 攻击</div>
                <div className="growth-value">{totalAtk}</div>
              </div>
            </div>
          )
        })()}

        <div className="stats-row">
          <div>🗡️ 武器 <b>{d.weapon ? ITEM_BY_ID[d.weapon]?.name : '无'}</b></div>
          <div>👑 装饰 <b>{d.decor ? ITEM_BY_ID[d.decor]?.name : '无'}</b></div>
        </div>
      </div>

      {/* 3. 喂养面板 */}
      <div className="section">
        <h2>🍖 喂养 {d.name}</h2>
        {feedable.length === 0 ? (
          <div className="empty">仓库里还没有食物/水，去商城买一些吧。</div>
        ) : (
          <div className="feed-grid">
            {feedable.map(it => (
              <button key={it.id} className="feed-item" onClick={() => setPendingFeed(it)}>
                <div className="feed-emoji">{it.emoji}</div>
                <div className="feed-name">{it.name}</div>
                <div className="feed-effect">{describeFeed(it)}</div>
                <div className="feed-qty">x{it.qty}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="quick">
        <div className="quick-item">
          <div className="quick-label">总积分</div>
          <div className="quick-value">{u.totalPoints}</div>
        </div>
        <div className="quick-item">
          <div className="quick-label">本周入账</div>
          <div className="quick-value">{u.entries[0]?.points ?? '—'}</div>
        </div>
      </div>

      <ConfirmModal
        open={!!pendingFeed}
        emoji={pendingFeed?.emoji}
        title={`喂给 ${d.name}？`}
        itemName={pendingFeed?.name}
        effect={pendingFeed ? describeFeed(pendingFeed) : ''}
        subtitle={pendingFeed ? `仓库还剩 ${pendingFeed.qty - 1} 份` : ''}
        confirmText="🍽️ 喂它"
        onConfirm={confirmFeed}
        onCancel={() => setPendingFeed(null)}
      />
    </div>
  )
}

function renderStageSummary(unlocked, current, history, d, idx) {
  if (!unlocked) {
    const needed = STAGE_EXP[idx] - STAGE_EXP[Math.max(0, idx - 1)]
    return <span className="sum-locked">🔒 未解锁</span>
  }
  if (!history) return null
  const totalFed = Object.values(history.feedCounts).reduce((s, n) => s + n, 0)

  // 计算持续时间
  const startAt = history.enteredAt
  const endAt = current
    ? Date.now()
    : (d.stageHistory[idx + 1]?.enteredAt || Date.now())
  const durationText = startAt ? formatDuration(endAt - startAt) : '—'

  // 前三份吃的
  const top3 = Object.entries(history.feedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, n]) => {
      const it = ITEM_BY_ID[id]
      return it ? `${it.emoji}×${n}` : null
    })
    .filter(Boolean)

  return (
    <>
      <div className="sum-line">🕒 {durationText}</div>
      <div className="sum-line">🍽️ {totalFed > 0 ? top3.join(' ') : '还没喂过'}</div>
    </>
  )
}

function formatDuration(ms) {
  if (ms < 0) return '—'
  const min = ms / 60000
  if (min < 60) return `${Math.max(1, Math.round(min))} 分钟`
  const hr = min / 60
  if (hr < 24) return `${Math.round(hr)} 小时`
  const day = hr / 24
  return `${Math.max(1, Math.round(day))} 天`
}

function estimateMeals(expRemaining) {
  if (expRemaining <= 0) return ''
  const meat = Math.ceil(expRemaining / 35)
  const berry = Math.ceil(expRemaining / 18)
  return `约 ${meat} 份鲜肉 🍖 或 ${berry} 个野果 🍎`
}

function formatWeight(kg) {
  if (kg >= 1000) return <>{(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)}<small>吨</small></>
  return <>{kg}<small>kg</small></>
}

function describeFeed(it) {
  const parts = []
  if (it.hunger) parts.push(`饱食 +${it.hunger}`)
  if (it.thirst) parts.push(`口渴 +${it.thirst}`)
  if (it.mood)   parts.push(`心情 +${it.mood}`)
  return parts.join(' · ')
}

function Bar({ label, value, color, text }) {
  return (
    <div className="bar">
      <div className="bar-label"><span>{label}</span><span>{text ?? `${Math.round(value)}`}</span></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  )
}
