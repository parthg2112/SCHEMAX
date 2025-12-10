"use client"

import * as React from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/contexts/workspace-context"
import { ShimmeringText } from "@/components/ui/shadcn-io/shimmering-text"

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
    const { setErdData, setCanvasNodes, setCanvasEdges } = useWorkspace()
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
    const [isLoadingMessages, setIsLoadingMessages] = React.useState(true)

    // Rate limit tracking
    const [messageUsage, setMessageUsage] = React.useState<{
        used: number
        limit: number
        remaining: number
        tier: 'free' | 'pro'
    } | null>(null)
    const [isLimitExceeded, setIsLimitExceeded] = React.useState(false)

    // Load messages and usage on mount
    React.useEffect(() => {
        const loadMessages = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                const res = await fetch(`${backendUrl}/project/${projectId}`, {
                    credentials: 'include',
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.project?.messages && data.project.messages.length > 0) {
                        const loadedMessages = data.project.messages.map((msg: any) => ({
                            id: msg.id,
                            role: msg.role as "user" | "assistant",
                            content: msg.content,
                            timestamp: new Date(msg.createdAt),
                        }))
                        setMessages(loadedMessages)
                    }
                }
            } catch (error) {
                console.error("Failed to load messages:", error)
            } finally {
                setIsLoadingMessages(false)
            }
        }

        // Reset to default state before loading new project data
        const defaultMessage: Message = {
            id: "1",
            role: "assistant",
            content: "Hello! Describe your database requirements, and I'll generate a Mermaid ERD for you.",
            timestamp: new Date(),
        }
        setMessages([defaultMessage])

        loadMessages()
    }, [projectId])

    // Save messages when they change (debounced)
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (!isLoadingMessages) {
                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                    await fetch(`${backendUrl}/project/${projectId}/messages`, {
                        method: "POST",
                        credentials: 'include',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ messages }),
                    })
                } catch (error) {
                    console.error("Failed to save messages:", error)
                }
            }
        }, 1000)
        return () => clearTimeout(timer)
    }, [messages, projectId, isLoadingMessages])

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
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requirements: userMessage.content }),
            })

            if (!response.ok) {
                // Check if it's a rate limit error
                if (response.status === 429) {
                    const errorData = await response.json()
                    setIsLimitExceeded(true)
                    setMessageUsage({
                        used: errorData.used || 0,
                        limit: errorData.limit || 10,
                        remaining: 0,
                        tier: errorData.tier || 'free'
                    })
                    throw new Error(errorData.error || "Daily message limit exceeded")
                }
                throw new Error("Failed to generate ERD")
            }

            // Extract usage info from response headers or body
            const usageHeader = response.headers.get('X-Message-Usage')
            if (usageHeader) {
                try {
                    const usage = JSON.parse(usageHeader)
                    setMessageUsage(usage)
                    setIsLimitExceeded(usage.remaining <= 0)
                } catch (e) {
                    console.error('Failed to parse usage header:', e)
                }
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

                // Process SSE chunks
                const lines = chunkValue.split('\n')
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6)
                            if (jsonStr === '[DONE]') continue

                            const data = JSON.parse(jsonStr)

                            if (data.type === 'error') {
                                throw new Error(data.error)
                            }

                            if (data.type === 'text-delta' && data.delta) {
                                accumulatedContent += data.delta
                                setStreamedContent((prev) => prev + data.delta)
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e)
                        }
                    }
                }
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

            // Parse Mermaid and emit to canvas
            try {
                const { parseMermaidERD } = await import("@/lib/mermaid-parser")
                const { convertERDToFlow } = await import("@/lib/erd-to-flow")

                const erdData = parseMermaidERD(accumulatedContent)
                setErdData(erdData)

                // Convert to nodes/edges and update context
                const { nodes, edges } = convertERDToFlow(erdData)
                setCanvasNodes(nodes)
                setCanvasEdges(edges)
            } catch (parseError) {
                console.error("Failed to parse ERD:", parseError)
            }
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
                            <ShimmeringText text="Thinking..." className="text-sm font-medium" />
                        </div>
                    </div>
                )}
            </div>

            {/* Message Usage Counter */}
            {messageUsage && (
                <div className="px-4 py-2 border-t bg-muted/30">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            Messages: <span className="font-medium text-foreground">{messageUsage.used}/{messageUsage.limit}</span>
                        </span>
                        <span className={`font-medium ${messageUsage.remaining <= 2 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {messageUsage.remaining} remaining
                        </span>
                    </div>
                </div>
            )}

            {/* Limit Exceeded Warning */}
            {isLimitExceeded && messageUsage && (
                <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/20 border-t border-orange-200 dark:border-orange-900">
                    <div className="text-sm">
                        <p className="font-medium text-orange-900 dark:text-orange-200 mb-1">
                            🚫 Daily limit reached
                        </p>
                        <p className="text-orange-700 dark:text-orange-300 text-xs mb-2">
                            You've used all {messageUsage.limit} messages for today. Upgrade to Pro for 100+ messages/day!
                        </p>
                        <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            onClick={() => window.dispatchEvent(new CustomEvent('openPricing'))}
                        >
                            Upgrade to Pro
                        </Button>
                    </div>
                </div>
            )}

            <div className="border-t p-4">
                <form
                    className="flex gap-2"
                    onSubmit={handleSubmit}
                >
                    <Input
                        placeholder={isLimitExceeded ? "Daily limit reached - upgrade to continue" : "Describe your database..."}
                        className="flex-1 backdrop-blur-sm rounded-full border-gray-300 dark:border-[#333] bg-white/50 dark:bg-[#1f1f1f57] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-white/30"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || isLimitExceeded}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim() || isLimitExceeded}
                        className="rounded-full h-10 w-10 backdrop-blur-sm border border-gray-300 dark:border-[#333] bg-white/50 dark:bg-[#1f1f1f57] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}
