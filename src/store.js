import { useSyncExternalStore } from 'react'
import { STAGE_EXP, STAGE_NAMES } from './catalog.js'

const N_STAGES = STAGE_NAMES.length

// 每 24 小时的衰减量（分钟级换算：/1440）
const DECAY_PER_DAY = { hunger: 25, thirst: 30, mood: 12 }
const HOUR = 3600 * 1000
const DAY = 24 * HOUR

// 需要照顾的阈值（任一状态低于此值 → 需要主人来喂）
export const CARE_THRESHOLD = 30

export function needsCare(dino) {
  return dino.hunger < CARE_THRESHOLD || dino.thirst < CARE_THRESHOLD || dino.mood < CARE_THRESHOLD
}

export function careReasons(dino) {
  const r = []
  if (dino.hunger < CARE_THRESHOLD) r.push('🍖 饿了')
  if (dino.thirst < CARE_THRESHOLD) r.push('💧 渴了')
  if (dino.mood < CARE_THRESHOLD)   r.push('😢 心情差')
  return r
}

const STORAGE_KEY = 'dino-quest:v1'
const SNAPSHOTS_KEY = 'dino-quest:snapshots'
const MAX_SNAPSHOTS = 14 // 保留最近 14 天

const DEFAULT_USERS = [
  { id: 'papa',    name: '爸爸', emoji: '🦖', color: '#f97316' },
  { id: 'mama',    name: '妈妈', emoji: '🦕', color: '#ec4899' },
  { id: 'brother', name: '哥哥', emoji: '🐲', color: '#38bdf8' },
  { id: 'sister',  name: '妹妹', emoji: '🦄', color: '#a78bfa' }
]

function makeDino() {
  const now = Date.now()
  return {
    name: '小恐龙',
    stage: 0, exp: 0,
    hunger: 50, thirst: 50, mood: 50,
    atk: 0, weapon: null, decor: null,
    stageImages: Array(N_STAGES).fill(null),
    stageHistory: Array.from({ length: N_STAGES }, (_, i) => ({
      enteredAt: i === 0 ? now : null,
      feedCounts: {}
    })),
    lastTickAt: now
  }
}

// 按经过时间衰减一只恐龙的状态；返回新的 dino 快照
function decayDino(dino, now) {
  const last = dino.lastTickAt || now
  const elapsed = Math.max(0, now - last)
  if (elapsed < 60 * 1000) return dino // 不到一分钟不动
  const dayFrac = elapsed / DAY
  return {
    ...dino,
    hunger: Math.max(0, dino.hunger - DECAY_PER_DAY.hunger * dayFrac),
    thirst: Math.max(0, dino.thirst - DECAY_PER_DAY.thirst * dayFrac),
    mood:   Math.max(0, dino.mood   - DECAY_PER_DAY.mood   * dayFrac),
    lastTickAt: now
  }
}

function initial() {
  return {
    version: 1,
    currentUserId: 'brother',
    notification: null, // { type: 'levelup', userId, newStage }
    users: Object.fromEntries(DEFAULT_USERS.map(u => [
      u.id,
      { ...u, totalPoints: 0, entries: [], inventory: {}, dino: makeDino() }
    ]))
  }
}

// 兼容旧存档：补齐新字段
function migrate(s) {
  if (!s.notification) s.notification = null
  const now = Date.now()
  Object.values(s.users).forEach(u => {
    const d = u.dino
    if (!d.name) d.name = '小恐龙'
    // stageImages 补齐到 N_STAGES 长度
    if (!Array.isArray(d.stageImages)) d.stageImages = []
    while (d.stageImages.length < N_STAGES) d.stageImages.push(null)
    if (d.stageImages.length > N_STAGES) d.stageImages.length = N_STAGES
    // 阶段裁到新上限
    if (d.stage >= N_STAGES) d.stage = N_STAGES - 1
    // stageHistory 初始化：老存档不知道确切进入时间，用 now 兜底
    if (!Array.isArray(d.stageHistory) || d.stageHistory.length !== N_STAGES) {
      d.stageHistory = Array.from({ length: N_STAGES }, (_, i) => ({
        enteredAt: i <= d.stage ? now : null,
        feedCounts: {}
      }))
    }
    if (!d.lastTickAt) d.lastTickAt = now
  })
  return s
}

// 对所有恐龙执行一次衰减 tick
export function tickDecay() {
  const now = Date.now()
  setState(s => {
    let changed = false
    const nextUsers = { ...s.users }
    for (const [id, u] of Object.entries(s.users)) {
      const nd = decayDino(u.dino, now)
      if (nd !== u.dino) {
        nextUsers[id] = { ...u, dino: nd }
        changed = true
      }
    }
    return changed ? { ...s, users: nextUsers } : s
  })
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial()
    const parsed = JSON.parse(raw)
    if (parsed.version !== 1) return initial()
    return migrate(parsed)
  } catch {
    return initial()
  }
}

let state = load()
const listeners = new Set()

// 启动时先做一次衰减，把离开期间的时间"补"上
{
  const now = Date.now()
  for (const u of Object.values(state.users)) {
    u.dino = decayDino(u.dino, now)
  }
  // 首次加载或刷新后立刻写一次，确保 localStorage 永远有当前状态
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  // 每天自动存一份快照（同一天多次打开只覆盖当天的）
  takeSnapshot()
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach(fn => fn())
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater
  save()
}

export function useStore(selector = s => s) {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => selector(state),
    () => selector(state)
  )
}

export function getState() { return state }

