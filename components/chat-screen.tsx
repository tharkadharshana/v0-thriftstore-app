'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

interface Conversation {
  listing_id: string
  listing_title: string
  listing_image: string | null
  other_user_id: string
  other_user_name: string
  other_user_avatar: string | null
  last_message: string
  last_message_time: string
  unread_count: number
}

export function ChatScreen() {
  const { goBack, navigate } = useAppStore()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    
    // Get all messages involving user
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        *,
        listing:listings(id, title, images),
        sender:profiles!sender_id(id, display_name, username, avatar_url),
        receiver:profiles!receiver_id(id, display_name, username, avatar_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    
    if (!messages) {
      setIsLoading(false)
      return
    }
    
    // Group by conversation (listing + other user)
    const convMap = new Map<string, Conversation>()
    
    for (const msg of messages) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
      const key = `${msg.listing_id}-${otherId}`
      
      if (!convMap.has(key)) {
        convMap.set(key, {
          listing_id: msg.listing_id,
          listing_title: msg.listing?.title || 'Unknown',
          listing_image: msg.listing?.images?.[0] || null,
          other_user_id: otherId,
          other_user_name: otherUser?.display_name || otherUser?.username || 'User',
          other_user_avatar: otherUser?.avatar_url || null,
          last_message: msg.content,
          last_message_time: msg.created_at,
          unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
        })
      } else if (msg.receiver_id === user.id && !msg.is_read) {
        const conv = convMap.get(key)!
        conv.unread_count++
      }
    }
    
    setConversations(Array.from(convMap.values()))
    setIsLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Messages</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={`${conv.listing_id}-${conv.other_user_id}`}
                onClick={() => navigate('listing', conv.listing_id)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left',
                  conv.unread_count > 0 ? 'bg-secondary' : 'bg-card'
                )}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.other_user_avatar || ''} />
                    <AvatarFallback>{conv.other_user_name[0]}</AvatarFallback>
                  </Avatar>
                  {conv.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center text-accent-foreground">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('font-semibold text-sm truncate', conv.unread_count > 0 && 'text-foreground')}>
                      {conv.other_user_name}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {getTimeAgo(conv.last_message_time)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Re: {conv.listing_title}
                  </p>
                  <p className={cn('text-sm truncate mt-1', conv.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                    {conv.last_message}
                  </p>
                </div>
                
                {conv.listing_image && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <Image
                      src={conv.listing_image}
                      alt={conv.listing_title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              When you contact sellers or receive inquiries, conversations will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
