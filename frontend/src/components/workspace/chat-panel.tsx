"use client"

import * as React from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

interface ChatPanelProps {
    projectId: string
}

export function ChatPanel({ projectId }: ChatPanelProps) {
    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! Describe your database requirements, and I'll generate a Mermaid ERD for you.",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [streamedContent, setStreamedContent] = React.useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)
        setStreamedContent("")

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
            const response = await fetch(`${backendUrl}/erd/generate?projectId=${projectId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requirements: userMessage.content }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate ERD")
            }

            if (!response.body) return

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false
            let accumulatedContent = ""

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)
                accumulatedContent += chunkValue
                setStreamedContent((prev) => prev + chunkValue)
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: accumulatedContent,
                    timestamp: new Date(),
                },
            ])
            setStreamedContent("")
        } catch (error) {
            console.error(error)
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, something went wrong while generating the ERD.",
                    timestamp: new Date(),
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

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
                {isLoading && streamedContent && (
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
                {isLoading && !streamedContent && (
                    <div className="flex w-full gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t p-4">
                <form
                    className="flex gap-2"
                    onSubmit={handleSubmit}
                >
                    <Input
                        placeholder="Describe your database..."
                        className="flex-1"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}
