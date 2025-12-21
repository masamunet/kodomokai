import * as React from "react"

interface AppRootLayoutProps {
  children: React.ReactNode
  fonts: string
}

export function AppRootLayout({ children, fonts }: AppRootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${fonts} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
