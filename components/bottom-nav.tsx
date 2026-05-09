'use client'

import { Home, Grid3X3, Plus, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type Screen } from '@/lib/store'
import { useLanguage } from '@/components/providers/language-provider'

interface NavItem {
  id: Screen
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  isSpecial?: boolean
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'categories', icon: Grid3X3, labelKey: 'categories' },
  { id: 'sell', icon: Plus, labelKey: 'sell', isSpecial: true },
  { id: 'saved', icon: Heart, labelKey: 'saved' },
  { id: 'profile', icon: User, labelKey: 'profile' },
]

export function BottomNav() {
  const { currentScreen, navigate } = useAppStore()
  const { t } = useLanguage()

  // Hide on certain screens
  const hideOnScreens: Screen[] = ['listing', 'search']
  if (hideOnScreens.includes(currentScreen)) {
    return null
  }

  return (
    // md:hidden — desktop uses sidebar instead
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id
          const Icon = item.icon

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="relative -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 transition-transform active:scale-95">
                  <Icon className="w-7 h-7 text-accent-foreground" />
                </div>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all',
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
