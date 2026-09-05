import { useState } from 'react'
import { useStore, useItem } from '../store.js'
import { ITEM_BY_ID, TYPE_LABEL } from '../catalog.js'
import ConfirmModal from '../ConfirmModal.jsx'

export default function Inventory() {
  const state = useStore()
  const u = state.users[state.currentUserId]
  const entries = Object.entries(u.inventory)
  const [pending, setPending] = useState(null)

  const grouped = entries.reduce((acc, [id, qty]) => {
    const it = ITEM_BY_ID[id]
    if (!it) return acc
    ;(acc[it.type] ||= []).push({ ...it, qty })
    return acc
  }, {})

  const isConsumable = (it) => it.type === 'food' || it.type === 'water'

  const confirmUse = () => {
    if (!pending) return
    useItem(u.id, pending)
    setPending(null)
  }

  if (entries.length === 0) {
    return <div className="screen"><div className="empty">仓库空空的，去商城买点东西吧。</div></div>
  }

  return (
    <div className="screen">
      <div className="inv-tip">
        食物和水在这里可以喂给恐龙 · 也可以到"恐龙"页面喂养
      </div>
      {Object.entries(grouped).map(([type, items]) => (
        <div className="section" key={type}>
          <h2>{TYPE_LABEL[type]}</h2>
          <div className="inv-grid">
            {items.map(it => (
              <button key={it.id} className="inv-item" onClick={() => setPending(it)}>
                <div className="inv-emoji">{it.emoji}</div>
                <div className="inv-name">{it.name}</div>
                <div className="inv-qty">
                  {isConsumable(it) ? `x${it.qty}` : '拥有'}
                </div>
                <div className="inv-action">
                  {isConsumable(it) ? '喂给恐龙' : '装备'}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <ConfirmModal
        open={!!pending}
        emoji={pending?.emoji}
        title={pending ? (isConsumable(pending) ? `喂给 ${u.dino.name}？` : `装备到 ${u.dino.name}？`) : ''}
        itemName={pending?.name}
        effect={pending ? describe(pending) : ''}
        subtitle={
          pending
            ? isConsumable(pending)
              ? `仓库还剩 ${pending.qty - 1} 份`
              : (pending.type === 'weapon' ? '会替换当前武器' : '会替换当前装饰')
            : ''
        }
        confirmText={pending && isConsumable(pending) ? '🍽️ 喂它' : '👍 装备'}
        onConfirm={confirmUse}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

function describe(it) {
  const parts = []
  if (it.hunger) parts.push(`饱食 +${it.hunger}`)
  if (it.thirst) parts.push(`口渴 +${it.thirst}`)
  if (it.mood)   parts.push(`心情 +${it.mood}`)
  if (it.atk)    parts.push(`攻击 +${it.atk}`)
  return parts.join(' · ')
}
