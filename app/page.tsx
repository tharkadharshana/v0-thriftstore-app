import { ensureCategoriesSeeded } from '@/lib/actions'
import { AppShellWrapper } from '@/components/app-shell-wrapper'

export default async function HomePage() {
  try {
    await ensureCategoriesSeeded()
  } catch (error) {
    console.warn('Could not seed categories:', error)
  }

  return <AppShellWrapper />
}
