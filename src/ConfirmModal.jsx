export default function ConfirmModal({ open, title, emoji, itemName, effect, subtitle, confirmText = '✅ 确认', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {emoji && <div className="buy-emoji">{emoji}</div>}
        <div className="modal-title">{title}</div>
        {itemName && <div className="buy-item-name">{itemName}</div>}
        {effect && <div className="buy-effect">{effect}</div>}
        {subtitle && <div className="buy-cost">{subtitle}</div>}
        <div className="buy-actions">
          <button className="btn-secondary" onClick={onCancel}>取消</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
