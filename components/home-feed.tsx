'use client'

import { useState, useMemo } from 'react'
import { Filter, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { mockListings, categories } from '@/lib/mock-data'
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

type SortOption = 'newest' | 'price_low' | 'price_high' | 'ending_soon'
type ListingTypeFilter = 'all' | 'buy_now' | 'auction'

export function HomeFeed() {
  const { activeCategory, setActiveCategory, activeFilter, setActiveFilter } = useAppStore()
  const { t } = useLanguage()
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [listingType, setListingType] = useState<ListingTypeFilter>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...mockListings]

    // Category filter
    if (activeCategory) {
      filtered = filtered.filter((l) => l.category === activeCategory)
    }

    // Listing type filter
    if (listingType !== 'all') {
      filtered = filtered.filter((l) => l.listingType === listingType)
    }

    // Price filter
    filtered = filtered.filter((l) => {
      const price = l.currentBid || l.price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((l) => selectedConditions.includes(l.condition))
    }

    // Sort boosted listings first
    const boosted = filtered.filter((l) => l.isBoosted)
    const regular = filtered.filter((l) => !l.isBoosted)

    // Sort within each group
    const sortFn = (a: typeof filtered[0], b: typeof filtered[0]) => {
      switch (sortBy) {
        case 'price_low':
          return (a.currentBid || a.price) - (b.currentBid || b.price)
        case 'price_high':
          return (b.currentBid || b.price) - (a.currentBid || a.price)
        case 'ending_soon':
          if (!a.endsAt) return 1
          if (!b.endsAt) return -1
          return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    }

    boosted.sort(sortFn)
    regular.sort(sortFn)

    return [...boosted, ...regular]
  }, [activeCategory, listingType, priceRange, selectedConditions, sortBy])

  const conditionOptions = [
    { value: 'new', label: t('condition_new') },
    { value: 'like_new', label: t('condition_like_new') },
    { value: 'good', label: t('condition_good') },
    { value: 'fair', label: t('condition_fair') },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
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
          {/* Listing Type Tabs */}
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

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
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
                {/* Sort Options */}
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

                {/* Price Range */}
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

                {/* Condition */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Condition</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {conditionOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedConditions.includes(opt.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedConditions([...selectedConditions, opt.value])
                            } else {
                              setSelectedConditions(
                                selectedConditions.filter((c) => c !== opt.value)
                              )
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
                  onClick={() => {
                    // Filters applied automatically
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Featured Section */}
      {filteredListings.some((l) => l.boostLevel === 'featured') && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold">Featured Listings</h2>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {filteredListings
                .filter((l) => l.boostLevel === 'featured')
                .map((listing) => (
                  <div key={listing.id} className="w-[200px] flex-shrink-0">
                    <ListingCard listing={listing} />
                  </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Listings Grid */}
      <div className="flex-1 px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredListings
            .filter((l) => l.boostLevel !== 'featured')
            .map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
        </div>
      </div>
    </div>
  )
}
