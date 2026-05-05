'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Dumbbell,
  BookOpen,
  Baby,
  Wrench,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useLanguage } from '@/components/providers/language-provider'
import { createClient } from '@/lib/supabase/client'
import { defaultCategories, isMissingCategoryTableError } from '@/lib/categories'
import type { Category } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  car: Car,
  home: Home,
  shirt: Shirt,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  baby: Baby,
  wrench: Wrench,
}

export function CategoriesScreen() {
  const { navigate, setActiveCategory } = useAppStore()
  const { t, language } = useLanguage()
  const supabase = createClient()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [listingCounts, setListingCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    
    try {
      const { data: cats, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      const categoryData = (cats || []) as Category[]
      setCategories(categoryData)
      
      // Get listing counts for each category
      const counts: Record<string, number> = {}
      for (const cat of categoryData) {
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .eq('is_active', true)
          .eq('is_sold', false)
        counts[cat.id] = count || 0
      }
      setListingCounts(counts)
    } catch (err) {
      if (isMissingCategoryTableError(err)) {
        setCategories(defaultCategories)
        setListingCounts({})
      } else {
        console.error('Failed to load categories', err)
      }
    }
    
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    navigate('home')
  }

  const getCategoryName = (cat: Category) => {
    if (language === 'sn' && cat.name_si) return cat.name_si
    if (language === 'tm' && cat.name_ta) return cat.name_ta
    return cat.name
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
          <h1 className="text-xl font-bold">{t('categories')}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
        <h1 className="text-xl font-bold">{t('categories')}</h1>
      </header>

      <div className="flex-1 px-4 py-4 space-y-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon || ''] || Smartphone
          const count = listingCounts[cat.id] || 0
          
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
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color || '#888' }}
              >
                <Icon className="w-7 h-7" />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">{getCategoryName(cat)}</h3>
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
