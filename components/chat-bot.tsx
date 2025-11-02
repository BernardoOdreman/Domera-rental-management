"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X, Loader2, AlertCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePropertyContext } from "@/context/property-context"
import { useTheme } from "@/context/theme-context"

// Define message type
type Message = {
  role: "user" | "assistant" | "system" | "error"
  content: string
  timestamp: Date
}

export function ChatBot() {
  // Safely access context or use default values
  const context = usePropertyContext()
  let unreadMessages = 0

  if (context) {
    unreadMessages = context.unreadMessages
  }

  const { isDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hi there! 👋 I'm your property management assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Listen for toggle-chat events from the top bar
  useEffect(() => {
    const handleToggleChat = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail && customEvent.detail.open !== undefined) {
        setIsOpen(customEvent.detail.open)
      } else {
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener("toggle-chat", handleToggleChat)
    return () => {
      window.removeEventListener("toggle-chat", handleToggleChat)
    }
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Prepare messages for API
      const apiMessages = messages
        .filter((msg) => msg.role !== "error")
        .concat(userMessage)
        .map(({ role, content }) => ({ role, content }))

      // Set a timeout for the API request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`)
      }

      // Parse the response
      const data = await response.json()

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message || "I'm sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)

      // Add a more helpful error message based on the type of error
      let errorMessage = "I'm having trouble connecting right now. Please try again in a moment."

      if (error instanceof DOMException && error.name === "AbortError") {
        errorMessage = "The request took too long to respond. Please try again or check your connection."
      } else if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        }
      }

      // Add assistant message with error
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: errorMessage,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Add this function after the other handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }

  // Update the ChatBot styling
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-xl border border-border/10 animate-in slide-in-from-right-10 duration-300 rounded-xl overflow-hidden chat-card">
          <CardHeader className="p-4 border-b border-border/10 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">Property Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-lg p-3 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : message.role === "assistant"
                      ? "bg-card shadow-sm border border-border/10"
                      : message.role === "error"
                        ? "bg-destructive/10 text-destructive w-full max-w-full"
                        : "bg-muted/50 italic text-muted-foreground w-full max-w-full text-xs",
                )}
              >
                {message.role === "error" && (
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="font-medium">Error</span>
                  </div>
                )}
                {message.content}
                <span className="text-[10px] opacity-70 mt-1 ml-auto">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col max-w-[80%] rounded-lg p-3 text-sm bg-card shadow-sm border border-border/10">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-3 pt-0">
            <div className="flex w-full items-center gap-2">
              <Textarea
                ref={(el) => {
                  textareaRef.current = el
                  if (inputRef.current) inputRef.current = el
                }}
                placeholder="Type your message..."
                className="min-h-9 resize-none bg-card/50 border-border/10"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={1000}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
              isHovered ? "opacity-100 scale-110" : "opacity-70 hover:opacity-100",
            )}
            onClick={() => setIsOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Open chat</span>
          </Button>
          {isHovered && (
            <div className="absolute bottom-full mb-2 right-0 bg-card border border-border/10 rounded-md px-2 py-1 text-sm shadow-md animate-in fade-in duration-200">
              Chat with Assistant
            </div>
          )}
        </div>
      )}
    </div>
  )
}
