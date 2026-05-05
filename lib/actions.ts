'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { defaultCategories, isMissingCategoryTableError } from '@/lib/categories'
import type { Listing, Profile } from './types'

// ============ AUTH ACTIONS ============

export async function signUp(email: string, password: string, username: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
        `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      data: {
        username,
        display_name: username,
      },
    },
  })
  
  if (error) return { error: error.message }
  return { data }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) return { error: error.message }
  return { data }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data as Profile | null
}

export async function updateProfile(updates: Partial<Profile>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}

// ============ LISTINGS ACTIONS ============

export async function getListings(options?: {
  category_id?: string
  search?: string
  condition?: string
  min_price?: number
  max_price?: number
  is_auction?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!user_id(*),
      category:categories(*)
    `)
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (options?.category_id) {
    query = query.eq('category_id', options.category_id)
  }
  if (options?.search) {
    query = query.ilike('title', `%${options.search}%`)
  }
  if (options?.condition) {
    query = query.eq('condition', options.condition)
  }
  if (options?.min_price) {
    query = query.gte('price', options.min_price)
  }
  if (options?.max_price) {
    query = query.lte('price', options.max_price)
  }
  if (options?.is_auction !== undefined) {
    query = query.eq('is_auction', options.is_auction)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }
  
  const { data, error } = await query
  
  if (error) return []
  
  // Check saved status for authenticated user
  if (user && data) {
    const { data: saved } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', user.id)
    
    const savedIds = new Set(saved?.map(s => s.listing_id) || [])
    return data.map(listing => ({
      ...listing,
      is_saved: savedIds.has(listing.id)
    })) as Listing[]
  }
  
  return data as Listing[]
}

export async function getListing(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!user_id(*),
      category:categories(*)
    `)
    .eq('id', id)
    .single()
  
  if (error || !data) return null
  
  // Increment views
  await supabase
    .from('listings')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id)
  
  // Check if saved
  if (user) {
    const { data: saved } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', id)
      .single()
    
    return { ...data, is_saved: !!saved } as Listing
  }
  
  return data as Listing
}

export async function createListing(listing: {
  title: string
  description?: string
  price: number
  category_id?: string
  condition?: string
  location?: string
  images?: string[]
  is_auction?: boolean
  auction_end_time?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { data, error } = await supabase
    .from('listings')
    .insert({
      ...listing,
      user_id: user.id,
      current_bid: listing.is_auction ? listing.price : null,
    })
    .select()
    .single()
  
  if (error) return { error: error.message }
  
  // Update category listing count
  if (listing.category_id) {
    await supabase.rpc('increment_category_count', { cat_id: listing.category_id })
  }
  
  revalidatePath('/')
  return { data }
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}

export async function deleteListing(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}

// ============ SAVED LISTINGS ============

export async function toggleSaved(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single()
  
  if (existing) {
    // Remove
    await supabase
      .from('saved_listings')
      .delete()
      .eq('id', existing.id)
    
    return { saved: false }
  } else {
    // Add
    await supabase
      .from('saved_listings')
      .insert({ user_id: user.id, listing_id: listingId })
    
    return { saved: true }
  }
}

export async function getSavedListings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
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
  
  return data?.map(s => ({ ...s.listing, is_saved: true })) as Listing[] || []
}

// ============ BIDS ============

export async function placeBid(listingId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  // Get current listing
  const { data: listing } = await supabase
    .from('listings')
    .select('current_bid, user_id, auction_end_time')
    .eq('id', listingId)
    .single()
  
  if (!listing) return { error: 'Listing not found' }
  if (listing.user_id === user.id) return { error: 'Cannot bid on own listing' }
  if (listing.current_bid && amount <= listing.current_bid) {
    return { error: 'Bid must be higher than current bid' }
  }
  if (listing.auction_end_time && new Date(listing.auction_end_time) < new Date()) {
    return { error: 'Auction has ended' }
  }
  
  // Insert bid
  const { error: bidError } = await supabase
    .from('bids')
    .insert({ listing_id: listingId, user_id: user.id, amount })
  
  if (bidError) return { error: bidError.message }
  
  // Update listing
  await supabase
    .from('listings')
    .update({ 
      current_bid: amount, 
      bid_count: (listing as { bid_count?: number }).bid_count ? (listing as { bid_count: number }).bid_count + 1 : 1 
    })
    .eq('id', listingId)
  
  // Create notification for seller
  await supabase
    .from('notifications')
    .insert({
      user_id: listing.user_id,
      type: 'bid',
      title: 'New bid received',
      body: `Someone placed a bid of ${amount}`,
      listing_id: listingId,
    })
  
  revalidatePath('/')
  return { success: true }
}

export async function getBids(listingId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:profiles!user_id(*)
    `)
    .eq('listing_id', listingId)
    .order('amount', { ascending: false })
    .limit(10)
  
  return data || []
}

// ============ CATEGORIES ============

