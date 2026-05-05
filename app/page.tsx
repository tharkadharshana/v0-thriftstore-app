import { AppShell } from '@/components/app-shell'
import { ensureCategoriesSeeded } from '@/lib/actions'

export default async function HomePage() {
  await ensureCategoriesSeeded()
  return <AppShell />
}
