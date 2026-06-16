import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import {
  AlertTriangle, CheckCircle, Circle, ChevronDown, ChevronUp,
  Ruler, DoorOpen, Shield, BrushCleaning, Dog, Box, ArrowRight, Info,
} from 'lucide-react'

const RISK_MAP = {
  low: { label: '低风险', color: 'var(--color-sage)', border: 'border-l-[var(--color-sage)]', badge: 'bg-sage/10 text-sage' },
  medium: { label: '中风险', color: 'var(--color-risk-medium)', border: 'border-l-[var(--color-risk-medium)]', badge: 'bg-amber-50 text-amber-600' },
  high: { label: '高风险', color: 'var(--color-risk-high)', border: 'border-l-[var(--color-risk-high)]', badge: 'bg-red-50 text-red-500' },
}

const CHECKLIST = [
  { icon: BrushCleaning, title: '清洁入户通道', desc: '确保从电梯到家门的通道无杂物' },
  { icon: DoorOpen, title: '清空门口空间', desc: '为搬运留出至少1.5米宽的通道' },
  { icon: Dog, title: '安置宠物', desc: '将宠物隔离到其他房间，避免惊扰' },
  { icon: Box, title: '收纳易碎品', desc: '移走通道附近的易碎装饰品' },
  { icon: Shield, title: '铺设保护地垫', desc: '在通道地面铺设保护垫（白手套服务包含）' },
]

