import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StayFlow',
    short_name: 'StayFlow',
    description: 'Personal productivity dashboard',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
