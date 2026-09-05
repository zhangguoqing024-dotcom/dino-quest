import { listSnapshots, restoreSnapshot, importData } from './store.js'

export default function RestoreModal({ open, onClose }) {
  if (!open) return null
  const snaps = listSnapshots()

  const onFilePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        if (importData(reader.result)) {
          alert('✅ 恢复成功！')
          onClose()
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const onRestoreDate = (date) => {
    if (!confirm(`用 ${date} 的备份覆盖当前数据？当前数据会被替换。`)) return
    if (restoreSnapshot(date)) {
      alert(`✅ 已恢复到 ${date}`)
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content restore-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📥 恢复存档</div>
        <div className="restore-hint">每次打开 App 会自动存一份当天的快照，保留最近 14 天。</div>

        {snaps.length === 0 ? (
          <div className="empty">还没有自动快照</div>
        ) : (
          <ul className="snap-list">
            {snaps.map(s => (
              <li key={s.date}>
                <div>
                  <div className="snap-date">{s.date}</div>
                  <div className="snap-time">{new Date(s.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <button className="btn-secondary" onClick={() => onRestoreDate(s.date)}>恢复这天</button>
              </li>
            ))}
          </ul>
        )}

        <div className="restore-divider">或</div>
        <button className="btn-secondary" style={{ width: '100%' }} onClick={onFilePick}>📂 从下载的 JSON 文件恢复</button>

        <button className="btn-primary" style={{ marginTop: 12 }} onClick={onClose}>关闭</button>
      </div>
    </div>
  )
}
