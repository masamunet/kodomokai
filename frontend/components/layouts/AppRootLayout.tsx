import * as React from "react"
import NextTopLoader from 'nextjs-toploader';

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
        <NextTopLoader
          showSpinner={false}
          template='<div class="bar" role="bar"><div class="peg"></div></div>'
          zIndex={1600}
        />
        {children}
      </body>
    </html>
  )
}
