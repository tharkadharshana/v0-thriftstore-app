'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Bell, Coins, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage, type Language } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types'

interface CurvedHeaderProps {
  onSearchFocus?: () => void
}

export function CurvedHeader({ onSearchFocus }: CurvedHeaderProps) {
  const { navigate, searchQuery, setSearchQuery } = useAppStore()
  const { user, profile } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const supabase = createClient()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'sn', label: 'SN' },
    { code: 'tm', label: 'TM' },
  ]

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setNotifications((data || []) as Notification[])
    setUnreadCount(data?.filter(n => !n.is_read).length || 0)
  }, [user, supabase])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAllRead = async () => {
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setUnreadCount(0)
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id)
    }

    if (notification.listing_id) {
      navigate('listing', notification.listing_id)
    }

    setShowNotifications(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid': return '🔨'
      case 'message': return '💬'
      case 'sale': return '🎉'
      case 'boost_expired': return '⏰'
      case 'price_drop': return '📉'
      default: return '📢'
    }
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-gradient-to-b from-primary/95 to-primary curved-header transition-all duration-300',
        'pb-6 pt-4 px-4 safe-area-top'
      )}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Logo — hide on desktop (sidebar has it) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">D</span>
          </div>
          <span className="text-primary-foreground font-bold text-xl tracking-tight">
            DuDu
          </span>
        </div>

        {/* Desktop: show page title */}
        <div className="hidden md:block">
          <h1 className="text-primary-foreground font-bold text-2xl">Marketplace</h1>
          <p className="text-primary-foreground/60 text-sm">Find great deals near you</p>
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
            <span className="font-semibold">{profile?.coins || 0}</span>
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
          <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/10 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center text-accent-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="flex flex-row items-center justify-between">
                <SheetTitle>Notifications</SheetTitle>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </SheetHeader>
              <div className="py-4 space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left',
                        notification.is_read ? 'bg-secondary/50' : 'bg-secondary'
                      )}
                    >
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm', !notification.is_read && 'font-semibold')}>
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Bar */}
      <div onClick={onSearchFocus} className="relative">
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
