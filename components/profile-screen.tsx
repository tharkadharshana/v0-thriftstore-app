'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
  Bell,
  MessageSquare,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

const coinPackages = [
  { coins: 50, price: 500 },
  { coins: 100, price: 900 },
  { coins: 250, price: 2000 },
  { coins: 500, price: 3500 },
]

export function ProfileScreen() {
  const { navigate, openAuthModal } = useAppStore()
  const { user, profile, signOut, refreshProfile, isLoading: authLoading } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  
  const [stats, setStats] = useState({ listings: 0, views: 0, saved: 0 })
  const [showCoinsDialog, setShowCoinsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchStats = useCallback(async () => {
    if (!user) return
    
    const [listingsRes, savedRes] = await Promise.all([
      supabase
        .from('listings')
        .select('id, views')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase
        .from('saved_listings')
        .select('id')
        .eq('user_id', user.id),
    ])
    
    const totalViews = listingsRes.data?.reduce((sum, l) => sum + (l.views || 0), 0) || 0
    
    setStats({
      listings: listingsRes.data?.length || 0,
      views: totalViews,
      saved: savedRes.data?.length || 0,
    })
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchStats()
      setDisplayName(profile?.display_name || '')
      setPhone(profile?.phone || '')
    }
  }, [user, profile, fetchStats])

  const handleUpdateProfile = async () => {
    if (!user) return
    
    setIsUpdating(true)
    
    await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    
    await refreshProfile()
    setIsUpdating(false)
    setShowEditDialog(false)
  }

  const handlePurchaseCoins = async (coins: number) => {
    if (!user) return
    
    // In real app, integrate with payment gateway
    await supabase
      .from('profiles')
      .update({ coins: (profile?.coins || 0) + coins })
      .eq('id', user.id)
    
    await supabase
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: coins,
        type: 'purchase',
        description: `Purchased ${coins} coins`,
      })
    
    await refreshProfile()
    setShowCoinsDialog(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('home')
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 safe-area-top">
          <h1 className="text-xl font-bold">{t('profile')}</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Settings className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Welcome to DuDu</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Sign in to sell items, save favorites, and access all features
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => openAuthModal('signup')}
            >
              Create Account
            </Button>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => openAuthModal('signin')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      icon: Package,
      label: t('my_listings'),
      value: `${stats.listings} active`,
      action: () => navigate('my-listings'),
    },
    {
      icon: Heart,
      label: t('watchlist'),
      value: `${stats.saved} items`,
      action: () => navigate('saved'),
    },
    {
      icon: Coins,
      label: t('dudu_coins'),
      value: `${profile.coins} coins`,
      action: () => setShowCoinsDialog(true),
      highlight: true,
    },
    {
      icon: Bell,
      label: 'Notifications',
      value: 'View all',
      action: () => navigate('notifications'),
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: 'View chats',
      action: () => navigate('chat'),
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
      action: () => {
        const langs = ['en', 'sn', 'tm'] as const
        const current = langs.indexOf(language)
        setLanguage(langs[(current + 1) % langs.length])
      },
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {},
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleSignOut,
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
                      <span className="text-sm text-muted-foreground">{item.value}</span>
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
              <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || ''} />
              <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.display_name || profile.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>{profile.rating || 0}</span>
                </div>
                {profile.is_verified && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <Badge variant="secondary" className="text-accent">Verified</Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => setShowEditDialog(true)}>
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
              <p className="text-2xl font-bold">{profile.coins}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setShowCoinsDialog(true)}
          >
            <Zap className="w-4 h-4 mr-1" />
            Get More
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Listings', value: stats.listings },
            { label: 'Total Views', value: stats.views > 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views },
            { label: 'Saved Items', value: stats.saved },
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

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
              />
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleUpdateProfile}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coins Dialog */}
      <Dialog open={showCoinsDialog} onOpenChange={setShowCoinsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get DuDu Coins</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Coins are used to boost your listings and get more visibility
            </p>
            {coinPackages.map((pkg) => (
              <button
                key={pkg.coins}
                onClick={() => handlePurchaseCoins(pkg.coins)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-semibold">{pkg.coins} Coins</span>
                </div>
                <span className="font-bold text-accent">Rs. {pkg.price}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
