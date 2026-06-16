import { Link } from 'react-router-dom'
import { TreePine, Clock, Briefcase, Palette, ArrowRight, Star, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'
import type { CategoryType } from '@/types'
import { CATEGORY_LABELS } from '@/types'

const categoryIcons: Record<CategoryType, typeof TreePine> = {
  original_wood: TreePine,
  mid_century: Clock,
  office: Briefcase,
  designer: Palette,
}

const riskMap: Record<string, { label: string; cls: string }> = {
  low: { label: '低', cls: 'bg-sage-50 text-risk-low' },
  medium: { label: '中', cls: 'bg-walnut-50 text-risk-medium' },
  high: { label: '高', cls: 'bg-rose-50 text-risk-high' },
}

const categories: (CategoryType | 'all')[] = [
  'all',
  ...(Object.keys(CATEGORY_LABELS) as CategoryType[]),
]

export default function Home() {
  const { furnitureList, selectedCategory, setSelectedCategory } = useStore()

  const filtered =
    selectedCategory === 'all'
      ? furnitureList
      : furnitureList.filter((f) => f.category === selectedCategory)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative h-[420px] overflow-hidden bg-gradient-to-br from-walnut-dark via-walnut to-walnut-light">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="animate-fade-in-up opacity-0 stagger-1 font-serif text-5xl font-bold tracking-wide text-cream">
            居雅送装
          </h1>
          <p className="animate-fade-in-up opacity-0 stagger-2 mt-4 font-serif text-2xl text-cream/90">
            让好家具，如约到家
          </p>
          <Link
            to="#featured"
            className="animate-fade-in-up opacity-0 stagger-3 mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-8 py-3 font-medium text-walnut shadow-warm transition hover:bg-cream-dark"
          >
            立即选购 <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {categories.map((cat, i) => {
            const isAll = cat === 'all'
            const isActive = selectedCategory === cat
            const Icon = isAll ? Star : categoryIcons[cat]
            const label = isAll ? '全部' : CATEGORY_LABELS[cat]
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`animate-fade-in-up opacity-0 stagger-${i + 1} flex flex-col items-center gap-2 rounded-2xl py-5 transition ${
                  isActive
                    ? 'bg-walnut text-cream shadow-warm'
                    : 'bg-white text-charcoal hover:bg-cream-dark'
                }`}
              >
                <Icon size={28} strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Featured */}
      <section id="featured" className="container mx-auto px-6 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">精选推荐</h2>
          <Link
            to="#"
            className="flex items-center text-sm text-walnut transition hover:text-walnut-dark"
          >
            查看更多 <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((furniture, i) => {
            const risk = riskMap[furniture.riskLevel]
            return (
              <Link
                key={furniture.id}
                to={`/product/${furniture.id}`}
                className={`animate-fade-in-up opacity-0 stagger-${(i % 6) + 1} group overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-card-hover`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={furniture.images[0]}
                    alt={furniture.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    {furniture.name}
                  </h3>
                  <p className="mt-1 text-sm text-charcoal-light">{furniture.material}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cream-dark px-3 py-0.5 text-xs text-charcoal">
                      {furniture.condition}
                    </span>
                    <span className={`rounded-full px-3 py-0.5 text-xs ${risk.cls}`}>
                      风险{risk.label}
                    </span>
                  </div>
                  <p className="mt-4 font-serif text-xl font-bold text-walnut">
                    ¥{furniture.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-charcoal-light">暂无该分类下的商品</div>
        )}
      </section>
    </div>
  )
}
