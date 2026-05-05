import type { Category } from './types'

export const defaultCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    name_si: 'ඉලෙක්ට්රොනික',
    name_ta: 'மின்னணு',
    icon: 'smartphone',
    color: '#3B82F6',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    name_si: 'විලාසිතා',
    name_ta: 'ஆடை',
    icon: 'shirt',
    color: '#EC4899',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'home_garden',
    name: 'Home & Garden',
    name_si: 'නිවස සහ උද්යාන',
    name_ta: 'வீடு மற்றும் தோட்டம்',
    icon: 'home',
    color: '#10B981',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    name_si: 'වාහන',
    name_ta: 'வாகனங்கள்',
    icon: 'car',
    color: '#F59E0B',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'sports',
    name: 'Sports',
    name_si: 'ක්රීඩා',
    name_ta: 'விளையாட்டு',
    icon: 'dumbbell',
    color: '#8B5CF6',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'books',
    name: 'Books',
    name_si: 'පොත්',
    name_ta: 'புத்தகங்கள்',
    icon: 'book-open',
    color: '#06B6D4',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'kids',
    name: 'Kids',
    name_si: 'ළමුන්',
    name_ta: 'குழந்தைகள்',
    icon: 'baby',
    color: '#F97316',
    listing_count: 0,
    created_at: '',
  },
  {
    id: 'services',
    name: 'Services',
    name_si: 'සේවා',
    name_ta: 'சேவைகள்',
    icon: 'wrench',
    color: '#64748B',
    listing_count: 0,
    created_at: '',
  },
]

export function isMissingCategoryTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const err = error as { code?: string; message?: string }
  return (
    err.code === 'PGRST205' ||
    (typeof err.message === 'string' && err.message.includes("Could not find the table 'public.categories'"))
  )
}
