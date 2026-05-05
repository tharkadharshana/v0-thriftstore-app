'use client'

import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Dumbbell,
  BookOpen,
  Gamepad2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { categories, mockListings } from '@/lib/mock-data'
import { useLanguage } from '@/components/providers/language-provider'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Dumbbell,
  BookOpen,
  Gamepad2,
}

const categoryColors: Record<string, string> = {
  electronics: 'from-blue-500/20 to-blue-600/20 text-blue-400',
  vehicles: 'from-red-500/20 to-red-600/20 text-red-400',
  property: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400',
  fashion: 'from-pink-500/20 to-pink-600/20 text-pink-400',
  home_living: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  sports: 'from-cyan-500/20 to-cyan-600/20 text-cyan-400',
  books: 'from-purple-500/20 to-purple-600/20 text-purple-400',
  toys: 'from-orange-500/20 to-orange-600/20 text-orange-400',
}

export function CategoriesScreen() {
  const { navigate, setActiveCategory } = useAppStore()
  const { t } = useLanguage()

  const getCategoryCount = (categoryId: string) => {
    return mockListings.filter((l) => l.category === categoryId).length
  }

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    navigate('home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
        <h1 className="text-xl font-bold">{t('categories')}</h1>
      </header>

      <div className="flex-1 px-4 py-4 space-y-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon]
          const count = getCategoryCount(cat.id)
          const colorClass = categoryColors[cat.id] || 'from-gray-500/20 to-gray-600/20 text-gray-400'
          
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl transition-all',
                'bg-card hover:bg-secondary active:scale-[0.98]'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br',
                  colorClass
                )}
              >
                {Icon && <Icon className="w-7 h-7" />}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? 'listing' : 'listings'}
                </p>
              </div>
              
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
