// 商城物品清单 · 见 GDD §4.2
export const CATALOG = [
  { id: 'grass',    type: 'food',  name: '青草',      price: 1,   emoji: '🌿', hunger: 10 },
  { id: 'berry',    type: 'food',  name: '野果',      price: 2,   emoji: '🍎', hunger: 18 },
  { id: 'meat',     type: 'food',  name: '鲜肉',      price: 5,   emoji: '🍖', hunger: 35 },
  { id: 'energy',   type: 'food',  name: '能量果',    price: 12,  emoji: '✨', hunger: 60, mood: 5 },
  { id: 'dragon',   type: 'food',  name: '龙涎果',    price: 30,  emoji: '🌟', hunger: 100, mood: 100 },

  { id: 'river',    type: 'water', name: '河水',      price: 1,   emoji: '💧', thirst: 12 },
  { id: 'spring',   type: 'water', name: '山泉水',    price: 3,   emoji: '🫧', thirst: 30 },
  { id: 'magic',    type: 'water', name: '魔法泉水',  price: 10,  emoji: '💠', thirst: 100, mood: 3 },

  { id: 'stick',    type: 'weapon', name: '木棒',     price: 15,  emoji: '🪵', atk: 2 },
  { id: 'axe',      type: 'weapon', name: '石斧',     price: 40,  emoji: '🪓', atk: 5 },
  { id: 'sword',    type: 'weapon', name: '铁剑',     price: 100, emoji: '🗡️', atk: 12 },
  { id: 'dsword',   type: 'weapon', name: '龙牙剑',   price: 300, emoji: '⚔️', atk: 30 },

  { id: 'wreath',   type: 'decor',  name: '花环',     price: 8,   emoji: '💐', mood: 2 },
  { id: 'cap',      type: 'decor',  name: '侦察帽',   price: 15,  emoji: '🧢', mood: 3 },
  { id: 'cape',     type: 'decor',  name: '英雄披风', price: 25,  emoji: '🧣', mood: 5 },
  { id: 'wings',    type: 'decor',  name: '天使之翼', price: 80,  emoji: '🪽', mood: 10 },
  { id: 'crown',    type: 'decor',  name: '王冠',     price: 200, emoji: '👑', mood: 15 }
]

export const ITEM_BY_ID = Object.fromEntries(CATALOG.map(i => [i.id, i]))

export const TYPE_LABEL = { food: '🍖 食物', water: '💧 水', weapon: '⚔️ 武器', decor: '👑 装饰' }

// 恐龙成长阶段（5 阶段，每阶段约 1 个月）
export const STAGE_NAMES = ['幼年', '少年', '青年', '成年', '究极']
export const STAGE_EXP   = [0, 500, 1100, 1800, 2700]

// 各阶段的基础身高(cm)/体重(kg)/力量。阶段内会随经验线性成长到下一阶段基础值。
export const STAGE_STATS = [
  { height: 50,   weight: 20,    strength: 5   }, // 幼年
  { height: 120,  weight: 80,    strength: 15  }, // 少年
  { height: 220,  weight: 300,   strength: 40  }, // 青年
  { height: 350,  weight: 800,   strength: 80  }, // 成年
  { height: 500,  weight: 2000,  strength: 150 }  // 究极
]

// 计算某只恐龙当前的成长属性（阶段基础值 + 阶段内经验的线性插值）
export function getGrowthStats(stage, exp) {
  const base = STAGE_STATS[stage]
  const nextBase = STAGE_STATS[stage + 1]
  if (!nextBase) return { ...base }
  const startExp = STAGE_EXP[stage]
  const endExp = STAGE_EXP[stage + 1]
  const p = Math.min(1, Math.max(0, (exp - startExp) / (endExp - startExp)))
  const lerp = (a, b) => a + (b - a) * p
  return {
    height: Math.round(lerp(base.height, nextBase.height)),
    weight: Math.round(lerp(base.weight, nextBase.weight)),
    strength: Math.round(lerp(base.strength, nextBase.strength))
  }
}
