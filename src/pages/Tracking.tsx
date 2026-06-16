import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store'
import { MapPin, Phone, Star, Clock, Truck, Camera, CheckCircle, AlertTriangle, ChevronRight, Navigation, Timer, User } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'text-risk-medium' },
  preparing: { label: '准备中', color: 'text-charcoal-light' },
  in_transit: { label: '运输中', color: 'text-walnut' },
  arriving: { label: '即将到达', color: 'text-walnut-light' },
  installing: { label: '安装中', color: 'text-sage' },
  completed: { label: '已完成', color: 'text-sage-dark' },
}

const FLOW = ['pending', 'preparing', 'in_transit', 'arriving', 'installing', 'completed']

const RESPONSIBILITY_LABEL: Record<string, { text: string; cls: string }> = {
  transit: { text: '运输责任', cls: 'bg-risk-medium/10 text-risk-medium' },
  pre_existing: { text: '原有瑕疵', cls: 'bg-charcoal-light/10 text-charcoal-light' },
  installer: { text: '安装责任', cls: 'bg-walnut/10 text-walnut' },
}

export default function Tracking() {
  const { id } = useParams<{ id: string }>()
  const { getOrderById, getFurnitureById, damageReports } = useStore()
  const [showUpload, setShowUpload] = useState(false)

  const order = getOrderById(id!)
  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-risk-medium mx-auto mb-3" />
          <p className="text-charcoal-light">未找到订单信息</p>
          <Link to="/" className="text-walnut mt-2 inline-block">返回首页</Link>
        </div>
      </div>
    )
  }

  const furniture = getFurnitureById(order.furnitureId)
  const statusInfo = STATUS_MAP[order.status]
  const stepIndex = FLOW.indexOf(order.status)
  const reports = damageReports.filter((r) => r.orderId === order.id)

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Status Banner */}
      <div className="bg-walnut text-cream px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-4">
          {order.status === 'in_transit' && <span className="w-2.5 h-2.5 rounded-full bg-cream animate-pulse-soft" />}
          <span className={`text-sm font-medium ${order.status === 'in_transit' ? '' : 'opacity-80'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            当前状态
          </span>
        </div>
        <h1 className={`text-2xl font-serif font-semibold ${statusInfo.color.replace('text-', 'text-cream-')}`}>
          {statusInfo.label}
        </h1>
        <p className="text-cream/70 text-sm mt-1">{furniture?.name}</p>

        {/* Progress Steps */}
        <div className="flex items-center gap-1 mt-5">
          {FLOW.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                i <= stepIndex ? 'bg-cream' : 'bg-cream/30'
              } ${i === stepIndex && order.status === 'in_transit' ? 'animate-pulse-soft' : ''}`} />
              {i < FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-cream' : 'bg-cream/30'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-cream/50">待确认</span>
          <span className="text-[10px] text-cream/50">已完成</span>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* Real-time Map */}
        <div className="bg-cream-dark rounded-2xl p-4 shadow-card relative overflow-hidden">
          <div className="flex items-end justify-between h-32 relative">
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-10 h-10 rounded-full bg-walnut/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-walnut" />
              </div>
              <span className="text-xs text-charcoal-light">当前位置</span>
            </div>
            <div className="absolute left-14 right-14 bottom-5 border-t-2 border-dashed border-walnut/20" />
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-sage" />
              </div>
              <span className="text-xs text-charcoal-light">您家</span>
            </div>
          </div>
          <div className="mt-3 bg-white/80 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-card">
            {order.status === 'completed' ? (
              <>
                <CheckCircle className="w-5 h-5 text-sage shrink-0" />
                <span className="text-sm font-medium text-sage">已送达</span>
              </>
            ) : (
              <>
                <Timer className="w-5 h-5 text-walnut shrink-0" />
                <span className="text-sm font-medium text-charcoal">预计 30 分钟到达</span>
              </>
            )}
          </div>
        </div>

        {/* Installer Card */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <img
              src={order.installer.avatar}
              alt={order.installer.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-walnut/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-charcoal">{order.installer.name}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-walnut fill-walnut" />
                  <span className="text-sm text-walnut font-medium">{order.installer.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-charcoal-light mt-0.5">
                <span>{order.installer.yearsExperience}年经验</span>
                <span>·</span>
                <span>{order.installer.completedJobs}单完成</span>
              </div>
            </div>
            <a
              href="tel:4001234567"
              className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center"
            >
              <Phone className="w-4 h-4 text-sage" />
            </a>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {order.installer.specialties.map((s) => (
              <span key={s} className="shrink-0 px-2.5 py-1 rounded-full bg-walnut-50 text-walnut text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Damage Photo Section */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-charcoal">安装记录</h3>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1 text-walnut text-sm font-medium"
            >
              <Camera className="w-4 h-4" />
              拍照上传
            </button>
          </div>

          {reports.length > 0 && (
            <div className="space-y-2.5">
              {reports.map((r) => {
                const resp = RESPONSIBILITY_LABEL[r.responsibility]
                return (
                  <div key={r.id} className="flex gap-3 p-2.5 rounded-xl bg-cream-dark/60">
                    <div className="w-14 h-14 rounded-lg bg-cream-dark flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-charcoal-light/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal truncate">{r.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${resp.cls}`}>
                          {resp.text}
                        </span>
                        <span className="text-[10px] text-charcoal-light">
                          {new Date(r.reportedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {reports.length === 0 && (
            <p className="text-sm text-charcoal-light/60 text-center py-4">暂无安装记录</p>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      {showUpload && (
        <div className="fixed inset-0 bg-charcoal/40 z-50 flex items-end animate-fade-in" onClick={() => setShowUpload(false)}>
          <div
            className="bg-white w-full rounded-t-2xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-cream-dark mx-auto mb-4" />
            <h4 className="font-serif font-semibold text-charcoal mb-3">拍照上传</h4>
            <div className="w-full h-28 rounded-xl border-2 border-dashed border-walnut/20 flex flex-col items-center justify-center text-walnut/60">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-sm">点击拍摄磕碰照片</span>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-walnut text-cream font-medium text-sm"
            >
              确认上传
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-sm px-5 py-4 border-t border-cream-dark">
        <Link
          to={`/archive/${furniture?.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-walnut text-cream font-medium shadow-warm"
        >
          查看家具档案
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
