import React from 'react'
import './styles.css'
import { ReactQueryWrapper, AuthProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  description: 'Ask and Learn New Languages',
  title: 'Ask and Learn New Languages | Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
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
