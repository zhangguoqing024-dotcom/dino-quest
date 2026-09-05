import { useState } from 'react'
import { useStore, buy } from '../store.js'
import { CATALOG, TYPE_LABEL } from '../catalog.js'

export default function Shop() {
  const state = useStore()
  const u = state.users[state.currentUserId]
  const [pending, setPending] = useState(null) // 待确认购买的物品

  const grouped = CATALOG.reduce((acc, it) => {
    (acc[it.type] ||= []).push(it)
    return acc
  }, {})

  const onTap = (item) => {
    if (u.totalPoints < item.price) {
      alert(`积分不够啦！还差 ${item.price - u.totalPoints} 分`)
      return
    }
    setPending(item)
  }

  const confirmBuy = () => {
    if (!pending) return
    buy(u.id, pending.id, pending.price)
    setPending(null)
  }

  return (
    <div className="screen">
      <div className="wallet">
        {u.name}的钱包：<b>{u.totalPoints}</b> 分
      </div>
      {Object.entries(grouped).map(([type, items]) => (
        <div className="section" key={type}>
          <h2>{TYPE_LABEL[type]}</h2>
          <div className="shop-grid">
            {items.map(it => {
              const affordable = u.totalPoints >= it.price
              return (
                <button
                  key={it.id}
                  className={'shop-item' + (affordable ? '' : ' disabled')}
                  onClick={() => onTap(it)}
                >
                  <div className="shop-emoji">{it.emoji}</div>
                  <div className="shop-name">{it.name}</div>
                  <div className="shop-effect">{describeEffect(it)}</div>
                  <div className="shop-price">{it.price} 分</div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {pending && (
        <div className="modal-backdrop" onClick={() => setPending(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="buy-emoji">{pending.emoji}</div>
            <div className="modal-title">确认购买？</div>
            <div className="buy-item-name">{pending.name}</div>
            <div className="buy-effect">{describeEffect(pending) || '装备后可穿戴'}</div>
            <div className="buy-cost">
              花费 <b>{pending.price}</b> 分 · 剩余 <b>{u.totalPoints - pending.price}</b> 分
            </div>
            <div className="buy-actions">
              <button className="btn-secondary" onClick={() => setPending(null)}>取消</button>
              <button className="btn-primary" onClick={confirmBuy}>✅ 确认购买</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function describeEffect(it) {
  const parts = []
  if (it.hunger) parts.push(`饱食 +${it.hunger}`)
  if (it.thirst) parts.push(`口渴 +${it.thirst}`)
  if (it.mood)   parts.push(`心情 +${it.mood}`)
  if (it.atk)    parts.push(`攻击 +${it.atk}`)
  return parts.join(' · ')
}
