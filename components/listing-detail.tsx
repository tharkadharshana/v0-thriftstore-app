'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Clock,
  MapPin,
  Eye,
  Star,
  ChevronLeft,
  ChevronRight,
  Gavel,
  ShoppingBag,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { mockListings, formatPrice, getTimeRemaining, getTimeAgo } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ListingDetail() {
  const { selectedListingId, goBack, toggleSaved, savedListings, user } = useAppStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bidAmount, setBidAmount] = useState('')
  const [showBidDialog, setShowBidDialog] = useState(false)

  const listing = useMemo(
    () => mockListings.find((l) => l.id === selectedListingId),
    [selectedListingId]
  )

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    )
  }

  const isSaved = savedListings.includes(listing.id)
  const isAuction = listing.listingType === 'auction'
  const minBid = listing.currentBid ? listing.currentBid + 500 : listing.price

  const conditionColors = {
    new: 'bg-emerald-500/20 text-emerald-400',
    like_new: 'bg-blue-500/20 text-blue-400',
    good: 'bg-amber-500/20 text-amber-400',
    fair: 'bg-gray-500/20 text-gray-400',
  }

  const conditionLabels = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Image Carousel */}
      <div className="relative aspect-square">
        <Image
          src={listing.images[currentImageIndex]}
          alt={listing.title}
          fill
          className="object-cover"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

        {/* Top Actions */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 safe-area-top">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
            onClick={goBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-10 h-10 rounded-full backdrop-blur-md',
                isSaved
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-black/30 text-white hover:bg-black/50'
              )}
              onClick={() => toggleSaved(listing.id)}
            >
              <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
            </Button>
          </div>
        </div>

        {/* Image Navigation */}
        {listing.images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
              onClick={() =>
                setCurrentImageIndex((i) =>
                  i === 0 ? listing.images.length - 1 : i - 1
                )
              }
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
              onClick={() =>
                setCurrentImageIndex((i) =>
                  i === listing.images.length - 1 ? 0 : i + 1
                )
              }
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {listing.images.map((_, idx) => (
            <button
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentImageIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50'
              )}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>

        {/* Boost Badge */}
        {listing.isBoosted && (
          <div className="absolute top-4 left-4 safe-area-top">
            <Badge className="gap-1 bg-accent text-accent-foreground">
              <Zap className="w-3 h-3" />
              {listing.boostLevel === 'featured' ? 'Featured' : 'Boosted'}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Title & Price */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-foreground">{listing.title}</h1>
            <Badge
              variant="outline"
              className={cn('shrink-0', conditionColors[listing.condition])}
            >
              {conditionLabels[listing.condition]}
            </Badge>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-accent">
              {isAuction && listing.currentBid
                ? formatPrice(listing.currentBid)
                : formatPrice(listing.price)}
            </span>
            {isAuction && (
              <span className="text-sm text-muted-foreground">
                ({listing.bidCount} bids)
              </span>
            )}
          </div>

          {/* Auction Timer */}
          {isAuction && listing.endsAt && (
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-3">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium">{getTimeRemaining(listing.endsAt)}</p>
                <p className="text-xs text-muted-foreground">Auction ends</p>
              </div>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{listing.views} views</span>
          </div>
          <span>{getTimeAgo(listing.createdAt)}</span>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Seller Info */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={listing.sellerAvatar} alt={listing.sellerName} />
                <AvatarFallback>{listing.sellerName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{listing.sellerName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span>4.8</span>
                  <span className="mx-1">·</span>
                  <span>23 sold</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chat
          </Button>
          
          {isAuction ? (
            <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Gavel className="w-5 h-5" />
                  Place Bid
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Place Your Bid</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Current bid: {formatPrice(listing.currentBid || listing.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Minimum bid: {formatPrice(minBid)}
                    </p>
                  </div>
                  <Input
                    type="number"
                    placeholder={`Enter amount (min ${formatPrice(minBid)})`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!bidAmount || Number(bidAmount) < minBid}
                  >
                    Confirm Bid
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              size="lg"
              className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <ShoppingBag className="w-5 h-5" />
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
