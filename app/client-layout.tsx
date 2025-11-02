"use client"

import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase/client';
import { TopBar } from "@/components/top-bar"
import { Sidebar } from "@/components/sidebar"
import { ChatBot } from "@/components/chat-bot"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const getUser = async () => {
        try{

            const { data: { session } } = await supabase.auth.getSession();
            console.log(session)

            if(!session){
                setUserId(null)
                console.log(' no... ',userId)
            }else{
                setUserId(" :) ")
                console.log(' ok... ',session)
            }
        }catch(eror){
            console.log('something was wrong!! ', error)
        }
        }

        getUser()
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
        {userId ? <TopBar /> : null}
        <div className="flex flex-1">
        {userId ? <Sidebar /> : null}
        <main className="flex-1 overflow-auto md:pl-[220px] pt-1">
        <div className="container py-4 px-6 max-w-full">{children}</div>
        </main>
        </div>
        <ChatBot />
        </div>
    )
}
