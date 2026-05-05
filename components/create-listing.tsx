'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { categories, boostPackages, formatPrice } from '@/lib/mock-data'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function CreateListing() {
  const { goBack, user, spendCoins } = useAppStore()
  const { t } = useLanguage()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')
  const [listingType, setListingType] = useState<'buy_now' | 'auction'>('buy_now')
  const [images, setImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showBoostDialog, setShowBoostDialog] = useState(false)
  const [selectedBoost, setSelectedBoost] = useState<string | null>(null)
  const [boostAfterCreate, setBoostAfterCreate] = useState(false)

  const handleImageUpload = () => {
    // Mock image upload
    const mockImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    ]
    if (images.length < 5) {
      setImages([...images, mockImages[images.length % mockImages.length]])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const generateAIDescription = async () => {
    if (!title || !category) return
    
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const descriptions: Record<string, string> = {
      electronics: `Premium ${title} in excellent condition. Features top-of-the-line specifications and comes with all original accessories. Perfect for tech enthusiasts looking for quality at a great price. Fully tested and ready for immediate use.`,
      fashion: `Stylish ${title} that combines comfort with elegance. Made from high-quality materials that ensure durability and a premium feel. Perfect for any occasion, whether casual or formal.`,
      vehicles: `Well-maintained ${title} with complete service history. Low mileage and excellent condition inside and out. All documents clear and ready for transfer. A reliable choice for your transportation needs.`,
      default: `Quality ${title} available for sale. Well-maintained and in great condition. Contact for more details and to schedule a viewing. Serious buyers only.`,
    }
    
    setDescription(descriptions[category] || descriptions.default)
    setIsGenerating(false)
  }

  const handleSubmit = () => {
    if (boostAfterCreate && selectedBoost) {
      const pkg = boostPackages.find((p) => p.id === selectedBoost)
      if (pkg && !spendCoins(pkg.coins)) {
        // Not enough coins
        return
      }
    }
    // Create listing logic would go here
    goBack()
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
              <button
                onClick={handleImageUpload}
                className="w-24 h-24 shrink-0 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="What are you selling?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
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
          <Label>Condition</Label>
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
          <Label htmlFor="price">{t('price')} (Rs.)</Label>
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
                  Get more visibility
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
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={pkg.id} />
                      <div>
                        <p className="font-medium text-sm">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pkg.duration}
                        </p>
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
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleSubmit}
            disabled={!title || !category || !price || !condition}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Listing
            {boostAfterCreate && selectedBoost && (
              <span className="ml-2 opacity-70">
                + Boost ({boostPackages.find((p) => p.id === selectedBoost)?.coins} coins)
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
