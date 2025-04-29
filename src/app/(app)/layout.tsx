import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Ask and Learn New Languages',
  title: 'Ask and Learn New Languages | Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
