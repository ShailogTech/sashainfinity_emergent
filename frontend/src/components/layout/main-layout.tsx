import * as React from "react"
import { useLocation } from "react-router-dom"
import PublicHeader from "@/components/public/PublicHeader"
import PublicFooter from "@/components/public/PublicFooter"
interface MainLayoutProps {
  children: React.ReactNode
}
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isHome = location.pathname === "/"
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      <main className={`flex-1 ${isHome ? "" : "pt-16 lg:pt-20"}`}>
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
