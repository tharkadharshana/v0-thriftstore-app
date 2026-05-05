import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Screen = 'home' | 'categories' | 'sell' | 'saved' | 'profile' | 'listing' | 'search' | 'chat' | 'notifications' | 'my-listings'

interface AppState {
  currentScreen: Screen
  previousScreen: Screen | null
  selectedListingId: string | null
  chatListingId: string | null
  chatUserId: string | null
  searchQuery: string
  activeCategory: string | null
  activeFilter: {
    condition?: string[]
    priceRange?: [number, number]
    listingType?: 'all' | 'buy_now' | 'auction'
    location?: string
  }
  showAuthModal: boolean
  authModalMode: 'signin' | 'signup'
  
  // Actions
  navigate: (screen: Screen, listingId?: string) => void
  goBack: () => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: string | null) => void
  setActiveFilter: (filter: AppState['activeFilter']) => void
  openChat: (listingId: string, userId: string) => void
  openAuthModal: (mode?: 'signin' | 'signup') => void
  closeAuthModal: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentScreen: 'home',
      previousScreen: null,
      selectedListingId: null,
      chatListingId: null,
      chatUserId: null,
      searchQuery: '',
      activeCategory: null,
      activeFilter: {},
      showAuthModal: false,
      authModalMode: 'signin',

      navigate: (screen, listingId) => set((state) => ({
        previousScreen: state.currentScreen,
        currentScreen: screen,
        selectedListingId: listingId || state.selectedListingId,
      })),

      goBack: () => set((state) => ({
        currentScreen: state.previousScreen || 'home',
        previousScreen: null,
      })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveCategory: (category) => set({ activeCategory: category }),

      setActiveFilter: (filter) => set({ activeFilter: filter }),

      openChat: (listingId, userId) => set({
        chatListingId: listingId,
        chatUserId: userId,
        currentScreen: 'chat',
      }),

      openAuthModal: (mode = 'signin') => set({
        showAuthModal: true,
        authModalMode: mode,
      }),

      closeAuthModal: () => set({ showAuthModal: false }),
    }),
    {
      name: 'dudu-storage',
      partialize: (state) => ({
        activeCategory: state.activeCategory,
      }),
    }
  )
)
