"use client"

import * as React from "react"
import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useWorkspaces } from "@/hooks/use-workspaces"
import { WorkspaceProvider } from "@/contexts/workspace-context"
import { ChatPanel } from "@/components/workspace/chat-panel"
import { CanvasPanel } from "@/components/workspace/canvas-panel"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"



export default function WorkspacePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { projects, isLoading } = useWorkspaces()
    const projectId = searchParams.get('projectId')

    useEffect(() => {
        if (isLoading) return

        if (!projectId) {
            if (projects.length > 0) {
                router.replace(`/workspace?projectId=${projects[0].id}`)
            } else {
                router.push('/')
            }
        }
    }, [projectId, projects, isLoading, router])

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
