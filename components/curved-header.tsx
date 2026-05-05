'use client'

import { useState } from 'react'
import { Search, Bell, Coins, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useLanguage, type Language } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CurvedHeaderProps {
  onSearchFocus?: () => void
}

export function CurvedHeader({ onSearchFocus }: CurvedHeaderProps) {
  const { navigate, searchQuery, setSearchQuery, user } = useAppStore()
  const { language, setLanguage, t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'sn', label: 'SN' },
    { code: 'tm', label: 'TM' },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-gradient-to-b from-primary/95 to-primary curved-header transition-all duration-300',
        'pb-6 pt-4 px-4 safe-area-top',
        isScrolled && 'shadow-lg'
      )}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">D</span>
          </div>
          <span className="text-primary-foreground font-bold text-xl tracking-tight">
            DuDu
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-primary-foreground hover:bg-white/10"
            onClick={() => navigate('profile')}
          >
            <Coins className="w-4 h-4 text-accent" />
            <span className="font-semibold">{user?.coins || 0}</span>
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-primary-foreground hover:bg-white/10 px-2"
              >
                <span className="text-xs font-medium">{language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'text-sm',
                    language === lang.code && 'bg-accent/10 text-accent'
                  )}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        onClick={onSearchFocus}
        className="relative"
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/15 transition-colors">
          <Search className="w-5 h-5 text-primary-foreground/70" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              onSearchFocus?.()
              navigate('search')
            }}
            className="flex-1 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none"
          />
        </div>
      </div>
    </header>
  )
}
