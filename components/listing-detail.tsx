'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'

function formatPrice(price: number, currency = 'LKR') {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
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

function getTimeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ListingDetail() {
  const { selectedListingId, goBack, openAuthModal } = useAppStore()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bidAmount, setBidAmount] = useState('')
  const [showBidDialog, setShowBidDialog] = useState(false)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [isBidding, setIsBidding] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [bidError, setBidError] = useState('')

  const fetchListing = useCallback(async () => {
    if (!selectedListingId) return
    
    setIsLoading(true)
    
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!user_id(*),
        category:categories(*)
      `)
      .eq('id', selectedListingId)
      .single()
    
    if (data) {
      // Increment views
      await supabase
        .from('listings')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', selectedListingId)
      
      // Check if saved
      if (user) {
        const { data: saved } = await supabase
          .from('saved_listings')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', selectedListingId)
          .single()
        
        setListing({ ...data, is_saved: !!saved } as Listing)
      } else {
        setListing(data as Listing)
      }
    }
    
    setIsLoading(false)
  }, [selectedListingId, supabase, user])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  const handleSave = async () => {
    if (!user) {
      openAuthModal('signin')
      return
    }
    
    if (!listing) return
    
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
    
    setListing({ ...listing, is_saved: !listing.is_saved })
  }

  const handleBid = async () => {
    if (!user) {
      openAuthModal('signin')
      return
    }
    
    if (!listing) return
    
    const amount = Number(bidAmount)
    const minBid = listing.current_bid ? listing.current_bid + 500 : listing.price
    
    if (amount < minBid) {
      setBidError(`Minimum bid is ${formatPrice(minBid)}`)
      return
    }
    
    setIsBidding(true)
    setBidError('')
    
    // Insert bid
    const { error: bidError } = await supabase
      .from('bids')
      .insert({
        listing_id: listing.id,
        user_id: user.id,
        amount,
      })
    
    if (bidError) {
      setBidError(bidError.message)
      setIsBidding(false)
      return
    }
    
    // Update listing
    await supabase
      .from('listings')
      .update({
        current_bid: amount,
        bid_count: (listing.bid_count || 0) + 1,
      })
      .eq('id', listing.id)
    
    // Notify seller
    await supabase
      .from('notifications')
      .insert({
        user_id: listing.user_id,
        type: 'bid',
        title: 'New bid received',
        body: `Someone placed a bid of ${formatPrice(amount)}`,
        listing_id: listing.id,
      })
    
    setIsBidding(false)
    setShowBidDialog(false)
    setBidAmount('')
    fetchListing()
  }

  const handleSendMessage = async () => {
    if (!user) {
      openAuthModal('signin')
      return
    }
    
    if (!listing || !chatMessage.trim()) return
    
    setIsSending(true)
    
    await supabase
      .from('messages')
      .insert({
        listing_id: listing.id,
        sender_id: user.id,
        receiver_id: listing.user_id,
        content: chatMessage,
      })
    
    // Notify seller
    await supabase
      .from('notifications')
      .insert({
        user_id: listing.user_id,
        type: 'message',
        title: 'New message',
        body: chatMessage.substring(0, 100),
        listing_id: listing.id,
      })
    
    setIsSending(false)
    setShowChatDialog(false)
    setChatMessage('')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: listing?.title,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Listing not found</p>
        <Button onClick={goBack}>Go Back</Button>
      </div>
    )
  }

  const isAuction = listing.is_auction
  const minBid = listing.current_bid ? listing.current_bid + 500 : listing.price
  const isOwner = user?.id === listing.user_id

  const conditionColors: Record<string, string> = {
    new: 'bg-emerald-500/20 text-emerald-400',
    like_new: 'bg-blue-500/20 text-blue-400',
    good: 'bg-amber-500/20 text-amber-400',
    fair: 'bg-gray-500/20 text-gray-400',
  }

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }

  const images = listing.images?.length ? listing.images : ['/placeholder.jpg']

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Image Carousel */}
      <div className="relative aspect-square bg-secondary">
        <Image
          src={images[currentImageIndex]}
          alt={listing.title}
          fill
          className="object-cover"
        />
        
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
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-10 h-10 rounded-full backdrop-blur-md',
                listing.is_saved
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-black/30 text-white hover:bg-black/50'
              )}
              onClick={handleSave}
            >
              <Heart className={cn('w-5 h-5', listing.is_saved && 'fill-current')} />
            </Button>
          </div>
        </div>

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
              onClick={() => setCurrentImageIndex((i) => i === 0 ? images.length - 1 : i - 1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
              onClick={() => setCurrentImageIndex((i) => i === images.length - 1 ? 0 : i + 1)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              )}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>

        {listing.is_boosted && (
          <div className="absolute top-4 left-4 safe-area-top">
            <Badge className="gap-1 bg-accent text-accent-foreground">
              <Zap className="w-3 h-3" />
              {listing.boost_level === 'ultra' ? 'Featured' : 'Boosted'}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-foreground">{listing.title}</h1>
            {listing.condition && (
              <Badge
                variant="outline"
                className={cn('shrink-0', conditionColors[listing.condition])}
              >
                {conditionLabels[listing.condition]}
              </Badge>
            )}
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-accent">
              {isAuction && listing.current_bid
                ? formatPrice(listing.current_bid, listing.currency)
                : formatPrice(listing.price, listing.currency)}
            </span>
            {isAuction && (
              <span className="text-sm text-muted-foreground">
                ({listing.bid_count || 0} bids)
              </span>
            )}
          </div>

          {isAuction && listing.auction_end_time && (
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-3">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium">{getTimeRemaining(listing.auction_end_time)}</p>
                <p className="text-xs text-muted-foreground">Auction ends</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {listing.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{listing.views || 0} views</span>
          </div>
          <span>{getTimeAgo(listing.created_at)}</span>
        </div>

        {listing.description && (
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {listing.description}
            </p>
          </div>
        )}

        {/* Seller Info */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={listing.seller?.avatar_url || ''} alt={listing.seller?.display_name || ''} />
                <AvatarFallback>{(listing.seller?.display_name || 'S')[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{listing.seller?.display_name || listing.seller?.username}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span>{listing.seller?.rating || 0}</span>
                  {listing.seller?.is_verified && (
                    <>
                      <span className="mx-1">·</span>
                      <span className="text-accent">Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {!isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
              onClick={() => user ? setShowChatDialog(true) : openAuthModal('signin')}
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </Button>
            
            {isAuction ? (
              <Button
                size="lg"
                className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => user ? setShowBidDialog(true) : openAuthModal('signin')}
              >
                <Gavel className="w-5 h-5" />
                Place Bid
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => user ? setShowChatDialog(true) : openAuthModal('signin')}
              >
                <ShoppingBag className="w-5 h-5" />
                Buy Now
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Bid Dialog */}
      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current bid: {formatPrice(listing.current_bid || listing.price, listing.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                Minimum bid: {formatPrice(minBid, listing.currency)}
              </p>
            </div>
            <Input
              type="number"
              placeholder={`Enter amount (min ${formatPrice(minBid)})`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
            {bidError && <p className="text-sm text-destructive">{bidError}</p>}
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!bidAmount || Number(bidAmount) < minBid || isBidding}
              onClick={handleBid}
            >
              {isBidding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Bid
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Write your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              rows={4}
            />
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!chatMessage.trim() || isSending}
              onClick={handleSendMessage}
            >
              {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
