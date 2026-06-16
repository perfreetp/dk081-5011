import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import {
  Sparkles,
  Clock,
  TrendingUp,
  Leaf,
  Shield,
  Heart,
  BookOpen,
  ArrowUpRight,
  Lightbulb,
  Package,
  Wrench,
  Tag,
} from 'lucide-react'

const priceBars = [
  { label: '购入', pct: 60 },
  { label: '当前', pct: 75 },
  { label: '峰值', pct: 100 },
]

export default function Archive() {
  const { id } = useParams<{ id: string }>()
  const furniture = useStore().getFurnitureById(id!)

  if (!furniture) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-charcoal-light text-lg">未找到该家具档案</p>
      </div>
    )
  }

  const { careTips, repairHistory, source, condition, resaleSuggestion } = furniture
  const [low, high] = resaleSuggestion.priceRange
  const fmt = (n: number) => n.toLocaleString('zh-CN')

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal">售后档案</h1>
          <p className="font-serif text-walnut text-lg mt-1">{furniture.name}</p>
        </div>

        {/* Care Tips Card */}
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

        {/* Source & Repair Timeline */}
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

        {/* Resale Suggestion Card */}
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

          {/* CSS-only price trend chart */}
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-charcoal-light mb-2">价格趋势</p>
            <div className="flex items-end gap-3 h-16">
              {priceBars.map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-walnut/70 transition-all"
                    style={{ height: `${bar.pct}%` }}
                  />
                  <span className="text-[10px] text-charcoal-light">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-sm border-t border-cream-dark">
        <div className="max-w-lg mx-auto px-4 py-4 flex gap-3">
          <button className="flex-1 py-3 rounded-2xl border-2 border-walnut text-walnut font-medium text-sm flex items-center justify-center gap-1.5">
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
