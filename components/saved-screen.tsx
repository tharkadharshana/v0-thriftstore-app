'use client'

import { useMemo } from 'react'
import { Heart } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { mockListings } from '@/lib/mock-data'
import { useLanguage } from '@/components/providers/language-provider'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'

export function SavedScreen() {
  const { savedListings, navigate } = useAppStore()
  const { t } = useLanguage()

  const savedItems = useMemo(
    () => mockListings.filter((l) => savedListings.includes(l.id)),
    [savedListings]
  )

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('saved')}</h1>
          {savedItems.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {savedItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {savedItems.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No saved items yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
              Items you save will appear here. Start browsing to find something you love!
            </p>
            <Button
              onClick={() => navigate('home')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Browse Listings
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
