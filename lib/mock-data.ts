import type { Listing } from './store'

export const categories = [
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone' },
  { id: 'vehicles', name: 'Vehicles', icon: 'Car' },
  { id: 'property', name: 'Property', icon: 'Home' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt' },
  { id: 'home_living', name: 'Home & Living', icon: 'Sofa' },
  { id: 'sports', name: 'Sports', icon: 'Dumbbell' },
  { id: 'books', name: 'Books', icon: 'BookOpen' },
  { id: 'toys', name: 'Toys & Games', icon: 'Gamepad2' },
] as const

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max 256GB - Deep Purple',
    description: 'Pristine condition iPhone 14 Pro Max. Battery health 98%. Includes original box, charger, and Apple Care+ until 2025. No scratches or dents.',
    price: 285000,
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&h=400&fit=crop',
    ],
    category: 'electronics',
    condition: 'like_new',
    listingType: 'buy_now',
    location: 'Colombo 07',
    sellerId: 'seller-1',
    sellerName: 'TechMart LK',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    createdAt: '2024-03-15T10:00:00Z',
    views: 1250,
    isBoosted: true,
    boostLevel: 'featured',
  },
  {
    id: '2',
    title: 'Honda Vezel 2019 - Pearl White',
    description: 'Well maintained Honda Vezel 2019 model. First owner, full service history at Honda Lanka. 45,000km mileage. Leather seats, sunroof, reverse camera.',
    price: 12500000,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop',
    ],
    category: 'vehicles',
    condition: 'good',
    listingType: 'buy_now',
    location: 'Nugegoda',
    sellerId: 'seller-2',
    sellerName: 'AutoHub SL',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    createdAt: '2024-03-14T08:30:00Z',
    views: 890,
    isBoosted: true,
    boostLevel: 'premium',
  },
  {
    id: '3',
    title: 'Vintage Levis 501 Jeans - Size 32',
    description: 'Original vintage Levis 501 from the 90s. Great fade and character. Rare find for denim enthusiasts.',
    price: 15000,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    ],
    category: 'fashion',
    condition: 'good',
    listingType: 'auction',
    location: 'Pita Kotte',
    sellerId: 'seller-3',
    sellerName: 'VintageVibes',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    createdAt: '2024-03-13T14:00:00Z',
    views: 456,
    isBoosted: false,
    currentBid: 18500,
    bidCount: 12,
    endsAt: '2024-03-20T18:00:00Z',
  },
  {
    id: '4',
    title: 'MacBook Pro M2 14" 512GB',
    description: 'Brand new sealed MacBook Pro M2. International warranty. Space Gray color.',
    price: 520000,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    ],
    category: 'electronics',
    condition: 'new',
    listingType: 'buy_now',
    location: 'Colombo 03',
    sellerId: 'seller-4',
    sellerName: 'AppleStore LK',
    sellerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    createdAt: '2024-03-12T09:15:00Z',
    views: 2100,
    isBoosted: true,
    boostLevel: 'featured',
  },
  {
    id: '5',
    title: 'IKEA Malm Bed Frame - Queen Size',
    description: 'Gently used IKEA Malm bed frame in white. Queen size with storage drawers. Disassembled for easy transport.',
    price: 45000,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop',
    ],
    category: 'home_living',
    condition: 'good',
    listingType: 'buy_now',
    location: 'Rajagiriya',
    sellerId: 'seller-5',
    sellerName: 'HomeDecor SL',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    createdAt: '2024-03-11T16:45:00Z',
    views: 320,
    isBoosted: false,
  },
  {
    id: '6',
    title: 'Sony PlayStation 5 Digital Edition',
    description: 'PS5 Digital Edition with 2 controllers. 6 months old, barely used. Includes original packaging.',
    price: 165000,
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
    ],
    category: 'electronics',
    condition: 'like_new',
    listingType: 'auction',
    location: 'Dehiwala',
    sellerId: 'seller-6',
    sellerName: 'GamerZone',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    createdAt: '2024-03-10T11:00:00Z',
    views: 780,
    isBoosted: true,
    boostLevel: 'basic',
    currentBid: 172000,
    bidCount: 8,
    endsAt: '2024-03-18T20:00:00Z',
  },
  {
    id: '7',
    title: 'Giant Escape 3 Hybrid Bike',
    description: 'Giant Escape 3 in excellent condition. Perfect for city commuting. Size M frame.',
    price: 85000,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop',
    ],
    category: 'sports',
    condition: 'good',
    listingType: 'buy_now',
    location: 'Battaramulla',
    sellerId: 'seller-7',
    sellerName: 'CycleHub',
    sellerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
    createdAt: '2024-03-09T13:20:00Z',
    views: 445,
    isBoosted: false,
  },
  {
    id: '8',
    title: 'Samsung 65" QLED 4K Smart TV',
    description: 'Samsung Q80T 65 inch QLED TV. 2023 model with warranty until 2026. Wall mount included.',
    price: 380000,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    ],
    category: 'electronics',
    condition: 'like_new',
    listingType: 'buy_now',
    location: 'Mount Lavinia',
    sellerId: 'seller-8',
    sellerName: 'ElectroMart',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    createdAt: '2024-03-08T10:30:00Z',
    views: 670,
    isBoosted: true,
    boostLevel: 'premium',
  },
  {
    id: '9',
    title: 'Land for Sale - Kandy Road',
    description: '20 perches prime land on Kandy Road. Clear title, electricity and water available. Ideal for commercial or residential development.',
    price: 45000000,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop',
    ],
    category: 'property',
    condition: 'new',
    listingType: 'buy_now',
    location: 'Kadawatha',
    sellerId: 'seller-9',
    sellerName: 'LandMark Properties',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    createdAt: '2024-03-07T14:00:00Z',
    views: 1890,
    isBoosted: true,
    boostLevel: 'featured',
  },
  {
    id: '10',
    title: 'Nike Air Jordan 1 Retro High - Size 10',
    description: 'Brand new Air Jordan 1 Retro High OG. University Blue colorway. Size US 10. Original receipt available.',
    price: 42000,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop',
    ],
    category: 'fashion',
    condition: 'new',
    listingType: 'auction',
    location: 'Colombo 04',
    sellerId: 'seller-10',
    sellerName: 'SneakerHead LK',
    sellerAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    createdAt: '2024-03-06T09:45:00Z',
    views: 920,
    isBoosted: false,
    currentBid: 48000,
    bidCount: 15,
    endsAt: '2024-03-19T12:00:00Z',
  },
]

export const boostPackages = [
  {
    id: 'basic',
    name: 'Basic Boost',
    coins: 50,
    duration: '3 days',
    features: ['Higher in search results', 'Boost badge'],
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    coins: 100,
    duration: '7 days',
    features: ['Featured in category', 'Priority placement', 'Boost badge', 'Analytics'],
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    coins: 200,
    duration: '14 days',
    features: ['Homepage spotlight', 'Top of search', 'Featured badge', 'Full analytics', 'Social promotion'],
  },
]

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `Rs. ${(price / 1000000).toFixed(1)}M`
  }
  if (price >= 1000) {
    return `Rs. ${(price / 1000).toFixed(0)}K`
  }
  return `Rs. ${price.toLocaleString()}`
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function getTimeRemaining(endsAt: string): string {
  const end = new Date(endsAt)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Ended'
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h left`
  }
  return `${hours}h ${minutes}m left`
}
