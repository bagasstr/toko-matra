'use client'

import dynamic from 'next/dynamic'

// Load ClientSideComponents only on client to keep server bundle light
const ClientSideComponents = dynamic(() => import('./ClientSideComponents'), {
  ssr: false,
  // Loading fallback null karena skeleton tiap bagian sudah ada di dalam
  loading: () => null,
})

export default function ClientComponentsWrapper() {
  return <ClientSideComponents />
}
