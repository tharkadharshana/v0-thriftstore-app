'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Bell, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types'

export function NotificationsScreen() {
  const { goBack, navigate } = useAppStore()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    setNotifications((data || []) as Notification[])
    setIsLoading(false)
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
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id)
      
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ))
    }
    
    if (notification.listing_id) {
      navigate('listing', notification.listing_id)
    }
  }

  const getIcon = (type: string) => {
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
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please sign in</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-xl transition-colors text-left',
                  notification.is_read ? 'bg-card' : 'bg-secondary'
                )}
              >
                <span className="text-2xl">{getIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !notification.is_read && 'font-semibold')}>
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {getTimeAgo(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              You&apos;ll see notifications about bids, messages, and more here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
