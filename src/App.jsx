import { useState, useEffect } from 'react'
import { useStore, setCurrentUser, resetAll, tickDecay, needsCare, exportData } from './store.js'
import RestoreModal from './RestoreModal.jsx'
import Family from './screens/Family.jsx'
import Home from './screens/Home.jsx'
import Entry from './screens/Entry.jsx'
import Shop from './screens/Shop.jsx'
import Inventory from './screens/Inventory.jsx'
import LevelUpModal from './LevelUpModal.jsx'
import './App.css'

const TABS = [
  { id: 'family', label: '家',     icon: '🏠', Comp: Family },
  { id: 'home',   label: '恐龙',   icon: '🦕', Comp: Home },
  { id: 'entry',  label: '积分',   icon: '📝', Comp: Entry },
  { id: 'shop',   label: '商城',   icon: '🛒', Comp: Shop },
  { id: 'inv',    label: '仓库',   icon: '🎒', Comp: Inventory }
]

export default function App() {
  const state = useStore()
  const [tab, setTab] = useState('family')
  const [restoreOpen, setRestoreOpen] = useState(false)
  const CurrentComp = TABS.find(t => t.id === tab).Comp
  const users = Object.values(state.users)

  // 每 60 秒 tick 一次衰减；页面重回前台也 tick 一下
  useEffect(() => {
    const id = setInterval(tickDecay, 60 * 1000)
    const onVisible = () => document.visibilityState === 'visible' && tickDecay()
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const currentUser = state.users[state.currentUserId]
  const currentNeedsCare = needsCare(currentUser.dino)

  const handleBackup = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dino-quest-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestore = () => setRestoreOpen(true)

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">🦕 恐龙养成记</div>
        <div className="header-actions">
          <button className="reset" onClick={handleBackup} title="下载存档备份">💾 备份</button>
          <button className="reset" onClick={handleRestore} title="从备份恢复">📥 恢复</button>
          <button className="reset danger" onClick={resetAll} title="清空所有数据">重置</button>
        </div>
      </header>

      <nav className="user-switch">
        {users.map(u => (
          <button
            key={u.id}
            className={'user-chip' + (u.id === state.currentUserId ? ' active' : '')}
            style={{ '--c': u.color }}
            onClick={() => setCurrentUser(u.id)}
          >
            <span className="chip-emoji">
              {u.emoji}
              {needsCare(u.dino) && <span className="chip-dot" />}
            </span>
            <span>{u.name}</span>
            <span className="chip-points">{u.totalPoints}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        <CurrentComp />
      </main>

      <LevelUpModal />
      <RestoreModal open={restoreOpen} onClose={() => setRestoreOpen(false)} />

      <nav className="tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={'tab' + (t.id === tab ? ' active' : '')}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">
              {t.icon}
              {t.id === 'home' && currentNeedsCare && <span className="tab-dot" />}
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
