import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  // Check if categories exist
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id')
    .limit(1)
  
  if (existingCategories && existingCategories.length > 0) {
    return NextResponse.json({ message: 'Already setup' })
  }

  // Insert categories
  const { error: catError } = await supabase.from('categories').insert([
    { name: 'Electronics', name_si: 'ඉලෙක්ට්රොනික', name_ta: 'மின்னணு', icon: 'smartphone', color: '#3B82F6' },
    { name: 'Fashion', name_si: 'විලාසිතා', name_ta: 'ஆடை', icon: 'shirt', color: '#EC4899' },
    { name: 'Home & Garden', name_si: 'නිවස සහ උද්යාන', name_ta: 'வீடு மற்றும் தோட்டம்', icon: 'home', color: '#10B981' },
    { name: 'Vehicles', name_si: 'වාහන', name_ta: 'வாகனங்கள்', icon: 'car', color: '#F59E0B' },
    { name: 'Sports', name_si: 'ක්රීඩා', name_ta: 'விளையாட்டு', icon: 'dumbbell', color: '#8B5CF6' },
    { name: 'Books', name_si: 'පොත්', name_ta: 'புத்தகங்கள்', icon: 'book-open', color: '#06B6D4' },
    { name: 'Kids', name_si: 'ළමුන්', name_ta: 'குழந்தைகள்', icon: 'baby', color: '#F97316' },
    { name: 'Services', name_si: 'සේවා', name_ta: 'சேவைகள்', icon: 'wrench', color: '#64748B' },
  ])

  if (catError) {
    return NextResponse.json({ error: catError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Setup complete' })
}
