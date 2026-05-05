'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ArrowLeft, X, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useLanguage } from '@/components/providers/language-provider'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Listing, Category } from '@/lib/types'

export function SearchScreen() {
  const { goBack, searchQuery, setSearchQuery, setActiveCategory, navigate } = useAppStore()
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [searchResults, setSearchResults] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const trendingSearches = ['iPhone', 'PlayStation', 'Honda', 'Nike', 'Samsung', 'MacBook']

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name').limit(6)
    setCategories((data || []) as Category[])
  }, [supabase])

  useEffect(() => {
    fetchCategories()
    // Load recent searches from localStorage
    const saved = localStorage.getItem('dudu-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [fetchCategories])

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!user_id(*),
        category:categories(*)
      `)
      .eq('is_active', true)
      .eq('is_sold', false)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('is_boosted', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
    
    setSearchResults((data || []) as Listing[])
    setIsSearching(false)
    
    // Save to recent searches
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('dudu-recent-searches', JSON.stringify(updated))
    }
  }, [supabase, recentSearches])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(localQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [localQuery, performSearch])

  const handleSearch = (query: string) => {
    setLocalQuery(query)
    setSearchQuery(query)
  }

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    navigate('home')
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('dudu-recent-searches')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Search Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('search')}
              value={localQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {localQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {localQuery ? (
          // Search Results
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isSearching ? 'Searching...' : `${searchResults.length} results for "${localQuery}"`}
            </p>
            
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onUpdate={() => performSearch(localQuery)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or browse categories
                </p>
              </div>
            )}
          </div>
        ) : (
          // Default Search View
          <div className="space-y-6">
            {/* Quick Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Recent Searches</h3>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="w-full flex items-center gap-3 py-2.5 px-1 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Trending Now
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term, idx) => (
                  <Badge
                    key={term}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent/10 hover:border-accent transition-colors"
                    onClick={() => handleSearch(term)}
                  >
                    <span className="text-accent mr-1.5">{idx + 1}</span>
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
