"use client"

import { useLandlord } from '@/context/user-context'
import { TopBar } from "@/components/top-bar"
import { Sidebar } from "@/components/sidebar"
import { ChatBot } from "@/components/chat-bot"

export const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useLandlord()
  
  return (
    <>
      {isAuthenticated ? (
        <>
          <TopBar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 overflow-auto md:pl-[220px] pt-1">
              <div className="container py-4 px-6 max-w-full">{children}</div>
            </main>
          </div>
          <ChatBot /> {/* ChatBot ahora dentro del layout autenticado */}
        </>
      ) : (
        <main className="flex-1 overflow-auto">
          <div className="container py-4 px-6 max-w-full">{children}</div>
        </main>
      )}
    </>
  )
}