"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export function ChatPanel() {
    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: "1",
            role: "user",
            content: "Can you help me design an ER diagram for an e-commerce database?",
            timestamp: new Date(Date.now() - 10000),
        },
        {
            id: "2",
            role: "assistant",
            content: "I'd be happy to help! An e-commerce database typically needs tables for Users, Products, Orders, and OrderItems. Would you like me to generate a Mermaid diagram for this schema?",
            timestamp: new Date(Date.now() - 8000),
        },
        {
            id: "3",
            role: "user",
            content: "Yes, please include the relationships.",
            timestamp: new Date(Date.now() - 5000),
        },
    ])
    const [isTyping, setIsTyping] = React.useState(true)
    const [streamedContent, setStreamedContent] = React.useState("")
    const fullResponse = `Here is a sample ER diagram for your e-commerce system:

\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER {
        string id
        string email
        string password_hash
    }
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        string id
        string user_id
        string status
        datetime created_at
    }
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    PRODUCT {
        string id
        string name
        float price
        int stock
    }
    ORDER_ITEM {
        string id
        string order_id
        string product_id
        int quantity
        float price_at_purchase
    }
\`\`\`

You can use the canvas on the right to refine this diagram further.`

    React.useEffect(() => {
        if (!isTyping) return

        let currentIndex = 0
        const interval = setInterval(() => {
            if (currentIndex < fullResponse.length) {
                setStreamedContent((prev) => prev + fullResponse[currentIndex])
                currentIndex++
            } else {
                setIsTyping(false)
                clearInterval(interval)
                setMessages((prev) => [
                    ...prev,
                    {
                        id: "4",
                        role: "assistant",
                        content: fullResponse,
                        timestamp: new Date(),
                    },
                ])
            }
        }, 20) // Typing speed

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex h-full flex-col bg-background border-r">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex w-full gap-3",
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div
                            className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                                message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}
                        >
                            {message.role === "assistant" ? (
                                <Bot className="h-4 w-4" />
                            ) : (
                                <User className="h-4 w-4" />
                            )}
                        </div>
                        <div
                            className={cn(
                                "flex max-w-[80%] flex-col gap-1 rounded-lg px-4 py-2 text-sm",
                                message.role === "assistant"
                                    ? "bg-muted text-foreground"
                                    : "bg-primary text-primary-foreground"
                            )}
                        >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <span className="text-[10px] opacity-50">
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex w-full gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex max-w-[80%] flex-col gap-1 rounded-lg bg-muted px-4 py-2 text-sm text-foreground">
                            <div className="whitespace-pre-wrap">{streamedContent}</div>
                            <span className="animate-pulse">▍</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t p-4">
                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        // Handle submit
                    }}
                >
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}