const seedCategoriesData = [
  { name: 'Electronics', name_si: 'ඉලෙක්ට්රොනික', name_ta: 'மின்னணு', icon: 'smartphone', color: '#3B82F6' },
  { name: 'Fashion', name_si: 'විලාසිතා', name_ta: 'ஆடை', icon: 'shirt', color: '#EC4899' },
  { name: 'Home & Garden', name_si: 'නිවස සහ උද්යාන', name_ta: 'வீடு மற்றும் தோட்டம்', icon: 'home', color: '#10B981' },
  { name: 'Vehicles', name_si: 'වාහන', name_ta: 'வாகனங்கள்', icon: 'car', color: '#F59E0B' },
  { name: 'Sports', name_si: 'ක්රීඩා', name_ta: 'விளையாட்டு', icon: 'dumbbell', color: '#8B5CF6' },
  { name: 'Books', name_si: 'පොත්', name_ta: 'புத்தகங்கள்', icon: 'book-open', color: '#06B6D4' },
  { name: 'Kids', name_si: 'ළමුන්', name_ta: 'குழந்தைகள்', icon: 'baby', color: '#F97316' },
  { name: 'Services', name_si: 'සේවා', name_ta: 'சேவைகள்', icon: 'wrench', color: '#64748B' },
]

export async function ensureCategoriesSeeded() {
  const supabase = await createClient()
  const { data: existingCategories, error: existingError } = await supabase
    .from('categories')
    .select('id')
    .limit(1)

  if (existingError) {
    if (isMissingCategoryTableError(existingError)) {
      return
    }
    throw existingError
  }

  if (existingCategories && existingCategories.length > 0) {
    return
  }

  const { error } = await supabase.from('categories').insert(seedCategoriesData)
  if (error) {
    if (isMissingCategoryTableError(error)) {
      return
    }
    throw error
  }
}

export async function getCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    if (isMissingCategoryTableError(error)) {
      return defaultCategories
    }
    throw error
  }
  
  return data || []
}

// ============ COINS & BOOSTS ============

export async function boostListing(listingId: string, level: 'basic' | 'premium' | 'ultra') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const costs = { basic: 10, premium: 25, ultra: 50 }
  const durations = { basic: 24, premium: 72, ultra: 168 } // hours
  
  // Get user coins
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.coins < costs[level]) {
    return { error: 'Not enough coins' }
  }
  
  // Deduct coins
  await supabase
    .from('profiles')
    .update({ coins: profile.coins - costs[level] })
    .eq('id', user.id)
  
  // Record transaction
  await supabase
    .from('coin_transactions')
    .insert({
      user_id: user.id,
      amount: -costs[level],
      type: 'boost',
      description: `${level} boost for listing`,
      listing_id: listingId,
    })
  
  // Update listing
  const boostExpires = new Date()
  boostExpires.setHours(boostExpires.getHours() + durations[level])
  
  await supabase
    .from('listings')
    .update({
      is_boosted: true,
      boost_level: level,
      boost_expires_at: boostExpires.toISOString(),
    })
    .eq('id', listingId)
    .eq('user_id', user.id)
  
  revalidatePath('/')
  return { success: true }
}

export async function purchaseCoins(amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  // Get current coins
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .single()
  
  if (!profile) return { error: 'Profile not found' }
  
  // Add coins
  await supabase
    .from('profiles')
    .update({ coins: profile.coins + amount })
    .eq('id', user.id)
  
  // Record transaction
  await supabase
    .from('coin_transactions')
    .insert({
      user_id: user.id,
      amount,
      type: 'purchase',
      description: `Purchased ${amount} coins`,
    })
  
  revalidatePath('/')
  return { success: true, newBalance: profile.coins + amount }
}

// ============ NOTIFICATIONS ============

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)
  
  return data || []
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id)
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
}

// ============ MESSAGES ============

export async function sendMessage(listingId: string, receiverId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('messages')
    .insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    })
  
  if (error) return { error: error.message }
  
  // Create notification
  await supabase
    .from('notifications')
    .insert({
      user_id: receiverId,
      type: 'message',
      title: 'New message',
      body: content.substring(0, 100),
      listing_id: listingId,
    })
  
  return { success: true }
}

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data } = await supabase
    .from('messages')
    .select(`
      *,
      listing:listings(id, title, images),
      sender:profiles!sender_id(id, username, display_name, avatar_url),
      receiver:profiles!receiver_id(id, username, display_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
  
  // Group by listing + other user
  const conversations = new Map()
  data?.forEach(msg => {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const key = `${msg.listing_id}-${otherId}`
    if (!conversations.has(key)) {
      conversations.set(key, {
        listing: msg.listing,
        otherUser: msg.sender_id === user.id ? msg.receiver : msg.sender,
        lastMessage: msg,
        unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0
      })
    } else if (msg.receiver_id === user.id && !msg.is_read) {
      conversations.get(key).unread++
    }
  })
  
  return Array.from(conversations.values())
}

export async function getMessages(listingId: string, otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
  
  // Mark as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('listing_id', listingId)
    .eq('sender_id', otherUserId)
    .eq('receiver_id', user.id)
  
  return data || []
}

// ============ USER LISTINGS ============

export async function getMyListings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data } = await supabase
    .from('listings')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return data as Listing[] || []
}

export async function markAsSold(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('listings')
    .update({ is_sold: true, is_active: false })
    .eq('id', listingId)
    .eq('user_id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}
