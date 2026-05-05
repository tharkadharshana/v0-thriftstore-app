'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { AuthModal } from '@/components/auth-modal'
import { HomeFeed } from '@/components/home-feed'
import { ListingDetail } from '@/components/listing-detail'
import { CreateListing } from '@/components/create-listing'
import { CategoriesScreen } from '@/components/categories-screen'
import { SearchScreen } from '@/components/search-screen'
import { SavedScreen } from '@/components/saved-screen'
import { ProfileScreen } from '@/components/profile-screen'
import { MyListingsScreen } from '@/components/my-listings-screen'
import { NotificationsScreen } from '@/components/notifications-screen'
import { ChatScreen } from '@/components/chat-screen'
import { BottomNav } from '@/components/bottom-nav'
import { Loader2 } from 'lucide-react'

export function AppShell() {
  const { currentScreen, showAuthModal, authModalMode, closeAuthModal } = useAppStore()
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeFeed />
      case 'listing':
        return <ListingDetail />
      case 'sell':
        return <CreateListing />
      case 'categories':
        return <CategoriesScreen />
      case 'search':
        return <SearchScreen />
      case 'saved':
        return <SavedScreen />
      case 'profile':
        return <ProfileScreen />
      case 'my-listings':
        return <MyListingsScreen />
      case 'notifications':
        return <NotificationsScreen />
      case 'chat':
        return <ChatScreen />
      default:
        return <HomeFeed />
    }
  }

  return (
    <div className="relative">
      {renderScreen()}
      <BottomNav />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        mode={authModalMode}
      />
    </div>
  )
}
