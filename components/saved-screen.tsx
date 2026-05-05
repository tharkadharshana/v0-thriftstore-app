'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'

export function SavedScreen() {
  const { navigate, openAuthModal } = useAppStore()
  const { user } = useAuth()
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [savedItems, setSavedItems] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    
    const { data } = await supabase
      .from('saved_listings')
      .select(`
        *,
        listing:listings(
          *,
          seller:profiles!user_id(*),
          category:categories(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    const listings = data?.map(s => ({ ...s.listing, is_saved: true })) as Listing[] || []
    setSavedItems(listings)
    setIsLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
          <h1 className="text-xl font-bold">{t('saved')}</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Sign in to see saved items</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
            Save your favorite listings and access them anytime
          </p>
          <Button
            onClick={() => openAuthModal('signin')}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : savedItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {savedItems.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onUpdate={fetchSaved} />
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
