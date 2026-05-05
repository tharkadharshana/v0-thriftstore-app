'use client'

import Image from 'next/image'
import { Heart, Clock, Eye, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type Listing } from '@/lib/store'
import { formatPrice, getTimeRemaining } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

interface ListingCardProps {
  listing: Listing
  variant?: 'default' | 'compact'
}

export function ListingCard({ listing, variant = 'default' }: ListingCardProps) {
  const { navigate, toggleSaved, savedListings } = useAppStore()
  const isSaved = savedListings.includes(listing.id)
  
  const conditionColors = {
    new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    like_new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    good: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    fair: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const conditionLabels = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }

  const boostStyles = {
    featured: 'ring-2 ring-accent ring-offset-2 ring-offset-background',
    premium: 'ring-1 ring-accent/50',
    basic: '',
  }

  return (
    <div
      onClick={() => navigate('listing', listing.id)}
      className={cn(
        'group relative bg-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1',
        listing.isBoosted && listing.boostLevel && boostStyles[listing.boostLevel]
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleSaved(listing.id)
          }}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all',
            'backdrop-blur-md',
            isSaved
              ? 'bg-accent text-accent-foreground'
              : 'bg-black/30 text-white hover:bg-black/50'
          )}
        >
          <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
        </button>

        {/* Boost Badge */}
        {listing.isBoosted && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className={cn(
                'gap-1 backdrop-blur-md border',
                listing.boostLevel === 'featured' 
                  ? 'bg-accent/90 text-accent-foreground border-accent' 
                  : 'bg-secondary/90 border-secondary'
              )}
            >
              {listing.boostLevel === 'featured' ? (
                <Sparkles className="w-3 h-3" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              {listing.boostLevel === 'featured' ? 'Featured' : 'Boosted'}
            </Badge>
          </div>
        )}

        {/* Auction Timer */}
        {listing.listingType === 'auction' && listing.endsAt && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 text-white text-xs">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{getTimeRemaining(listing.endsAt)}</span>
              <span className="ml-auto text-muted-foreground">
                {listing.bidCount} bids
              </span>
            </div>
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          {!listing.isBoosted && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] backdrop-blur-md',
                conditionColors[listing.condition]
              )}
            >
              {conditionLabels[listing.condition]}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
          {listing.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-accent">
              {listing.listingType === 'auction' && listing.currentBid
                ? formatPrice(listing.currentBid)
                : formatPrice(listing.price)}
            </p>
            {listing.listingType === 'auction' && (
              <p className="text-[10px] text-muted-foreground">Current bid</p>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>{listing.views}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <div className="w-5 h-5 rounded-full overflow-hidden relative">
            <Image
              src={listing.sellerAvatar}
              alt={listing.sellerName}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs text-muted-foreground truncate flex-1">
            {listing.sellerName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {listing.location}
          </span>
        </div>
      </div>
    </div>
  )
}
