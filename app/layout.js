import '../styles/globals.css'
import Providers from './providers'

export const metadata = {
  title: 'Scribbly - Notes & Sketches',
  description: 'Take notes and create sketches in one place',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png' }]
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
