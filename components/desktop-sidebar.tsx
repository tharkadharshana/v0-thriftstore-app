'use client'

import { Home, Grid3X3, Plus, Heart, User, Coins, Bell, MessageSquare, Package, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type Screen } from '@/lib/store'
import { useLanguage } from '@/components/providers/language-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface NavItem {
  id: Screen
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  isSpecial?: boolean
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'categories', icon: Grid3X3, labelKey: 'categories' },
  { id: 'saved', icon: Heart, labelKey: 'saved' },
  { id: 'notifications', icon: Bell, labelKey: 'Notifications' },
  { id: 'chat', icon: MessageSquare, labelKey: 'Messages' },
  { id: 'my-listings', icon: Package, labelKey: 'my_listings' },
  { id: 'profile', icon: User, labelKey: 'profile' },
]

export function DesktopSidebar() {
  const { currentScreen, navigate, openAuthModal } = useAppStore()
  const { t } = useLanguage()
  const { user, profile, signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-card border-r border-border overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <span className="text-accent-foreground font-bold text-lg">D</span>
        </div>
        <span className="text-foreground font-bold text-xl tracking-tight">DuDu</span>
      </div>

      {/* Sell Button */}
      <div className="px-4 py-4">
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          onClick={() => navigate('sell')}
        >
          <Plus className="w-4 h-4" />
          {t('sell')}
        </Button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id
          const Icon = item.icon
          const label = item.labelKey in { 'Notifications': 1, 'Messages': 1, 'my_listings': 1 }
            ? item.labelKey === 'my_listings' ? t('my_listings') : item.labelKey
            : t(item.labelKey)

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-accent')} />
              <span className="text-sm">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User / Coins Footer */}
      <div className="p-4 border-t border-border space-y-3">
        {user && profile ? (
          <>
            {/* Coins */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => navigate('profile')}
            >
              <Coins className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">{profile.coins} coins</span>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                  {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.display_name || profile.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={async () => { await signOut(); navigate('home') }}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => openAuthModal('signin')}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => openAuthModal('signup')}
            >
              Create Account
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
