'use client'

import { useState, useEffect, useCallback } from 'react'
import { Filter, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useLanguage } from '@/components/providers/language-provider'
import { CurvedHeader } from '@/components/curved-header'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import type { Listing, Category } from '@/lib/types'

type SortOption = 'newest' | 'price_low' | 'price_high' | 'ending_soon'
type ListingTypeFilter = 'all' | 'buy_now' | 'auction'

export function HomeFeed() {
  const { activeCategory, setActiveCategory } = useAppStore()
  const { t } = useLanguage()
  const supabase = createClient()

  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [listingType, setListingType] = useState<ListingTypeFilter>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  const fetchListings = useCallback(async () => {
    setIsLoading(true)

    let query = supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!user_id(*),
        category:categories(*)
      `)
      .eq('is_active', true)
      .eq('is_sold', false)

    if (activeCategory) {
      query = query.eq('category_id', activeCategory)
    }

    if (listingType === 'buy_now') {
      query = query.eq('is_auction', false)
    } else if (listingType === 'auction') {
      query = query.eq('is_auction', true)
    }

    if (selectedConditions.length > 0) {
      query = query.in('condition', selectedConditions)
    }

    query = query.gte('price', priceRange[0]).lte('price', priceRange[1])
    query = query.order('is_boosted', { ascending: false })

    if (sortBy === 'price_low') {
      query = query.order('price', { ascending: true })
    } else if (sortBy === 'price_high') {
      query = query.order('price', { ascending: false })
    } else if (sortBy === 'ending_soon') {
      query = query.order('auction_end_time', { ascending: true, nullsFirst: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.limit(50)

    const { data } = await query

    const { data: { user } } = await supabase.auth.getUser()
    if (user && data) {
      const { data: saved } = await supabase
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', user.id)

      const savedIds = new Set(saved?.map(s => s.listing_id) || [])
      setListings(data.map(l => ({ ...l, is_saved: savedIds.has(l.id) })) as Listing[])
    } else {
      setListings((data || []) as Listing[])
    }

    setIsLoading(false)
  }, [supabase, activeCategory, listingType, selectedConditions, priceRange, sortBy])

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories((data || []) as Category[])
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const conditionOptions = [
    { value: 'new', label: t('condition_new') },
    { value: 'like_new', label: t('condition_like_new') },
    { value: 'good', label: t('condition_good') },
    { value: 'fair', label: t('condition_fair') },
  ]

  const featuredListings = listings.filter(l => l.boost_level === 'ultra')
  const regularListings = listings.filter(l => l.boost_level !== 'ultra')

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 md:pb-8">
      <CurvedHeader />

      {/* Category Pills */}
      <div className="px-4 py-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            <Button
              variant={activeCategory === null ? 'default' : 'secondary'}
              size="sm"
              className={cn(
                'rounded-full text-xs',
                activeCategory === null && 'bg-accent text-accent-foreground'
              )}
              onClick={() => setActiveCategory(null)}
            >
              {t('all')}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'secondary'}
                size="sm"
                className={cn(
                  'rounded-full text-xs',
                  activeCategory === cat.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            {(['all', 'buy_now', 'auction'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setListingType(type)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-all',
                  listingType === type
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                )}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <Filter className="w-3.5 h-3.5" />
              {t('filter')}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>{t('filter')}</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t('sort')}</h4>
                <div className="flex flex-wrap gap-2">
                  {(['newest', 'price_low', 'price_high', 'ending_soon'] as const).map((opt) => (
                    <Badge
                      key={opt}
                      variant={sortBy === opt ? 'default' : 'secondary'}
                      className={cn(
                        'cursor-pointer',
                        sortBy === opt && 'bg-accent text-accent-foreground'
                      )}
                      onClick={() => setSortBy(opt)}
                    >
                      {t(opt)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t('price')}</h4>
                <Slider
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  min={0}
                  max={50000000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rs. {(priceRange[0] / 1000000).toFixed(1)}M</span>
                  <span>Rs. {(priceRange[1] / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Condition</h4>
                <div className="grid grid-cols-2 gap-3">
                  {conditionOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedConditions.includes(opt.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedConditions([...selectedConditions, opt.value])
                          } else {
                            setSelectedConditions(selectedConditions.filter((c) => c !== opt.value))
                          }
                        }}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => fetchListings()}
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Featured Section */}
          {featuredListings.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Featured Listings</h2>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {featuredListings.map((listing) => (
                    <div key={listing.id} className="w-[200px] md:w-[240px] flex-shrink-0">
                      <ListingCard listing={listing} onUpdate={fetchListings} />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* Listings Grid — 2 cols mobile, 3 cols desktop */}
          <div className="flex-1 px-4 py-3">
            {regularListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {regularListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onUpdate={fetchListings} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground">No listings found</p>
                <Button
                  variant="link"
                  className="text-accent"
                  onClick={() => {
                    setActiveCategory(null)
                    setSelectedConditions([])
                    setPriceRange([0, 50000000])
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
