"use client"

import * as React from "react"
import { ReactFlow, Background, Controls, MiniMap, Panel, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"
import { ERDEntityNode } from "@/components/nodes/ERDEntityNode"


interface CanvasPanelProps {
    projectId: string
}

const nodeTypes = {
    erdEntity: ERDEntityNode as any, // Type assertion to fix React Flow node type strictness
}

export function CanvasPanel({ projectId }: CanvasPanelProps) {
    const { erdData, canvasNodes, setCanvasNodes, canvasEdges, setCanvasEdges, addEntity } = useWorkspace()
    const [isGenerating, setIsGenerating] = React.useState(false)
    const router = useRouter()

    const onNodesChange = React.useCallback(
        (changes: NodeChange[]) => setCanvasNodes(applyNodeChanges(changes, canvasNodes)),
        [canvasNodes, setCanvasNodes]
    )

    const onEdgesChange = React.useCallback(
        (changes: EdgeChange[]) => setCanvasEdges(applyEdgeChanges(changes, canvasEdges)),
        [canvasEdges, setCanvasEdges]
    )

    const onConnect = React.useCallback(
        (params: Connection) => setCanvasEdges(addEdge({ ...params, type: 'smoothstep', animated: false }, canvasEdges)),
        [canvasEdges, setCanvasEdges]
    )

    const handleAddEntity = () => {
        const newEntity = {
            name: `Entity_${canvasNodes.length + 1}`,
            attributes: [
                { name: 'id', type: 'int', key: 'PK' as const }
            ]
        }
        addEntity(newEntity)
    }

    const handleGenerate = async () => {
        if (isGenerating || canvasNodes.length === 0) return
        setIsGenerating(true)

        try {
            // Convert nodes back to ERD structure
            const entities = canvasNodes.map(node => ({
                name: node.data.label,
                attributes: node.data.attributes
            }))

            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

            const response = await fetch(`${backendUrl}/prisma/generate?projectId=${projectId}`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: "", // We'll improve this later
                    prompt: `Generate a Prisma schema for these entities: ${JSON.stringify(entities)}`,
                    history: []
                })
            })

            if (!response.ok) throw new Error("Generation failed")

            const reader = response.body?.getReader()
            if (reader) {
                while (true) {
                    const { done } = await reader.read()
                    if (done) break
                }
            }

            router.push(`/code?projectId=${projectId}`)
        } catch (error) {
            console.error("Generation error:", error)
            alert("Failed to generate schema")
            setIsGenerating(false)
        }
    }

    return (
        <div className="h-full w-full bg-background">
            <ReactFlow
                nodes={canvasNodes}
                edges={canvasEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50 dark:bg-gray-900"
                style={{
                    '--xy-controls-button-background-color': 'white',
                    '--xy-controls-button-background-color-hover': '#f3f4f6',
                    '--xy-controls-button-color': '#1f2937',
                } as React.CSSProperties}
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-left" className="m-4">
                    <Button
                        onClick={handleAddEntity}
                        variant="default"
                        size="sm"
                        className="shadow-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border border-transparent dark:border-gray-300"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Entity
                    </Button>
                </Panel>
                <Panel position="top-right" className="m-4">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || canvasNodes.length === 0}
                        className="shadow-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border border-transparent dark:border-gray-300 disabled:opacity-50"
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
                </Panel>
            </ReactFlow>
        </div>
    )
}
