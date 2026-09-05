import { useState } from 'react'
import { useStore, addWeeklyEntry, removeEntry } from '../store.js'

function mondayOf(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() || 7 // Sun=0 → 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}

export default function Entry() {
  const state = useStore()
  const u = state.users[state.currentUserId]
  const [points, setPoints] = useState('')
  const [note, setNote] = useState('')
  const [weekOf, setWeekOf] = useState(mondayOf())

  const submit = (e) => {
    e.preventDefault()
    const n = parseInt(points, 10)
    if (!n || n <= 0) return
    addWeeklyEntry(u.id, { weekOf, points: n, note })
    setPoints('')
    setNote('')
  }

  return (
    <div className="screen">
      <div className="section">
        <h2>周日结算 · 给 {u.name} 录入本周积分</h2>
        <form className="entry-form" onSubmit={submit}>
          <label>
            <span>本周（周一日期）</span>
            <input type="date" value={weekOf} onChange={e => setWeekOf(e.target.value)} />
          </label>
          <label>
            <span>本周积分</span>
            <input
              type="number" inputMode="numeric" min="1"
              value={points}
              onChange={e => setPoints(e.target.value)}
              placeholder="例如 25"
              required
            />
          </label>
          <label>
            <span>备注（可选）</span>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="打扫房间、背单词..." />
          </label>
          <button type="submit" className="btn-primary">✅ 录入 · 累计到总账户</button>
        </form>
      </div>

      <div className="section">
        <h2>历史记录（共 {u.entries.length} 周）</h2>
        {u.entries.length === 0 && <div className="empty">还没有记录，周日晚上开完会来这里录入吧。</div>}
        <ul className="entries">
          {u.entries.map((e, i) => (
            <li key={i}>
              <div>
                <div className="entry-week">{e.weekOf} 那一周</div>
                {e.note && <div className="entry-note">{e.note}</div>}
              </div>
              <div className="entry-points">+{e.points}</div>
              <button className="btn-delete" onClick={() => confirm('删除这条记录？会扣掉相应积分。') && removeEntry(u.id, i)}>✕</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
