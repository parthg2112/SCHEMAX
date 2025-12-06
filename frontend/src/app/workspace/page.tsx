"use client"

import * as React from "react"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ChatPanel } from "@/components/workspace/chat-panel"
import { CanvasPanel } from "@/components/workspace/canvas-panel"
import { Button } from "@/components/ui/button"

export default function WorkspacePage() {
    return (
        <div className="h-screen w-full pt-20 pb-4 px-4 flex flex-col">
            <div className="flex-1 rounded-xl border bg-background shadow-sm overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                        <ChatPanel />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={75} className="relative">
                        <CanvasPanel />
                        <div className="absolute top-4 right-4 z-10">
                            <Button asChild className="shadow-lg">
                                <a href="/code">Generate Schema</a>
                            </Button>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
