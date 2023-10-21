"use client"
import { ThemeProvider } from '@/Store/themeContext'
import { AccountAbstractionProvider } from '@/Store/accountAbstractionContext'

const Providers = ({ children }: { children: JSX.Element }) => {
  return (
    <ThemeProvider>
      <AccountAbstractionProvider>{children}</AccountAbstractionProvider>
    </ThemeProvider>
  )
}

export default Providers