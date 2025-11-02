import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body

    // Return a generic response
    return NextResponse.json({
      message:
        "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact support for assistance.",
      source: "mock",
    })
  } catch (error) {
    console.error("Error in mock chat API:", error)
    return NextResponse.json({
      message: "I apologize, but I encountered an error processing your request. Please try again.",
    })
  }
}