// --- Actions ---

export function setCurrentUser(userId) {
  setState(s => ({ ...s, currentUserId: userId }))
}

function updateUser(userId, patch) {
  setState(s => ({
    ...s,
    users: { ...s.users, [userId]: { ...s.users[userId], ...patch } }
  }))
}

function updateDino(userId, patch) {
  setState(s => {
    const u = s.users[userId]
    return { ...s, users: { ...s.users, [userId]: { ...u, dino: { ...u.dino, ...patch } } } }
  })
}

export function addWeeklyEntry(userId, { weekOf, points, note }) {
  const u = state.users[userId]
  updateUser(userId, {
    totalPoints: u.totalPoints + points,
    entries: [{ weekOf, points, note, at: Date.now() }, ...u.entries]
  })
}

export function removeEntry(userId, index) {
  const u = state.users[userId]
  const entry = u.entries[index]
  if (!entry) return
  updateUser(userId, {
    totalPoints: u.totalPoints - entry.points,
    entries: u.entries.filter((_, i) => i !== index)
  })
}

export function buy(userId, itemId, price) {
  const u = state.users[userId]
  if (u.totalPoints < price) return false
  updateUser(userId, {
    totalPoints: u.totalPoints - price,
    inventory: { ...u.inventory, [itemId]: (u.inventory[itemId] || 0) + 1 }
  })
  return true
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function useItem(userId, item) {
  const u = state.users[userId]
  if (!u.inventory[item.id]) return
  const d = u.dino

  if (item.type === 'food' || item.type === 'water') {
    const nextHunger = clamp(d.hunger + (item.hunger || 0), 0, 100)
    const nextThirst = clamp(d.thirst + (item.thirst || 0), 0, 100)
    const nextMood = clamp(d.mood + (item.mood || 0), 0, 100)
    const expGain = (item.hunger || 0) + (item.thirst || 0)
    let nextExp = d.exp + expGain
    let nextStage = d.stage
    while (nextStage < STAGE_EXP.length - 1 && nextExp >= STAGE_EXP[nextStage + 1]) nextStage++

    // 记录本次进食到"当前阶段"的历史里（先记再升阶）
    const now = Date.now()
    const history = d.stageHistory.map(h => ({ ...h, feedCounts: { ...h.feedCounts } }))
    const cur = history[d.stage]
    cur.feedCounts[item.id] = (cur.feedCounts[item.id] || 0) + 1
    // 如果升阶，为新阶段记录进入时间
    for (let s = d.stage + 1; s <= nextStage; s++) {
      if (!history[s].enteredAt) history[s].enteredAt = now
    }

    updateDino(userId, {
      hunger: nextHunger, thirst: nextThirst, mood: nextMood,
      exp: nextExp, stage: nextStage, stageHistory: history,
      lastTickAt: Date.now()
    })
    if (nextStage > d.stage) {
      setState(s => ({ ...s, notification: { type: 'levelup', userId, newStage: nextStage } }))
    }
  } else if (item.type === 'weapon') {
    updateDino(userId, { weapon: item.id, atk: item.atk })
  } else if (item.type === 'decor') {
    const nextMood = clamp(d.mood + (item.mood || 0), 0, 100)
    updateDino(userId, { decor: item.id, mood: nextMood })
  }

  // 消耗品扣数量；装备/装饰不扣（保留在仓库）
  if (item.type === 'food' || item.type === 'water') {
    const next = { ...u.inventory, [item.id]: u.inventory[item.id] - 1 }
    if (next[item.id] <= 0) delete next[item.id]
    updateUser(userId, { inventory: next })
  }
}

export function setDinoName(userId, name) {
  const trimmed = (name || '').trim().slice(0, 12) || '小恐龙'
  const u = state.users[userId]
  updateUser(userId, { dino: { ...u.dino, name: trimmed } })
}

export function dismissNotification() {
  setState(s => ({ ...s, notification: null }))
}

export function setStageImage(userId, stageIndex, dataUrl) {
  const u = state.users[userId]
  const arr = [...u.dino.stageImages]
  arr[stageIndex] = dataUrl
  updateDino(userId, { stageImages: arr })
}

export function resetAll() {
  const answer = prompt('这会清空全家所有积分、恐龙、仓库，且不可恢复。\n\n如果确定，请输入"重置"两个字：')
  if (answer !== '重置') return
  localStorage.removeItem(STORAGE_KEY)
  state = initial()
  save()
}

// 备份/恢复
export function exportData() {
  return JSON.stringify(state, null, 2)
}

export function importData(json) {
  try {
    const parsed = JSON.parse(json)
    if (parsed.version !== 1 || !parsed.users) throw new Error('格式不对')
    state = parsed
    save()
    return true
  } catch (e) {
    alert('导入失败：' + e.message)
    return false
  }
}

// --- 自动每日快照（存在 localStorage 里，占用几 KB 忽略不计）---

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function readSnapshots() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeSnapshots(list) {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list))
}

export function listSnapshots() {
  return readSnapshots().map(({ date, at }) => ({ date, at }))
}

export function takeSnapshot() {
  const today = todayKey()
  const list = readSnapshots().filter(s => s.date !== today) // 同一天覆盖
  list.unshift({ date: today, at: Date.now(), data: JSON.stringify(state) })
  while (list.length > MAX_SNAPSHOTS) list.pop()
  writeSnapshots(list)
}

export function restoreSnapshot(date) {
  const snap = readSnapshots().find(s => s.date === date)
  if (!snap) return false
  return importData(snap.data)
}
