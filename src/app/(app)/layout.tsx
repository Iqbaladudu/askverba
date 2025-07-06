import React from 'react'
import './styles.css'
import ReactQueryWrapper from '@/components/ReactQueryWrapper'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'

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
