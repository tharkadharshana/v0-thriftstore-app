'use client'

import dynamic from 'next/dynamic'

const AppShell = dynamic(
  () => import('@/components/app-shell').then((mod) => mod.AppShell),
  { ssr: false },
)

export function AppShellWrapper() {
  return <AppShell />
}