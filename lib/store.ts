import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Screen = 'home' | 'categories' | 'sell' | 'saved' | 'profile' | 'listing' | 'search'

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  condition: 'new' | 'like_new' | 'good' | 'fair'
  listingType: 'buy_now' | 'auction'
  location: string
  sellerId: string
  sellerName: string
  sellerAvatar: string
  createdAt: string
  views: number
  isBoosted: boolean
  boostLevel?: 'basic' | 'premium' | 'featured'
  // Auction fields
  currentBid?: number
  bidCount?: number
  endsAt?: string
}

export interface User {
  id: string
  name: string
  avatar: string
  coins: number
  rating: number
  itemsSold: number
  joinedAt: string
}

interface AppState {
  currentScreen: Screen
  previousScreen: Screen | null
  selectedListingId: string | null
  savedListings: string[]
  user: User | null
  searchQuery: string
  activeCategory: string | null
  activeFilter: {
    condition?: string[]
    priceRange?: [number, number]
    listingType?: 'all' | 'buy_now' | 'auction'
    location?: string
  }
  
  // Actions
  navigate: (screen: Screen, listingId?: string) => void
  goBack: () => void
  toggleSaved: (listingId: string) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: string | null) => void
  setActiveFilter: (filter: AppState['activeFilter']) => void
  setUser: (user: User | null) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentScreen: 'home',
      previousScreen: null,
      selectedListingId: null,
      savedListings: [],
      user: {
        id: 'user-1',
        name: 'Kasun Perera',
        avatar: '/avatars/default.jpg',
        coins: 150,
        rating: 4.8,
        itemsSold: 23,
        joinedAt: '2024-01-15',
      },
      searchQuery: '',
      activeCategory: null,
      activeFilter: {},

      navigate: (screen, listingId) => set((state) => ({
        previousScreen: state.currentScreen,
        currentScreen: screen,
        selectedListingId: listingId || null,
      })),

      goBack: () => set((state) => ({
        currentScreen: state.previousScreen || 'home',
        previousScreen: null,
        selectedListingId: null,
      })),

      toggleSaved: (listingId) => set((state) => ({
        savedListings: state.savedListings.includes(listingId)
          ? state.savedListings.filter((id) => id !== listingId)
          : [...state.savedListings, listingId],
      })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveCategory: (category) => set({ activeCategory: category }),

      setActiveFilter: (filter) => set({ activeFilter: filter }),

      setUser: (user) => set({ user }),

      addCoins: (amount) => set((state) => ({
        user: state.user ? { ...state.user, coins: state.user.coins + amount } : null,
      })),

      spendCoins: (amount) => {
        const state = get()
        if (!state.user || state.user.coins < amount) return false
        set({
          user: { ...state.user, coins: state.user.coins - amount },
        })
        return true
      },
    }),
    {
      name: 'dudu-storage',
      partialize: (state) => ({
        savedListings: state.savedListings,
        user: state.user,
      }),
    }
  )
)
