'use client'

import dynamic from 'next/dynamic'

const AppShell = dynamic(() => import('@/components/app-shell'), { ssr: false })

export function AppShellWrapper() {
  return <AppShell />
}