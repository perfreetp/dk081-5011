import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store'
import { MapPin, Phone, Star, Clock, Truck, Camera, CheckCircle, AlertTriangle, ChevronRight, Navigation, Timer, User, Check, X, PackageOpen } from 'lucide-react'

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

const RESPONSIBILITY_OPTIONS = [
  { key: 'transit' as const, ...RESPONSIBILITY_LABEL['transit'], desc: '搬运途中磕碰导致' },
  { key: 'pre_existing' as const, ...RESPONSIBILITY_LABEL['pre_existing'], desc: '送装前就存在的瑕疵' },
  { key: 'installer' as const, ...RESPONSIBILITY_LABEL['installer'], desc: '安装过程操作导致' },
]

export default function Tracking() {
  const { id } = useParams<{ id: string }>()
  const { getOrderById, getFurnitureById, damageReports, addDamageReport, updateOrder } = useStore()
  const [showUpload, setShowUpload] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [newResponsibility, setNewResponsibility] = useState<'transit' | 'pre_existing' | 'installer' | null>(null)

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

  const [progressPct, setProgressPct] = useState(() => {
    if (order.status === 'completed') return 100
    if (order.status === 'installing' || order.status === 'arriving') return 92
    if (order.status === 'in_transit') return 45
    if (order.status === 'preparing') return 5
    return 0
  })
  const [currentLocation, setCurrentLocation] = useState('')
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState('刚刚更新')

  useEffect(() => {
    const statusToLocation: Record<string, string> = {
      pending: '等待仓库确认发货地址',
      preparing: '浦东新区仓库（完成打包）',
      in_transit: '南北高架 · 中环方向',
      arriving: '已进入您所在小区 · 正在寻找车位',
      installing: '已到达您的家门口',
      completed: '已送达您家中',
    }
    const statusToEta: Record<string, number | null> = {
      pending: null,
      preparing: 90,
      in_transit: 45,
      arriving: 8,
      installing: null,
      completed: null,
    }
    setCurrentLocation(statusToLocation[order.status] || '')
    setEtaMinutes(statusToEta[order.status] ?? null)
  }, [order.status])

  useEffect(() => {
    if (order.status !== 'in_transit' && order.status !== 'preparing' && order.status !== 'arriving') return
    const timer = setInterval(() => {
      setProgressPct((prev) => {
        const target = order.status === 'arriving' ? 95 : order.status === 'in_transit' ? 85 : 30
        if (prev >= target) return prev
        return Math.min(prev + Math.random() * 4, target)
      })
      setEtaMinutes((prev) => {
        if (prev == null) return prev
        return Math.max(prev - Math.floor(Math.random() * 3), 1)
      })
      const locationSeq = [
        '南北高架 · 中环方向',
        '下匝道 · 金沙江路',
        '金沙江路 · 中山北路路口',
        '中山北路 · 武宁路方向',
        '距离您家 1.8 公里',
        '距离您家 1.2 公里',
        '距离您家 600 米',
      ]
      setCurrentLocation((prev) => {
        const idx = locationSeq.indexOf(prev)
        if (idx < 0 || idx >= locationSeq.length - 1) return locationSeq[Math.floor(Math.random() * locationSeq.length)]
        return Math.random() > 0.5 ? locationSeq[idx + 1] : locationSeq[idx]
      })
      const now = new Date()
      setLastUpdate(`${now.getSeconds()}秒前更新`)
    }, 3500)
    return () => clearInterval(timer)
  }, [order.status])

  const formatEta = (mins: number | null) => {
    if (mins == null) return ''
    if (mins >= 60) return `约 ${Math.floor(mins / 60)} 小时 ${mins % 60} 分钟到达`
    return `预计 ${mins} 分钟到达`
  }

  const handleSubmitDamage = () => {
    if (!newDescription.trim() || !newResponsibility) return
    const report = {
      id: `dmg-${Date.now()}`,
      orderId: order.id,
      photoUrl: '',
      description: newDescription.trim(),
      reportedAt: new Date().toISOString(),
      responsibility: newResponsibility,
    }
    addDamageReport(report)
    setNewDescription('')
    setNewResponsibility(null)
    setShowUpload(false)
  }

  const handleConfirmDelivered = () => {
    updateOrder(order.id, { status: 'installing', deliveredAt: new Date().toISOString() })
  }

  const handleConfirmInstalled = () => {
    updateOrder(order.id, { status: 'completed', completedAt: new Date().toISOString() })
  }

  const isCompleted = order.status === 'completed'

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="bg-walnut text-cream px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-4">
          {(order.status === 'in_transit' || order.status === 'arriving') && <span className="w-2.5 h-2.5 rounded-full bg-cream animate-pulse-soft" />}
          <span className="text-sm font-medium opacity-80">
            <Clock className="w-4 h-4 inline mr-1" />
            当前状态
          </span>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-cream">
          {statusInfo.label}
        </h1>
        <p className="text-cream/70 text-sm mt-1">{furniture?.name}</p>
        {isCompleted && order.completedAt && (
          <p className="text-cream/50 text-xs mt-1">
            完成时间：{new Date(order.completedAt).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <div className="flex items-center gap-1 mt-5">
          {FLOW.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                i <= stepIndex ? 'bg-cream' : 'bg-cream/30'
              } ${i === stepIndex && (order.status === 'in_transit' || order.status === 'arriving') ? 'animate-pulse-soft' : ''}`} />
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
        <div className="bg-cream-dark rounded-2xl p-4 shadow-card relative overflow-hidden">
          <div className="h-40 relative">
            <div
              className="absolute bottom-5 z-10 flex flex-col items-center gap-1 transition-all duration-700 ease-out"
              style={{ left: `${isCompleted ? 88 : Math.max(8, progressPct - 5)}%` }}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-warm ${
                isCompleted ? 'bg-sage text-white' : 'bg-walnut text-white'
              } ${(order.status === 'in_transit' || order.status === 'arriving') ? 'animate-pulse-soft' : ''}`}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
              </div>
              <div className="bg-white rounded-full shadow-card px-2 py-0.5">
                <span className="text-[10px] text-charcoal whitespace-nowrap">{isCompleted ? '已送达' : '车位置'}</span>
              </div>
            </div>

            <svg className="absolute left-0 right-0 bottom-10 h-8 w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M 5 15 Q 30 5 55 12 T 95 8" stroke="#8B6914" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.4" />
              <path
                d={`M 5 15 Q 30 5 55 12 T 95 8`}
                stroke={isCompleted ? '#7C9A6E' : '#8B6914'}
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${progressPct * 1.4} 200`}
                className="transition-all duration-700"
              />
            </svg>

            <div className="absolute bottom-5 right-[8%] z-10 flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-sage text-white flex items-center justify-center shadow-card">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="bg-white rounded-full shadow-card px-2 py-0.5">
                <span className="text-[10px] text-charcoal whitespace-nowrap">您家</span>
              </div>
            </div>

            <div className="absolute top-0 left-0 right-0 flex justify-between items-center text-[10px] text-charcoal-light/80">
              <span>{isCompleted ? '已送达' : `距您 ${progressPct < 50 ? '约 5 公里' : progressPct < 85 ? '约 1.5 公里' : '约 300 米'}`}</span>
              <span>{lastUpdate}</span>
            </div>
          </div>
          <div className="mt-3 bg-white/80 rounded-xl px-3 py-2.5 flex items-start gap-2 shadow-card">
            {isCompleted ? (
              <>
                <CheckCircle className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sage">已送达并完成安装</p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">{currentLocation}</p>
                </div>
              </>
            ) : order.status === 'installing' ? (
              <>
                <User className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sage">师傅正在安装</p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">{currentLocation}</p>
                </div>
              </>
            ) : order.status === 'pending' ? (
              <>
                <Clock className="w-5 h-5 text-risk-medium shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-charcoal">待仓库确认发货</p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">{currentLocation}</p>
                </div>
              </>
            ) : (
              <>
                <Timer className="w-5 h-5 text-walnut shrink-0 mt-0.5 animate-pulse-soft" />
                <div>
                  <p className="text-sm font-medium text-charcoal">{formatEta(etaMinutes)}</p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">
                    {currentLocation} · 进度 {progressPct.toFixed(0)}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

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
            <a href="tel:4001234567" className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-sage" />
            </a>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {order.installer.specialties.map((s) => (
              <span key={s} className="shrink-0 px-2.5 py-1 rounded-full bg-walnut-50 text-walnut text-xs font-medium">{s}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-charcoal">安装记录</h3>
            {!isCompleted && (
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-1 text-walnut text-sm font-medium">
                <Camera className="w-4 h-4" />
                拍照上传
              </button>
            )}
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

      {showUpload && (
        <div className="fixed inset-0 bg-charcoal/40 z-50 flex items-end animate-fade-in" onClick={() => setShowUpload(false)}>
          <div className="bg-white w-full rounded-t-2xl p-5 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif font-semibold text-charcoal text-lg">磕碰记录登记</h4>
              <button onClick={() => setShowUpload(false)} className="p-1 -mr-1 text-charcoal-light"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-charcoal mb-2">现场照片</p>
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-walnut/30 flex flex-col items-center justify-center text-walnut/60 bg-walnut-50/30">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-sm">已添加照片模拟（点击拍照）</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal mb-2">磕碰描述 <span className="text-risk-high">*</span></p>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="请描述具体位置、大小等" className="w-full h-20 resize-none rounded-xl border border-cream-dark bg-cream-50 px-3 py-2.5 text-sm outline-none focus:border-walnut placeholder:text-charcoal-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal mb-2">责任归属 <span className="text-risk-high">*</span></p>
                <div className="space-y-2">
                  {RESPONSIBILITY_OPTIONS.map((opt) => {
                    const sel = newResponsibility === opt.key
                    return (
                      <button key={opt.key} onClick={() => setNewResponsibility(opt.key)} className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${sel ? 'border-walnut bg-walnut-50' : 'border-cream-dark hover:bg-cream-50'}`}>
                        <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-all ${sel ? 'bg-walnut' : 'border-2 border-charcoal-200'}`}>
                          {sel && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-charcoal">{opt.text}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${opt.cls}`}>
                              {opt.key === 'transit' ? '平台赔付' : opt.key === 'installer' ? '师傅赔付' : '非责任'}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-light mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUpload(false)} className="flex-1 py-3 rounded-xl border-2 border-cream-dark text-charcoal font-medium text-sm">取消</button>
                <button onClick={handleSubmitDamage} disabled={!newDescription.trim() || !newResponsibility} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${newDescription.trim() && newResponsibility ? 'bg-walnut text-cream shadow-warm' : 'bg-cream-200 text-charcoal-300 cursor-not-allowed'}`}>确认登记</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-sm px-5 py-4 border-t border-cream-dark">
        {isCompleted ? (
          <Link to={`/archive/${furniture?.id}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-walnut text-cream font-medium shadow-warm">
            查看家具档案
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : order.status === 'installing' ? (
          <button onClick={handleConfirmInstalled} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-sage text-white font-medium shadow-warm">
            <CheckCircle className="w-4 h-4" />
            确认安装完成
          </button>
        ) : order.status === 'arriving' ? (
          <button onClick={handleConfirmDelivered} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-walnut text-cream font-medium shadow-warm">
            <PackageOpen className="w-4 h-4" />
            确认已送达
          </button>
        ) : (
          <Link to={`/archive/${furniture?.id}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-walnut/80 text-cream font-medium">
            查看家具档案
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
