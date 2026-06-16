import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store'
import { Calendar, Clock, Check, ChevronLeft, ChevronRight, Shield, HandMetal, Truck, Package, Eye } from 'lucide-react'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const UNAVAILABLE_SLOTS = new Set(['1-morning', '3-afternoon', '5-morning', '6-afternoon'])

function generateDays(count: number) {
  const days = []
  for (let i = 1; i <= count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      key: i,
      date: d,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: WEEKDAYS[d.getDay()],
    })
  }
  return days
}

export default function Booking() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getFurnitureById, createOrder } = useStore()
  const furniture = getFurnitureById(id!)

  const paramService = searchParams.get('service') as 'deliver_then_install' | 'inspect_then_install' | null
  const initialService =
    paramService === 'deliver_then_install' || paramService === 'inspect_then_install'
      ? paramService
      : 'deliver_then_install'

  const [selectedDate, setSelectedDate] = useState(1)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | null>(null)
  const [serviceType, setServiceType] = useState<'deliver_then_install' | 'inspect_then_install'>(initialService)
  const [whiteGlove, setWhiteGlove] = useState(false)
  const [takeOld, setTakeOld] = useState(false)

  const days = useMemo(() => generateDays(7), [])

  const baseFee = serviceType === 'deliver_then_install' ? 280 : 380
  const totalFee = baseFee + (whiteGlove ? 150 : 0) + (takeOld ? 200 : 0)

  const isSlotUnavailable = (dayKey: number, slot: 'morning' | 'afternoon') =>
    UNAVAILABLE_SLOTS.has(`${dayKey}-${slot}`)

  const canConfirm = selectedTimeSlot !== null && furniture

  const handleConfirm = () => {
    if (!canConfirm || !furniture) return
    const selectedDay = days.find((d) => d.key === selectedDate)!
    const dateStr = selectedDay.date.toISOString().split('T')[0]
    const orderId = `order-${Date.now()}`
    const order = {
      id: orderId,
      furnitureId: furniture.id,
      serviceType,
      dateSlot: dateStr,
      timeSlot: selectedTimeSlot!,
      addOns: { whiteGlove, takeOld },
      status: 'pending' as const,
      installer: { id: 'inst-1', name: '陈师傅', avatar: '', rating: 4.9, yearsExperience: 12, specialties: ['原木', '实木拆装'], completedJobs: 1860 },
      totalFee,
      elevatorChecked: false,
      corridorChecked: false,
      preparationDone: false,
    }
    createOrder(order)
    navigate(`/prepare/${orderId}`)
  }

  if (!furniture) {
    return <div className="flex items-center justify-center min-h-screen text-charcoal-400">未找到该家具信息</div>
  }

  return (
    <div className="min-h-screen bg-cream pb-32">
      <header className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-cream-300">
        <button onClick={() => navigate(-1)} className="p-1 text-charcoal-light"><ChevronLeft size={22} /></button>
        <h1 className="font-serif text-lg font-semibold text-charcoal">预约送装</h1>
        <Shield size={18} className="text-walnut ml-auto" />
      </header>

      <div className="px-4 pt-4 space-y-5">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs text-charcoal-300 mb-1">{furniture.condition}</p>
          <h2 className="font-serif text-base font-semibold text-charcoal">{furniture.name}</h2>
        </div>

        <section>
          <h3 className="font-serif text-base font-semibold text-charcoal mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-walnut" />选择时段
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {days.map((day) => (
              <button
                key={day.key}
                onClick={() => { setSelectedDate(day.key); setSelectedTimeSlot(null) }}
                className={`flex-shrink-0 w-14 py-2 rounded-xl text-center transition-all ${
                  selectedDate === day.key
                    ? 'bg-walnut text-white shadow-warm'
                    : 'bg-white text-charcoal shadow-card'
                }`}
              >
                <p className="text-[10px]">{day.weekday}</p>
                <p className="text-sm font-semibold mt-0.5">{day.label}</p>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {(['morning', 'afternoon'] as const).map((slot) => {
              const unavailable = isSlotUnavailable(selectedDate, slot)
              const selected = selectedTimeSlot === slot
              return (
                <button
                  key={slot}
                  disabled={unavailable}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    unavailable
                      ? 'bg-cream-200 border-cream-300 opacity-50 cursor-not-allowed'
                      : selected
                        ? 'bg-walnut border-walnut text-white'
                        : 'bg-walnut-50 border-walnut hover:bg-walnut-100'
                  }`}
                >
                  <Clock size={18} className={unavailable ? 'text-charcoal-200' : selected ? 'text-white' : 'text-walnut'} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${unavailable ? 'text-charcoal-300' : ''}`}>
                      {slot === 'morning' ? '上午' : '下午'}
                    </p>
                    <p className={`text-[11px] ${unavailable ? 'text-charcoal-200' : selected ? 'text-walnut-100' : 'text-charcoal-300'}`}>
                      {unavailable ? '已满' : slot === 'morning' ? '8:00-12:00' : '13:00-18:00'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className="font-serif text-base font-semibold text-charcoal mb-3 flex items-center gap-2">
            <Truck size={18} className="text-walnut" />服务方式
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'deliver_then_install' as const, icon: Truck, title: '先送后装', desc: '家具先送达您家，次日安排专业师傅上门安装', price: 280 },
              { key: 'inspect_then_install' as const, icon: Eye, title: '到货验品再装', desc: '家具送达后您先验品确认，满意后再由师傅当场安装', price: 380 },
            ]).map((svc) => (
              <button
                key={svc.key}
                onClick={() => setServiceType(svc.key)}
                className={`relative p-4 rounded-2xl bg-white shadow-card text-left transition-all ${
                  serviceType === svc.key ? 'border-2 border-walnut-500' : 'border-2 border-transparent'
                }`}
              >
                {serviceType === svc.key && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-walnut rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </span>
                )}
                <svc.icon size={22} className={serviceType === svc.key ? 'text-walnut' : 'text-charcoal-300'} />
                <p className="font-medium text-sm mt-2 text-charcoal">{svc.title}</p>
                <p className="text-[11px] text-charcoal-300 mt-1 leading-snug">{svc.desc}</p>
                <p className="font-serif text-walnut font-semibold mt-2">¥{svc.price}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-serif text-base font-semibold text-charcoal mb-3">增值服务</h3>
          <div className="space-y-3">
            {([
              { on: whiteGlove, set: setWhiteGlove, icon: HandMetal, title: '白手套服务', desc: '师傅佩戴白手套，铺设防护地垫，安装完毕清理现场', price: '¥150/次' },
              { on: takeOld, set: setTakeOld, icon: Package, title: '旧家具带走', desc: '将替换下的旧家具搬离并妥善处理', price: '¥200/件' },
            ]).map((addon) => (
              <div key={addon.title} className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4">
                <addon.icon size={22} className={addon.on ? 'text-walnut' : 'text-charcoal-300'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{addon.title}</p>
                  <p className="text-[11px] text-charcoal-300 mt-0.5">{addon.desc}</p>
                </div>
                <span className="text-xs text-walnut font-medium mr-2">{addon.price}</span>
                <button
                  onClick={() => addon.set(!addon.on)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${addon.on ? 'bg-walnut' : 'bg-cream-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${addon.on ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-cream-300 px-4 pt-3 pb-5 shadow-warm">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-charcoal-300">基础服务费 ¥{baseFee}{(whiteGlove || takeOld) ? ' + 增值服务' : ''}</span>
          <span className="font-serif text-xl font-bold text-walnut">¥{totalFee}</span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full py-3 rounded-xl font-medium text-base transition-all ${
            canConfirm ? 'bg-walnut text-white shadow-warm active:scale-[0.98]' : 'bg-cream-300 text-charcoal-200 cursor-not-allowed'
          }`}
        >
          确认预约
        </button>
      </div>
    </div>
  )
}
