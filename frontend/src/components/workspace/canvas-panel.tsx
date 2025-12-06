"use client"

import * as React from "react"
import { Tldraw, useEditor } from "tldraw"
import "tldraw/tldraw.css"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CanvasPanelProps {
    projectId: string
}

function GenerateButton({ projectId }: { projectId: string }) {
    const editor = useEditor()
    const [isGenerating, setIsGenerating] = React.useState(false)
    const router = useRouter()

    const handleGenerate = async () => {
        if (isGenerating) return
        setIsGenerating(true)

        try {
            // 1. Get SVG from editor
            const shapeIds = editor.getCurrentPageShapeIds()
            if (shapeIds.size === 0) {
                alert("Please draw something first!")
                setIsGenerating(false)
                return
            }

            const svg = await (editor as any).getSvg([...shapeIds], {
                background: true,
                padding: 10,
            })

            if (!svg) {
                throw new Error("Could not generate SVG")
            }

            // 2. Convert SVG to PNG Base64
            const svgString = new XMLSerializer().serializeToString(svg)
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
            const url = URL.createObjectURL(svgBlob)

            const img = new Image()
            img.src = url

            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
            })

            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("2d")
            if (!ctx) throw new Error("Could not get canvas context")

            ctx.drawImage(img, 0, 0)
            const base64data = canvas.toDataURL("image/png").split(",")[1]
            URL.revokeObjectURL(url)

            // 3. Call backend
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

            const response = await fetch(`${backendUrl}/prisma/generate?projectId=${projectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: base64data,
                    prompt: "Generate a Prisma schema for this ERD.",
                    history: []
                })
            })

            if (!response.ok) throw new Error("Generation failed")

            // Read the stream to ensure it finishes
            const reader = response.body?.getReader()
            if (reader) {
                while (true) {
                    const { done } = await reader.read()
                    if (done) break
                }
            }

            // 4. Redirect
            router.push(`/code?projectId=${projectId}`)

        } catch (error) {
            console.error("Generation error:", error)
            alert("Failed to generate schema")
            setIsGenerating(false)
        }
    }

    return (
        <div className="absolute top-4 right-4 z-[99999] pointer-events-auto">
            <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="shadow-lg"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    "Generate Schema"
                )}
            </Button>
        </div>
    )
}

export function CanvasPanel({ projectId }: CanvasPanelProps) {
    const { theme } = useTheme()

    return (
        <div className="h-full w-full relative bg-background">
            <div className="absolute inset-0">
                <Tldraw
                    persistenceKey={`ablelove-canvas-${projectId}`}
                    options={{ maxPages: 1 }}
                >
                    <GenerateButton projectId={projectId} />
                </Tldraw>
            </div>
        </div>
    )
}
