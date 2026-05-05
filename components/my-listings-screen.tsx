'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ArrowLeft, Plus, MoreVertical, Eye, Edit, Trash2, Zap, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'

function formatPrice(price: number, currency = 'LKR') {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function MyListingsScreen() {
  const { goBack, navigate } = useAppStore()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchListings = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    setListings((data || []) as Listing[])
    setIsLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    
    await supabase
      .from('listings')
      .delete()
      .eq('id', deleteId)
    
    setListings(listings.filter(l => l.id !== deleteId))
    setDeleteId(null)
    setIsDeleting(false)
  }

  const handleMarkSold = async (id: string) => {
    await supabase
      .from('listings')
      .update({ is_sold: true, is_active: false })
      .eq('id', id)
    
    fetchListings()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please sign in</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">My Listings</h1>
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate('sell')}
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card rounded-2xl p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                  {listing.images?.[0] && (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {listing.is_sold && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge className="bg-accent text-accent-foreground">SOLD</Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{listing.title}</h3>
                      <p className="text-lg font-bold text-accent">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate('listing', listing.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        {!listing.is_sold && (
                          <>
                            <DropdownMenuItem onClick={() => handleMarkSold(listing.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Sold
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteId(listing.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={listing.is_active ? 'secondary' : 'outline'} className="text-xs">
                      {listing.is_sold ? 'Sold' : listing.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {listing.is_boosted && (
                      <Badge className="gap-1 bg-accent/20 text-accent text-xs">
                        <Zap className="w-3 h-3" />
                        Boosted
                      </Badge>
                    )}
                    {listing.is_auction && (
                      <Badge variant="outline" className="text-xs">Auction</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {listing.views || 0}
                    </span>
                    {listing.is_auction && (
                      <span>{listing.bid_count || 0} bids</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No listings yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
              Start selling by creating your first listing
            </p>
            <Button
              onClick={() => navigate('sell')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Create Listing
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The listing will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
