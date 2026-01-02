"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { WorkspaceProvider } from "@/contexts/workspace-context"
import { ChatPanel } from "@/components/workspace/chat-panel"
import { CanvasPanel } from "@/components/workspace/canvas-panel"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

import { getBackendUrl } from "@/lib/api-url"

export default function WorkspacePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [projectId, setProjectId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProject = async () => {
            try {
                // Try to get projectId from query param first, then localStorage
                const queryProjectId = searchParams.get('projectId')
                const storedProjectId = localStorage.getItem('currentProjectId')

                if (queryProjectId) {
                    // Use query param
                    setProjectId(queryProjectId)
                    localStorage.setItem('currentProjectId', queryProjectId)
                    router.replace('/workspace', { scroll: false })
                    setIsLoading(false)
                } else if (storedProjectId) {
                    // Use stored project
                    setProjectId(storedProjectId)
                    setIsLoading(false)
                } else {
                    // No project found - fetch user's projects and select first one
                    const backendUrl = getBackendUrl()
                    const response = await fetch(`${backendUrl}/project`, {
                        credentials: 'include',
                    })

                    if (response.ok) {
                        const projects = await response.json()
                        if (projects && projects.length > 0) {
                            // Auto-select first project
                            const firstProject = projects[0]
                            setProjectId(firstProject.id)
                            localStorage.setItem('currentProjectId', firstProject.id)
                            setIsLoading(false)
                        } else {
                            // No projects exist - redirect to home to create one
                            router.push('/')
                        }
                    } else {
                        // Failed to fetch - user might not be authenticated
                        router.push('/')
                    }
                }
            } catch (error) {
                console.error('Failed to load workspace:', error)
                router.push('/')
            }
        }

        loadProject()
    }, [searchParams, router])

    if (isLoading || !projectId) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading workspace...</p>
            </div>
        )
    }

    return (
        <WorkspaceProvider projectId={projectId}>
            <div className="h-full w-full relative">
                {/* X Organizations Black Background with Top Glow */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
                    }}
                />

                {/* Content */}
                <div className="relative z-10 h-full w-full pb-4 px-4 flex flex-col">
                    <div className="flex-1 rounded-xl border bg-background shadow-sm overflow-hidden">
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                                <ChatPanel projectId={projectId} />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={75} className="relative">
                                <CanvasPanel projectId={projectId} />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </div>
            </div>
        </WorkspaceProvider>
    )
}
