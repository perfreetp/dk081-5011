import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, ClipboardCheck, MapPin, Archive, ArrowLeft } from 'lucide-react'
import { useStore } from '@/store'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { getLatestOrder } = useStore()
  const latest = getLatestOrder()

  const navItems = [
    { path: '/', label: '精选', icon: Home, matchPrefix: false },
    { path: latest ? `/booking/${latest.furnitureId}` : '/', label: '预约', icon: Calendar, matchPrefix: '/booking' },
    { path: latest ? `/prepare/${latest.id}` : '/', label: '准备', icon: ClipboardCheck, matchPrefix: '/prepare' },
    { path: latest ? `/tracking/${latest.id}` : '/', label: '追踪', icon: MapPin, matchPrefix: '/tracking' },
    { path: latest ? `/archive/${latest.furnitureId}` : '/', label: '档案', icon: Archive, matchPrefix: '/archive' },
  ]

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-walnut-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-cream-dark transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-walnut flex items-center justify-center">
                <span className="text-white font-serif text-sm font-bold">居</span>
              </div>
              <span className="font-serif text-lg text-charcoal font-semibold hidden sm:block">
                居雅送装
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-walnut-50 flex items-center justify-center">
              <span className="text-walnut text-xs font-medium">用户</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-cream-dark lg:hidden">
        <div className="max-w-[1200px] mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.matchPrefix === false
              ? location.pathname === '/'
              : typeof item.matchPrefix === 'string'
                ? location.pathname.startsWith(item.matchPrefix)
                : false
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-walnut'
                    : 'text-charcoal-300 hover:text-charcoal-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
