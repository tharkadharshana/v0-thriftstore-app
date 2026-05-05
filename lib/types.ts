export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  coins: number
  is_verified: boolean
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_si: string | null
  name_ta: string | null
  icon: string | null
  color: string | null
  listing_count: number
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string | null
  price: number
  original_price: number | null
  currency: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | null
  location: string | null
  images: string[]
  is_auction: boolean
  auction_end_time: string | null
  current_bid: number | null
  bid_count: number
  is_boosted: boolean
  boost_level: 'basic' | 'premium' | 'ultra' | null
  boost_expires_at: string | null
  views: number
  is_sold: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined fields
  seller?: Profile
  category?: Category
  is_saved?: boolean
}

export interface SavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listing?: Listing
}

export interface Bid {
  id: string
  listing_id: string
  user_id: string
  amount: number
  created_at: string
  bidder?: Profile
}

export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'boost' | 'referral' | 'reward' | 'refund'
  description: string | null
  listing_id: string | null
  created_at: string
}

export interface Message {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
  listing?: Listing
}

export interface Notification {
  id: string
  user_id: string
  type: 'bid' | 'message' | 'sale' | 'boost_expired' | 'price_drop' | 'system'
  title: string
  body: string | null
  listing_id: string | null
  is_read: boolean
  created_at: string
}

export type Language = 'en' | 'si' | 'ta'

export type BoostPackage = {
  id: string
  name: string
  coins: number
  duration: number
  level: 'basic' | 'premium' | 'ultra'
  features: string[]
}
