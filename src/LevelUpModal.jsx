import { useEffect } from 'react'
import { useStore, dismissNotification } from './store.js'
import { STAGE_NAMES } from './catalog.js'

export default function LevelUpModal() {
  const notif = useStore(s => s.notification)
  const user = useStore(s => notif ? s.users[notif.userId] : null)

  useEffect(() => {
    if (!notif) return
    const t = setTimeout(dismissNotification, 6000)
    return () => clearTimeout(t)
  }, [notif])

  if (!notif || notif.type !== 'levelup' || !user) return null

  return (
    <div className="modal-backdrop" onClick={dismissNotification}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="confetti">🎉 ✨ 🎊 ✨ 🎉</div>
        <div className="modal-title">恐龙成长了！</div>
        <div className="modal-dino">{user.dino.name}</div>
        <div className="modal-stage">进入 <b>{STAGE_NAMES[notif.newStage]}</b> 阶段</div>
        <div className="modal-sub">{user.name}，记得去恐龙主页更换新阶段的外观图 🦕</div>
        <button className="btn-primary" onClick={dismissNotification}>好耶！</button>
      </div>
    </div>
  )
}
