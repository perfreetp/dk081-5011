import { useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store'
import {
  Sparkles,
  Clock,
  TrendingUp,
  Leaf,
  Shield,
  Heart,
  BookOpen,
  Lightbulb,
  Package,
  Wrench,
  Tag,
  CheckCircle,
  Truck,
  Eye,
  User,
  Ruler,
  Camera,
  Calendar,
  X,
  Copy,
} from 'lucide-react'
import type { BookingOrder, DamageReport } from '@/types'

const priceBars = [
  { label: '购入', pct: 60 },
  { label: '当前', pct: 75 },
  { label: '峰值', pct: 100 },
]

const RESPONSIBILITY_LABEL: Record<string, { text: string; cls: string }> = {
  transit: { text: '运输责任', cls: 'bg-risk-medium/10 text-risk-medium' },
  pre_existing: { text: '原有瑕疵', cls: 'bg-charcoal-light/10 text-charcoal-light' },
  installer: { text: '安装责任', cls: 'bg-walnut/10 text-walnut' },
}

export default function Archive() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { getFurnitureById, getOrderById, getOrderByFurnitureId, damageReports } = useStore()
  const furniture = getFurnitureById(id!)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  const orderIdFromUrl = searchParams.get('order')
  const order = orderIdFromUrl
    ? getOrderById(orderIdFromUrl)
    : furniture
      ? getOrderByFurnitureId(furniture.id)
      : undefined

  if (!furniture) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-charcoal-light text-lg">未找到该家具档案</p>
      </div>
    )
  }

  const relatedDamageReports = order
    ? damageReports.filter((r: DamageReport) => r.orderId === order.id)
    : []

  const { careTips, repairHistory, source, condition, resaleSuggestion } = furniture
  const [low, high] = resaleSuggestion.priceRange
  const fmt = (n: number) => n.toLocaleString('zh-CN')

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const serviceLabel = order?.serviceType === 'deliver_then_install' ? '先送后装' : '到货验品再装'
  const timeSlotLabel = order?.timeSlot === 'morning' ? '上午 8:00-12:00' : '下午 13:00-18:00'

  const buildShareText = () => {
    const lines: string[] = []
    lines.push(`【居雅送装 · 家具档案】`)
    lines.push(``)
    lines.push(`📦 ${furniture.name}`)
    lines.push(`材质：${furniture.material}`)
    lines.push(`品相：${condition}`)
    lines.push(`来源：${source}`)
    lines.push(``)
    if (order) {
      lines.push(`── 送装履历 ──`)
      lines.push(`预约时间：${order.dateSlot} ${timeSlotLabel}`)
      lines.push(`服务方式：${serviceLabel}`)
      if (order.addOns.whiteGlove) lines.push(`增值服务：白手套服务`)
      if (order.addOns.takeOld) lines.push(`增值服务：旧家具带走`)
      lines.push(`安装师傅：${order.installer.name}（★${order.installer.rating} / ${order.installer.yearsExperience}年经验）`)
      lines.push(`擅长：${order.installer.specialties.join('、')}`)
      if (order.entryCheckResult) {
        lines.push(`入户检测：${order.entryCheckResult.text}`)
      }
      if (relatedDamageReports.length > 0) {
        lines.push(`磕碰记录（${relatedDamageReports.length}条）：`)
        relatedDamageReports.forEach((r) => {
          const resp = RESPONSIBILITY_LABEL[r.responsibility]
          lines.push(`  - [${resp.text}] ${r.description}`)
        })
      } else {
        lines.push(`磕碰记录：无`)
      }
      if (order.deliveredAt) lines.push(`送达时间：${formatDate(order.deliveredAt)}`)
      if (order.completedAt) lines.push(`完成时间：${formatDate(order.completedAt)}`)
      lines.push(`服务费用：¥${order.totalFee.toLocaleString()}`)
      lines.push(``)
    }
    lines.push(`── 保养建议 ──`)
    careTips.forEach((t) => lines.push(`· ${t}`))
    lines.push(``)
    lines.push(`── 转卖建议 ──`)
    lines.push(`参考价格：¥${fmt(low)} - ¥${fmt(high)}`)
    lines.push(resaleSuggestion.bestTiming)
    return lines.join('\n')
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(buildShareText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = buildShareText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [furniture, order, relatedDamageReports])

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">售后档案</h1>
          <p className="font-serif text-walnut text-lg mt-1">{furniture.name}</p>
        </div>

        {order && (
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-walnut" />
              <h2 className="font-serif text-lg text-charcoal">送装履历</h2>
              {order.status === 'completed' && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-sage/10 text-sage font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  已完成
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-cream-50 rounded-xl p-3">
                <Calendar className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
                <div className="text-sm text-charcoal">
                  <p className="font-medium">预约时间</p>
                  <p className="text-charcoal-light text-xs mt-0.5">{order.dateSlot} {timeSlotLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-cream-50 rounded-xl p-3">
                {order.serviceType === 'deliver_then_install' ? <Truck className="w-4 h-4 text-walnut mt-0.5 shrink-0" /> : <Eye className="w-4 h-4 text-walnut mt-0.5 shrink-0" />}
                <div className="text-sm text-charcoal">
                  <p className="font-medium">服务方式</p>
                  <p className="text-charcoal-light text-xs mt-0.5">{serviceLabel}</p>
                  {order.addOns.whiteGlove && <p className="text-xs text-walnut mt-0.5">+ 白手套服务</p>}
                  {order.addOns.takeOld && <p className="text-xs text-walnut mt-0.5">+ 旧家具带走</p>}
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-cream-50 rounded-xl p-3">
                <User className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
                <div className="text-sm text-charcoal">
                  <p className="font-medium">安装师傅</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-charcoal-light text-xs">{order.installer.name}</span>
                    <span className="text-xs text-walnut">★ {order.installer.rating}</span>
                    <span className="text-charcoal-light text-xs">{order.installer.yearsExperience}年经验</span>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {order.installer.specialties.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded-full bg-walnut-50 text-walnut text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {order.entryCheckResult && (
                <div className={`flex items-start gap-2.5 rounded-xl p-3 ${
                  order.entryCheckResult.type === 'pass' ? 'bg-sage/5' :
                  order.entryCheckResult.type === 'warn' ? 'bg-amber-50/60' : 'bg-red-50/60'
                }`}>
                  <Ruler className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
                  <div className="text-sm text-charcoal">
                    <p className="font-medium">入户检测结论</p>
                    <p className="text-xs mt-0.5">{order.entryCheckResult.text}</p>
                    {order.entryCheckResult.details && order.entryCheckResult.details.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {order.entryCheckResult.details.map((d, i) => (
                          <li key={i} className="text-[11px] text-charcoal-light">{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {relatedDamageReports.length > 0 && (
                <div className="flex items-start gap-2.5 bg-cream-50 rounded-xl p-3">
                  <Camera className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
                  <div className="text-sm text-charcoal flex-1 min-w-0">
                    <p className="font-medium">磕碰记录（{relatedDamageReports.length}条）</p>
                    <div className="mt-1.5 space-y-1.5">
                      {relatedDamageReports.map((r) => {
                        const resp = RESPONSIBILITY_LABEL[r.responsibility]
                        return (
                          <div key={r.id} className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${resp.cls}`}>
                              {resp.text}
                            </span>
                            <span className="text-xs text-charcoal truncate">{r.description}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {order.deliveredAt && (
                <div className="flex items-start gap-2.5 bg-cream-50 rounded-xl p-3">
                  <Package className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                  <div className="text-sm text-charcoal">
                    <p className="font-medium">送达时间</p>
                    <p className="text-xs text-charcoal-light mt-0.5">{formatDate(order.deliveredAt)}</p>
                  </div>
                </div>
              )}

              {order.completedAt && (
                <div className="flex items-start gap-2.5 bg-sage/5 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                  <div className="text-sm text-charcoal">
                    <p className="font-medium">安装完成时间</p>
                    <p className="text-xs text-charcoal-light mt-0.5">{formatDate(order.completedAt)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 bg-cream-50 rounded-xl p-3">
                <Wrench className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
                <div className="text-sm text-charcoal">
                  <p className="font-medium">服务费用</p>
                  <p className="font-serif text-walnut text-base mt-0.5">¥{order.totalFee.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-sage-50 border-l-4 border-sage rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-sage" />
            <h2 className="font-serif text-lg text-sage-700">摆放与保养建议</h2>
          </div>
          <ul className="space-y-2">
            {careTips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-charcoal">
                <Leaf className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-walnut" />
            <h2 className="font-serif text-lg text-charcoal">来源与修补记录</h2>
          </div>

          <div className="flex items-start gap-2 mb-5 bg-cream-100 rounded-xl p-3">
            <Package className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
            <div className="text-sm text-charcoal">
              <p className="font-medium">{source}</p>
              <p className="text-charcoal-light mt-0.5">品相：{condition}</p>
            </div>
          </div>

          {repairHistory.length === 0 ? (
            <div className="flex items-center gap-2 text-sage text-sm py-3">
              <Shield className="w-4 h-4" />
              <span>该家具暂无修补记录，品相完好</span>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-walnut-200" />
              {repairHistory.map((record, i) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-cream border-2 border-walnut flex items-center justify-center">
                    <Clock className="w-2.5 h-2.5 text-walnut" />
                  </div>
                  <p className="text-xs text-charcoal-light mb-0.5">{record.date}</p>
                  <p className="text-sm text-charcoal">{record.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-walnut-50 border-l-4 border-walnut rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-walnut" />
            <h2 className="font-serif text-lg text-walnut-dark">再次转卖建议</h2>
          </div>

          <p className="font-serif text-2xl text-walnut mb-3">
            ¥ {fmt(low)} - ¥ {fmt(high)}
          </p>

          <div className="flex items-start gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
            <p className="text-sm text-charcoal">{resaleSuggestion.bestTiming}</p>
          </div>

          <ul className="space-y-2 mb-5">
            {resaleSuggestion.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-charcoal">
                <Tag className="w-4 h-4 text-walnut mt-0.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-charcoal-light mb-2">价格趋势</p>
            <div className="flex items-end gap-3 h-16">
              {priceBars.map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-walnut/70 transition-all" style={{ height: `${bar.pct}%` }} />
                  <span className="text-[10px] text-charcoal-light">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showShare && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-dark">
              <h3 className="font-serif text-lg font-semibold text-charcoal">分享档案</h3>
              <button onClick={() => setShowShare(false)} className="p-1 -mr-1 text-charcoal-light"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap text-sm text-charcoal leading-relaxed font-sans bg-cream-50 rounded-xl p-4 border border-cream-dark">
                {buildShareText()}
              </pre>
            </div>
            <div className="px-5 py-4 border-t border-cream-dark flex gap-3">
              <button onClick={() => setShowShare(false)} className="flex-1 py-3 rounded-xl border-2 border-cream-dark text-charcoal font-medium text-sm">关闭</button>
              <button onClick={handleCopy} className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all ${
                copied ? 'bg-sage text-white' : 'bg-walnut text-white'
              }`}>
                {copied ? <><CheckCircle className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制文本</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-sm border-t border-cream-dark">
        <div className="max-w-lg mx-auto px-4 py-4 flex gap-3">
          <button onClick={() => setShowShare(true)} className="flex-1 py-3 rounded-2xl border-2 border-walnut text-walnut font-medium text-sm flex items-center justify-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            分享档案
          </button>
          <button className="flex-1 py-3 rounded-2xl bg-walnut text-white font-medium text-sm flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4" />
            再次购买
          </button>
        </div>
      </div>
    </div>
  )
}