export default function Prepare() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getOrderById, getFurnitureById, updateOrder } = useStore()

  const order = getOrderById(id!)
  const furniture = order ? getFurnitureById(order.furnitureId) : undefined

  const [notesOpen, setNotesOpen] = useState(false)
  const [elevW, setElevW] = useState('')
  const [elevH, setElevH] = useState('')
  const [corrW, setCorrW] = useState('')
  const [doorW, setDoorW] = useState('')
  const [turnSpace, setTurnSpace] = useState('')
  const [result, setResult] = useState<{ type: 'pass' | 'warn' | 'fail'; text: string; details?: string[] } | null>(null)
  const [checked, setChecked] = useState<boolean[]>(new Array(CHECKLIST.length).fill(false))

  if (!order || !furniture) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-charcoal-light">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-400" />
        <p>未找到订单信息</p>
      </div>
    )
  }

  const risk = RISK_MAP[furniture.riskLevel]
  const dim = furniture.dimensions
  const doneCount = checked.filter(Boolean).length
  const progress = Math.round((doneCount / CHECKLIST.length) * 100)

  const handleCheck = () => {
    const ew = Number(elevW)
    const eh = Number(elevH)
    const cw = Number(corrW)
    const dw = Number(doorW)
    const ts = Number(turnSpace)

    const needsElevator = ew && eh
    const needsCorridor = cw
    const needsDoor = dw
    if (!needsElevator || !needsCorridor || !needsDoor) {
      setResult({ type: 'warn', text: '请填写完整后再检测', details: ['电梯宽/高、走廊宽度、入户门宽度为必填项'] })
      return
    }

    const passDetails: string[] = []
    const warnDetails: string[] = []
    const failDetails: string[] = []

    const fW = dim.width
    const fH = dim.height
    const fL = dim.length

    // 1. 电梯判定（家具需要能在电梯里转身，取宽和高的较大者比较）
    const maxCross = Math.max(fW, fH)
    const minElevClearance = 15
    if (ew >= maxCross + minElevClearance && eh >= fH + minElevClearance) {
      passDetails.push(`✓ 电梯可容纳（净空 ${ew}×${eh}cm ≥ 家具 ${maxCross}×${fH}cm）`)
    } else if (ew >= fW + 5 && eh >= fH + 5) {
      warnDetails.push(`△ 电梯空间勉强（建议拆包或立起搬运）`)
    } else {
      failDetails.push(`✗ 电梯过小（需至少 ${maxCross + minElevClearance}×${fH + minElevClearance}cm 净空）`)
    }

    // 2. 走廊判定（直线通过：宽度需 ≥ 家具宽度 + 20cm 余量）
    const minCorridor = fW + 20
    if (cw >= minCorridor) {
      passDetails.push(`✓ 走廊畅通（${cw}cm ≥ 家具宽度 ${fW}cm + 余量 20cm）`)
    } else if (cw >= fW + 5) {
      warnDetails.push(`△ 走廊偏窄（${cw}cm，需侧搬或专人指挥）`)
    } else {
      failDetails.push(`✗ 走廊过窄（至少需要 ${minCorridor}cm 才能通过）`)
    }

    // 3. 转角空间判定（家具为长条形时必须有足够转角，取 length 和 width 的对角线判断）
    if (ts) {
      const diagonal = Math.round(Math.sqrt(fL * fL + fW * fW))
      if (ts >= diagonal) {
        passDetails.push(`✓ 转角空间充足（${ts}cm ≥ 对角线 ${diagonal}cm）`)
      } else if (ts >= Math.max(fL, fW) + 10) {
        warnDetails.push(`△ 转角空间紧凑（建议拆包后斜搬通过）`)
      } else {
        failDetails.push(`✗ 转角空间不足（家具对角线约 ${diagonal}cm）`)
      }
    } else if (fL > 150 || fW > 90) {
      warnDetails.push('△ 未填转角空间，大件家具建议核实是否有L型转角')
    }

    // 4. 入户门判定
    const minDoor = fW + 8
    if (dw >= minDoor) {
      passDetails.push(`✓ 入户门可通过（${dw}cm ≥ 家具宽度 ${fW}cm + 8cm 余量）`)
    } else if (dw >= fW - 2) {
      warnDetails.push(`△ 入户门勉强（建议拆下门挡或拆家具外包）`)
    } else {
      failDetails.push(`✗ 入户门过窄（至少需要 ${minDoor}cm）`)
    }

    // 综合结论
    const failCount = failDetails.length
    const warnCount = warnDetails.length
    const allDetails = [...failDetails, ...warnDetails, ...passDetails]

    let finalType: 'pass' | 'warn' | 'fail'
    let finalText: string
    if (failCount > 0) {
      finalType = 'fail'
      finalText = '✗ 入户风险较高，建议联系客服安排吊装或拆装方案'
    } else if (warnCount > 0) {
      finalType = 'warn'
      finalText = '△ 可入户但需注意：搬运过程请预留人手，必要时拆包侧搬'
    } else {
      finalType = 'pass'
      finalText = '✓ 可顺利入户，所有通道满足搬运要求'
    }

    setResult({ type: finalType, text: finalText, details: allDetails })
    if (order) {
      updateOrder(order.id, { entryCheckResult: { type: finalType, text: finalText, details: allDetails } })
    }
  }

  const resultColor = result
    ? result.type === 'pass' ? 'bg-sage/10 text-sage border-sage/30'
    : result.type === 'warn' ? 'bg-amber-50 text-amber-600 border-amber-200'
    : 'bg-red-50 text-red-500 border-red-200'
    : ''

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-fade-in-up">
      {/* Risk Assessment */}
      <section className={`bg-white rounded-2xl shadow-card border-l-4 ${risk.border} p-5 space-y-3`}>
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5" style={{ color: risk.color }} />
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${risk.badge}`}>{risk.label}</span>
          <span className="text-charcoal-light text-sm ml-auto">入户风险提醒</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-charcoal-light">
          <Ruler className="w-4 h-4 text-walnut" />
          <span>家具尺寸：<b className="text-charcoal">{dim.length}×{dim.width}×{dim.height}</b> cm · {dim.weight}kg</span>
        </div>
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="flex items-center gap-1.5 text-sm text-walnut font-medium hover:opacity-80 transition"
        >
          <Info className="w-4 h-4" />
          风险提示详情
          {notesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {notesOpen && (
          <ul className="space-y-1.5 pl-1 animate-fade-in">
            {furniture.riskNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal-light">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: risk.color }} />
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Elevator & Corridor Check */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <h2 className="font-serif text-lg text-charcoal flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-walnut" />
          电梯尺寸与通道确认
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '电梯宽度', value: elevW, set: setElevW },
            { label: '电梯高度', value: elevH, set: setElevH },
            { label: '走廊宽度', value: corrW, set: setCorrW },
            { label: '入户门宽度', value: doorW, set: setDoorW },
            { label: '转角空间', value: turnSpace, set: setTurnSpace, full: true },
          ].map((f) => {
            const cls = (f as { full?: boolean }).full ? 'col-span-2' : ''
            return (
              <label key={f.label} className={`flex items-center gap-1.5 bg-cream rounded-xl px-3 py-2.5 ${cls}`}>
                <Ruler className="w-3.5 h-3.5 text-walnut shrink-0" />
                <input
                  type="number"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.label + (f.label === '转角空间' ? '(选填)' : '')}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-charcoal-300 min-w-0"
                />
                <span className="text-xs text-charcoal-light shrink-0">cm</span>
              </label>
            )
          })}
        </div>
        <button
          onClick={handleCheck}
          className="w-full py-2.5 rounded-xl bg-walnut text-white text-sm font-medium hover:bg-walnut-dark transition"
        >
          检测结果
        </button>
        {result && (
          <div className={`rounded-xl border px-4 py-3 space-y-2 animate-fade-in ${resultColor}`}>
            <p className="text-sm font-medium">{result.text}</p>
            {result.details && result.details.length > 0 && (
              <ul className="space-y-0.5 pt-1 border-t border-current/20">
                {result.details.map((d, i) => (
                  <li key={i} className="text-[11px] opacity-90">{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Preparation Checklist */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-charcoal">上门前提示</h2>
          <span className="text-xs text-charcoal-light">{doneCount}/{CHECKLIST.length} 已完成</span>
        </div>
        <div className="w-full h-1.5 bg-cream-dark rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: doneCount === CHECKLIST.length ? 'var(--color-sage)' : 'var(--color-walnut)' }}
          />
        </div>
        <div className="space-y-0">
          {CHECKLIST.map((item, i) => {
            const Icon = item.icon
            const done = checked[i]
            return (
              <div key={i} className="flex items-start gap-3 relative">
                {i < CHECKLIST.length - 1 && (
                  <div className="absolute left-[9px] top-7 bottom-0 w-px bg-cream-dark" />
                )}
                <button
                  onClick={() => setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n })}
                  className="mt-0.5 shrink-0"
                >
                  {done
                    ? <CheckCircle className="w-[18px] h-[18px] text-sage" />
                    : <Circle className="w-[18px] h-[18px] text-charcoal-200" />}
                </button>
                <div className="flex items-start gap-2 pb-4">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${done ? 'text-sage' : 'text-walnut'}`} />
                  <div>
                    <p className={`text-sm font-medium ${done ? 'text-charcoal-300 line-through' : 'text-charcoal'}`}>{item.title}</p>
                    <p className="text-xs text-charcoal-300 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {doneCount === CHECKLIST.length && (
          <div className="rounded-xl bg-sage/10 border border-sage/30 px-4 py-3 text-center text-sm font-medium text-sage animate-fade-in">
            ✓ 准备就绪
          </div>
        )}
      </section>

      {/* CTA */}
      <button
        onClick={() => navigate(`/tracking/${order.id}`)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-walnut text-white font-medium hover:bg-walnut-dark transition shadow-card"
      >
        前往追踪
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
