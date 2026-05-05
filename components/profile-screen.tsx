'use client'

import {
  Settings,
  ChevronRight,
  Package,
  Heart,
  Coins,
  Gift,
  BarChart3,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  LogOut,
  Star,
  Zap,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useLanguage } from '@/components/providers/language-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function ProfileScreen() {
  const { user, navigate, savedListings } = useAppStore()
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()

  const menuItems = [
    {
      icon: Package,
      label: t('my_listings'),
      value: '5 active',
      action: () => {},
    },
    {
      icon: Heart,
      label: t('watchlist'),
      value: `${savedListings.length} items`,
      action: () => navigate('saved'),
    },
    {
      icon: Coins,
      label: t('dudu_coins'),
      value: `${user?.coins || 0} coins`,
      action: () => {},
      highlight: true,
    },
    {
      icon: Gift,
      label: 'Referrals',
      value: 'Earn coins',
      action: () => {},
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      value: 'View stats',
      action: () => {},
    },
  ]

  const settingsItems = [
    {
      icon: theme === 'dark' ? Moon : Sun,
      label: 'Dark Mode',
      toggle: true,
      value: theme === 'dark',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      icon: Globe,
      label: 'Language',
      value: language.toUpperCase(),
      action: () => {},
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {},
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: () => {},
      danger: true,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('profile')}</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-1">
                {settingsItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl transition-colors',
                      'hover:bg-secondary',
                      item.danger && 'text-destructive'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.toggle ? (
                      <Switch checked={item.value as boolean} />
                    ) : item.value ? (
                      <span className="text-sm text-muted-foreground">
                        {item.value}
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-accent/20">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || 'Guest'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>{user?.rating || 0}</span>
                </div>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {user?.itemsSold || 0} sold
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
        </div>

        {/* Coins Card */}
        <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dudu_coins')}</p>
              <p className="text-2xl font-bold">{user?.coins || 0}</p>
            </div>
          </div>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Zap className="w-4 h-4 mr-1" />
            Get More
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Listings', value: '5' },
            { label: 'Total Views', value: '2.3K' },
            { label: 'Messages', value: '12' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-card rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl transition-colors',
                'bg-card hover:bg-secondary active:scale-[0.98]',
                item.highlight && 'ring-1 ring-accent/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    item.highlight ? 'bg-accent/20 text-accent' : 'bg-secondary'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{item.value}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
