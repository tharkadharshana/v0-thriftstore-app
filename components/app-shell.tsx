'use client'

import { useAppStore } from '@/lib/store'
import { HomeFeed } from '@/components/home-feed'
import { ListingDetail } from '@/components/listing-detail'
import { CreateListing } from '@/components/create-listing'
import { CategoriesScreen } from '@/components/categories-screen'
import { SearchScreen } from '@/components/search-screen'
import { SavedScreen } from '@/components/saved-screen'
import { ProfileScreen } from '@/components/profile-screen'
import { BottomNav } from '@/components/bottom-nav'

export function AppShell() {
  const { currentScreen } = useAppStore()

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
      default:
        return <HomeFeed />
    }
  }

  return (
    <div className="relative">
      {renderScreen()}
      <BottomNav />
    </div>
  )
}
