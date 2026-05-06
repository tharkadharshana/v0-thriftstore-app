import { ensureCategoriesSeeded } from '@/lib/actions'
import dynamic from 'next/dynamic'

const AppShell = dynamic(() => import('@/components/app-shell'), { ssr: false })

export default async function HomePage() {
  try {
    await ensureCategoriesSeeded()
  } catch (error) {
    console.warn('Could not seed categories:', error)
  }

  return <AppShell />
}
