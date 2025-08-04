import React from 'react'
import './styles.css'
import { ReactQueryWrapper, AuthProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
export const metadata = {
  description: 'Ask and Learn New Languages',
  title: 'AskVerba | Ask and Learn New Languages',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <SpeedInsights />
        <Analytics />
        <ReactQueryWrapper>
          <AuthProvider>
            <main>{children}</main>
            <Toaster />
          </AuthProvider>
        </ReactQueryWrapper>
      </body>
    </html>
  )
}
