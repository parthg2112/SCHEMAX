"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ChatPanel } from "@/components/workspace/chat-panel"
import { CanvasPanel } from "@/components/workspace/canvas-panel"
import { WorkspaceProvider } from "@/contexts/workspace-context"

import { CanvasLoader } from "@/components/canvas-loader"

export default function WorkspacePage() {
    return (
        <React.Suspense fallback={<CanvasLoader />}>
            <WorkspacePageContent />
        </React.Suspense>
    )
}

function WorkspacePageContent() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId") || ""
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <CanvasLoader />
    }

    if (!projectId) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <p>No Project ID found. Please go back to dashboard.</p>
            </div>
        )
    }

    return (
        <WorkspaceProvider>
            <div className="h-screen w-full pt-16 pb-4 px-4 flex flex-col">
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
        </WorkspaceProvider>
    )
}
