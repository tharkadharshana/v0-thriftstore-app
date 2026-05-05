'use client'

import Image from 'next/image'
import { Heart, Clock, Eye, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'

interface ListingCardProps {
  listing: Listing
  variant?: 'default' | 'compact'
  onUpdate?: () => void
}

function formatPrice(price: number, currency = 'LKR') {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getTimeRemaining(endTime: string) {
  const end = new Date(endTime).getTime()
  const now = Date.now()
  const diff = end - now
  
  if (diff <= 0) return 'Ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function ListingCard({ listing, onUpdate }: ListingCardProps) {
  const { navigate, openAuthModal } = useAppStore()
  const { user } = useAuth()
  const supabase = createClient()
  
  const conditionColors: Record<string, string> = {
    new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    like_new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    good: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    fair: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }

  const boostStyles: Record<string, string> = {
    ultra: 'ring-2 ring-accent ring-offset-2 ring-offset-background',
    premium: 'ring-1 ring-accent/50',
    basic: '',
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!user) {
      openAuthModal('signin')
      return
    }
    
    if (listing.is_saved) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: user.id, listing_id: listing.id })
    }
    
    onUpdate?.()
  }

  const imageUrl = listing.images?.[0] || '/placeholder.jpg'
  const sellerName = listing.seller?.display_name || listing.seller?.username || 'Seller'
  const sellerAvatar = listing.seller?.avatar_url || '/default-avatar.jpg'

  return (
    <div
      onClick={() => navigate('listing', listing.id)}
      className={cn(
        'group relative bg-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1',
        listing.is_boosted && listing.boost_level && boostStyles[listing.boost_level]
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all',
            'backdrop-blur-md',
            listing.is_saved
              ? 'bg-accent text-accent-foreground'
              : 'bg-black/30 text-white hover:bg-black/50'
          )}
        >
          <Heart className={cn('w-4 h-4', listing.is_saved && 'fill-current')} />
        </button>

        {/* Boost Badge */}
        {listing.is_boosted && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className={cn(
                'gap-1 backdrop-blur-md border',
                listing.boost_level === 'ultra' 
                  ? 'bg-accent/90 text-accent-foreground border-accent' 
                  : 'bg-secondary/90 border-secondary'
              )}
            >
              {listing.boost_level === 'ultra' ? (
                <Sparkles className="w-3 h-3" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              {listing.boost_level === 'ultra' ? 'Featured' : 'Boosted'}
            </Badge>
          </div>
        )}

        {/* Auction Timer */}
        {listing.is_auction && listing.auction_end_time && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 text-white text-xs">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{getTimeRemaining(listing.auction_end_time)}</span>
              <span className="ml-auto text-muted-foreground">
                {listing.bid_count || 0} bids
              </span>
            </div>
          </div>
        )}

        {/* Condition Badge */}
        {!listing.is_boosted && listing.condition && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] backdrop-blur-md',
                conditionColors[listing.condition]
              )}
            >
              {conditionLabels[listing.condition]}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
          {listing.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-accent">
              {listing.is_auction && listing.current_bid
                ? formatPrice(listing.current_bid, listing.currency)
                : formatPrice(listing.price, listing.currency)}
            </p>
            {listing.is_auction && (
              <p className="text-[10px] text-muted-foreground">Current bid</p>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>{listing.views || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <div className="w-5 h-5 rounded-full overflow-hidden relative bg-secondary">
            {sellerAvatar && (
              <Image
                src={sellerAvatar}
                alt={sellerName}
                fill
                className="object-cover"
              />
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate flex-1">
            {sellerName}
          </span>
          {listing.location && (
            <span className="text-[10px] text-muted-foreground">
              {listing.location}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
