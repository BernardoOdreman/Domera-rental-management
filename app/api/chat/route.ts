import { NextResponse } from "next/server"
import OpenAI from "openai"
import { findBestMockResponse } from "./mock-responses"

// Use Node.js runtime to ensure server-side execution
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json().catch(() => ({}))
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        message: findBestMockResponse(""),
      })
    }

    // Extract the latest user message
    const latestUserMessage = messages.filter((msg) => msg.role === "user").pop()?.content || ""

    // Initialize OpenAI client only when needed (inside the POST handler)
    // This avoids the browser-like environment error
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })

        // Add system message if not present
        if (!messages.some((msg) => msg.role === "system")) {
          messages.unshift({
            role: "system",
            content:
              "You are a helpful property management assistant. Provide concise and accurate information about property management, tenant relations, maintenance, and real estate investment. Be professional.",
          })
        }

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.2,
          max_tokens: 500,
        })

        return NextResponse.json({
          message: response.choices[0].message.content,
          source: "openai",
        })
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError)
        // Fall through to the mock response
      }
    }

    // If OpenAI fails or is not available, return a generic response
    return NextResponse.json({
      message:
        "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact support for assistance.",
      source: "fallback",
    })
  } catch (error) {
    console.error("General API error:", error)
    return NextResponse.json({
      message: "I apologize, but I encountered an error processing your request. Please try again.",
      error: "An unexpected error occurred",
    })
  }
}
