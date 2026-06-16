import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowLeft, Ruler, Shield, AlertTriangle, ChevronRight, Check, Info } from 'lucide-react'
import { CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const riskStyles = {
  low: 'bg-sage-50 text-sage-700 border-sage-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

const riskIconColor = { low: 'text-sage-500', medium: 'text-amber-500', high: 'text-red-500' }

const serviceOptions = [
  {
    type: 'deliver_then_install' as const,
    title: '先送后装',
    desc: '先配送至家中，再安排师傅上门安装，适合需要提前规划空间的客户',
  },
  {
    type: 'inspect_then_install' as const,
    title: '到货验品再装',
    desc: '送达当场验货确认无损后再安装，适合贵重易损家具推荐方式',
  },
]

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getFurnitureById = useStore((s) => s.getFurnitureById)
  const furniture = id ? getFurnitureById(id) : undefined

  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)

  if (!furniture) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream">
        <p className="text-charcoal-light mb-4">未找到该家具信息</p>
        <button onClick={() => navigate(-1)} className="text-walnut underline">
          返回
        </button>
      </div>
    )
  }

  const d = furniture.dimensions

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="sticky top-0 z-20 bg-cream/80 backdrop-blur-md px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-charcoal">
          <ArrowLeft size={22} />
        </button>
        <span className="ml-3 font-serif text-lg text-charcoal truncate">
          {furniture.name}
        </span>
      </div>

      <div className="px-4">
        <div className="rounded-2xl overflow-hidden shadow-card bg-white">
          <img
            src={furniture.images[selectedImage]}
            alt={furniture.name}
            className="w-full aspect-[4/3] object-cover"
          />
          {furniture.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {furniture.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    selectedImage === i ? 'border-walnut' : 'border-transparent opacity-60'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <h1 className="font-serif text-2xl text-charcoal leading-tight">
                {furniture.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-walnut-50 text-walnut text-xs font-medium">
                {CATEGORY_LABELS[furniture.category]}
              </span>
              <span className="flex items-center gap-1 text-sm text-charcoal-light">
                <Shield size={14} className="text-sage-500" />
                {furniture.condition}
              </span>
            </div>
            <p className="font-serif text-3xl text-walnut">
              ¥{furniture.price.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3 text-charcoal font-medium">
              <Ruler size={16} className="text-walnut" />
              规格参数
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '尺寸', value: `${d.length}×${d.width}×${d.height} cm` },
                { label: '重量', value: `${d.weight} kg` },
                { label: '材质', value: furniture.material },
                { label: '来源', value: furniture.source },
              ].map((item) => (
                <div key={item.label} className="bg-cream-50 rounded-xl p-3">
                  <p className="text-xs text-charcoal-light">{item.label}</p>
                  <p className="text-sm text-charcoal mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn('rounded-2xl border p-5', riskStyles[furniture.riskLevel])}>
            <div className="flex items-center gap-2 mb-2 font-medium">
              <AlertTriangle size={16} className={riskIconColor[furniture.riskLevel]} />
              运输风险提示
            </div>
            <ul className="space-y-1">
              {furniture.riskNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-3">
            <Info size={16} className="text-walnut shrink-0" />
            <div>
              <p className="text-xs text-charcoal-light">来源信息</p>
              <p className="text-sm text-charcoal">{furniture.source}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-cream px-4 pb-6 pt-3 border-t border-cream-dark">
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-walnut text-white rounded-xl py-3 w-full font-serif text-lg shadow-warm active:scale-[0.98] transition-transform"
        >
          预约送装
        </button>
      </div>

      {showBookingModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 animate-fade-in"
            onClick={() => setShowBookingModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl text-charcoal">选择送装方式</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-charcoal-light text-sm"
              >
                关闭
              </button>
            </div>
            <div className="space-y-3">
              {serviceOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => navigate(`/booking/${id}?service=${opt.type}`)}
                  className="w-full flex items-center gap-4 bg-cream-50 rounded-2xl p-4 text-left hover:bg-cream-dark transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-walnut-50 flex items-center justify-center shrink-0">
                    <Check size={18} className="text-walnut" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal">{opt.title}</p>
                    <p className="text-xs text-charcoal-light mt-0.5">{opt.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-charcoal-light shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
