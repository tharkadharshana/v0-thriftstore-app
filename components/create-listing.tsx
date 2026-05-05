'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Camera,
  X,
  Sparkles,
  Zap,
  Loader2,
  MapPin,
  Plus,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { defaultCategories, isMissingCategoryTableError } from '@/lib/categories'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

const boostPackages = [
  { id: 'basic', name: 'Basic Boost', coins: 10, duration: '24 hours', level: 'basic' as const },
  { id: 'premium', name: 'Premium Boost', coins: 25, duration: '3 days', level: 'premium' as const },
  { id: 'ultra', name: 'Ultra Featured', coins: 50, duration: '7 days', level: 'ultra' as const },
]

export function CreateListing() {
  const { goBack, openAuthModal, navigate } = useAppStore()
  const { user, profile, refreshProfile } = useAuth()
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')
  const [listingType, setListingType] = useState<'buy_now' | 'auction'>('buy_now')
  const [auctionDays, setAuctionDays] = useState('3')
  const [images, setImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBoost, setSelectedBoost] = useState<string | null>(null)
  const [boostAfterCreate, setBoostAfterCreate] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      setCategories((data || []) as Category[])
    } catch (err) {
      if (isMissingCategoryTableError(err)) {
        setCategories(defaultCategories)
        return
      }
      console.error('Failed to load categories', err)
      setCategories([])
    }
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (!user) {
      openAuthModal('signin')
    }
  }, [user, openAuthModal])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || images.length >= 5) return
    
    for (let i = 0; i < files.length && images.length + i < 5; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onload = () => {
        setImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const generateAIDescription = async () => {
    if (!title || !category) return
    
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const catName = categories.find(c => c.id === category)?.name || ''
    const descriptions: Record<string, string> = {
      Electronics: `Premium ${title} in excellent condition. Features top-of-the-line specifications and comes with all original accessories. Perfect for tech enthusiasts looking for quality at a great price. Fully tested and ready for immediate use.`,
      Fashion: `Stylish ${title} that combines comfort with elegance. Made from high-quality materials that ensure durability and a premium feel. Perfect for any occasion, whether casual or formal.`,
      Vehicles: `Well-maintained ${title} with complete service history. Low mileage and excellent condition inside and out. All documents clear and ready for transfer. A reliable choice for your transportation needs.`,
      default: `Quality ${title} available for sale. Well-maintained and in great condition. Contact for more details and to schedule a viewing. Serious buyers only.`,
    }
    
    setDescription(descriptions[catName] || descriptions.default)
    setIsGenerating(false)
  }

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal('signin')
      return
    }
    
    if (!title || !category || !price || !condition) {
      setError('Please fill in all required fields')
      return
    }
    
    // Check coins if boosting
    if (boostAfterCreate && selectedBoost) {
      const pkg = boostPackages.find(p => p.id === selectedBoost)
      if (pkg && (profile?.coins || 0) < pkg.coins) {
        setError('Not enough coins for boost')
        return
      }
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      // Calculate auction end time if auction
      let auctionEndTime = null
      if (listingType === 'auction') {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + parseInt(auctionDays))
        auctionEndTime = endDate.toISOString()
      }
      
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title,
          description,
          price: Number(price),
          category_id: category,
          condition,
          location,
          images,
          is_auction: listingType === 'auction',
          auction_end_time: auctionEndTime,
          current_bid: listingType === 'auction' ? Number(price) : null,
          is_boosted: boostAfterCreate && !!selectedBoost,
          boost_level: boostAfterCreate ? selectedBoost : null,
          boost_expires_at: boostAfterCreate && selectedBoost ? (() => {
            const pkg = boostPackages.find(p => p.id === selectedBoost)
            const hours = pkg?.id === 'basic' ? 24 : pkg?.id === 'premium' ? 72 : 168
            const expires = new Date()
            expires.setHours(expires.getHours() + hours)
            return expires.toISOString()
          })() : null,
        })
        .select()
        .single()
      
      if (listingError) throw listingError
      
      // Deduct coins if boosting
      if (boostAfterCreate && selectedBoost && listing) {
        const pkg = boostPackages.find(p => p.id === selectedBoost)
        if (pkg) {
          await supabase
            .from('profiles')
            .update({ coins: (profile?.coins || 0) - pkg.coins })
            .eq('id', user.id)
          
          await supabase
            .from('coin_transactions')
            .insert({
              user_id: user.id,
              amount: -pkg.coins,
              type: 'boost',
              description: `${pkg.name} for listing`,
              listing_id: listing.id,
            })
          
          refreshProfile()
        }
      }
      
      navigate('home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{t('create_listing')}</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 px-4 py-4 pb-32 space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Photos (max 5)</Label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 shrink-0">
                <Image
                  src={img}
                  alt={`Upload ${idx + 1}`}
                  fill
                  className="object-cover rounded-xl"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 shrink-0 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer">
                <Camera className="w-6 h-6" />
                <span className="text-xs">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="What are you selling?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description with AI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">{t('description')}</Label>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-accent"
              onClick={generateAIDescription}
              disabled={isGenerating || !title || !category}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {t('generate_ai')}
            </Button>
          </div>
          <Textarea
            id="description"
            placeholder="Describe your item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label>Condition *</Label>
          <div className="flex flex-wrap gap-2">
            {['new', 'like_new', 'good', 'fair'].map((cond) => (
              <Badge
                key={cond}
                variant={condition === cond ? 'default' : 'secondary'}
                className={cn(
                  'cursor-pointer',
                  condition === cond && 'bg-accent text-accent-foreground'
                )}
                onClick={() => setCondition(cond)}
              >
                {t(`condition_${cond}`)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">{t('price')} (Rs.) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Listing Type */}
        <div className="space-y-2">
          <Label>Listing Type</Label>
          <div className="flex items-center bg-secondary rounded-xl p-1">
            <button
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                listingType === 'buy_now'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
              onClick={() => setListingType('buy_now')}
            >
              {t('buy_now')}
            </button>
            <button
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                listingType === 'auction'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
              onClick={() => setListingType('auction')}
            >
              {t('auction')}
            </button>
          </div>
        </div>

        {/* Auction Duration */}
        {listingType === 'auction' && (
          <div className="space-y-2">
            <Label>Auction Duration</Label>
            <Select value={auctionDays} onValueChange={setAuctionDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">{t('location')}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Enter location"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Boost Option */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium">{t('boost_listing')}</p>
                <p className="text-xs text-muted-foreground">
                  Get more visibility (You have {profile?.coins || 0} coins)
                </p>
              </div>
            </div>
            <Switch
              checked={boostAfterCreate}
              onCheckedChange={setBoostAfterCreate}
            />
          </div>
          
          {boostAfterCreate && (
            <div className="pt-2 border-t border-border space-y-2">
              <RadioGroup
                value={selectedBoost || ''}
                onValueChange={setSelectedBoost}
              >
                {boostPackages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all',
                      selectedBoost === pkg.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border',
                      (profile?.coins || 0) < pkg.coins && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem 
                        value={pkg.id} 
                        disabled={(profile?.coins || 0) < pkg.coins}
                      />
                      <div>
                        <p className="font-medium text-sm">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground">{pkg.duration}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="w-3 h-3 text-accent" />
                      {pkg.coins}
                    </Badge>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-24 left-0 right-0 z-50 bg-card border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleSubmit}
            disabled={!title || !category || !price || !condition || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            Create Listing
            {boostAfterCreate && selectedBoost && (
              <span className="ml-2 opacity-70">
                + {boostPackages.find(p => p.id === selectedBoost)?.coins} coins
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
