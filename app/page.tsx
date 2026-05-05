import { AppShell } from '@/components/app-shell'
import { ensureCategoriesSeeded } from '@/lib/actions'

export default async function HomePage() {
  try {
    await ensureCategoriesSeeded()
  } catch (error) {
    console.warn('Could not seed categories:', error)
  }

  return <AppShell />
}
