'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Language = 'en' | 'sn' | 'tm'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'home': 'Home',
    'categories': 'Categories',
    'sell': 'Sell',
    'saved': 'Saved',
    'profile': 'Profile',
    'search': 'Search DuDu...',
    'boosted': 'Boosted',
    'sponsored': 'Sponsored',
    'buy_now': 'Buy Now',
    'auction': 'Auction',
    'condition_new': 'New',
    'condition_like_new': 'Like New',
    'condition_good': 'Good',
    'condition_fair': 'Fair',
    'electronics': 'Electronics',
    'vehicles': 'Vehicles',
    'property': 'Property',
    'fashion': 'Fashion',
    'home_living': 'Home & Living',
    'sports': 'Sports',
    'my_listings': 'My Listings',
    'watchlist': 'Watchlist',
    'dudu_coins': 'DuDu Coins',
    'boost_listing': 'Boost Listing',
    'create_listing': 'Create Listing',
    'price': 'Price',
    'location': 'Location',
    'description': 'Description',
    'generate_ai': 'Generate with AI',
    'views': 'Views',
    'messages': 'Messages',
    'all': 'All',
    'filter': 'Filter',
    'sort': 'Sort',
    'newest': 'Newest',
    'price_low': 'Price: Low to High',
    'price_high': 'Price: High to Low',
    'ending_soon': 'Ending Soon',
  },
  sn: {
    'home': 'Mulu Pituwa',
    'categories': 'Kotas',
    'sell': 'Vikinna',
    'saved': 'Savu Kala',
    'profile': 'Profaila',
    'search': 'DuDu Soyana...',
    'boosted': 'Boost Kala',
    'sponsored': 'Sponsor',
    'buy_now': 'Dæn Ganna',
    'auction': 'Lelama',
    'condition_new': 'Aluth',
    'condition_like_new': 'Aluth Wage',
    'condition_good': 'Honda',
    'condition_fair': 'Samanya',
    'electronics': 'Elektroniks',
    'vehicles': 'Vaahan',
    'property': 'Bim Kadu',
    'fashion': 'Fashion',
    'home_living': 'Gedara Badu',
    'sports': 'Kreeda',
    'my_listings': 'Mage Dæn',
    'watchlist': 'Balana Lista',
    'dudu_coins': 'DuDu Coins',
    'boost_listing': 'Boost Karanna',
    'create_listing': 'Aluth Dænweema',
    'price': 'Gana',
    'location': 'Thanaya',
    'description': 'Vistaraya',
    'generate_ai': 'AI Yoda',
    'views': 'Bælum',
    'messages': 'Panindu',
    'all': 'Okkoma',
    'filter': 'Peranna',
    'sort': 'Pelaganawa',
    'newest': 'Aluthma',
    'price_low': 'Gana: Aduwen Udata',
    'price_high': 'Gana: Udata Aduwen',
    'ending_soon': 'Iwara Wena',
  },
  tm: {
    'home': 'Veedu',
    'categories': 'Vagaigal',
    'sell': 'Vilai',
    'saved': 'Semitta',
    'profile': 'Suththa',
    'search': 'DuDu Thedi...',
    'boosted': 'Boost',
    'sponsored': 'Sponsor',
    'buy_now': 'Ippo Vaangu',
    'auction': 'Yilam',
    'condition_new': 'Pudhu',
    'condition_like_new': 'Pudhu Maadiri',
    'condition_good': 'Nalla',
    'condition_fair': 'Saadharana',
    'electronics': 'Minborul',
    'vehicles': 'Vaahana',
    'property': 'Nilam',
    'fashion': 'Fashion',
    'home_living': 'Veedu Borul',
    'sports': 'Vilaiyaattu',
    'my_listings': 'En Vilambara',
    'watchlist': 'Kavalai Patti',
    'dudu_coins': 'DuDu Coins',
    'boost_listing': 'Boost Pannu',
    'create_listing': 'Pudhu Vilambara',
    'price': 'Vilai',
    'location': 'Idam',
    'description': 'Vivaram',
    'generate_ai': 'AI Iyakku',
    'views': 'Paarvai',
    'messages': 'Seithi',
    'all': 'Ellam',
    'filter': 'Vadi',
    'sort': 'Varisai',
    'newest': 'Pudhiya',
    'price_low': 'Vilai: Kuraivu Adhigam',
    'price_high': 'Vilai: Adhigam Kuraivu',
    'ending_soon': 'Mudiyum',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = useCallback((key: string): string => {
    return translations[language][key] || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
