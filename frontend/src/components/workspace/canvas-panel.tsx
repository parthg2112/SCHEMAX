"use client"

import * as React from "react"
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Panel, Connection, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"
import { ERDEntityNode } from "@/components/nodes/ERDEntityNode"
import { convertERDToFlow } from "@/lib/erd-to-flow"

interface CanvasPanelProps {
    projectId: string
}

const nodeTypes = {
    erdEntity: ERDEntityNode as any, // Type assertion to fix React Flow node type strictness
}

export function CanvasPanel({ projectId }: CanvasPanelProps) {
    const { erdData, canvasNodes, setCanvasNodes, canvasEdges, setCanvasEdges, addEntity } = useWorkspace()
    const [nodes, setNodes, onNodesChange] = useNodesState(canvasNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(canvasEdges)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const router = useRouter()

    // Sync with workspace context
    React.useEffect(() => {
        setNodes(canvasNodes)
    }, [canvasNodes, setNodes])

    React.useEffect(() => {
        setEdges(canvasEdges)
    }, [canvasEdges, setEdges])

    // Update context when local state changes
    React.useEffect(() => {
        setCanvasNodes(nodes)
    }, [nodes, setCanvasNodes])

    React.useEffect(() => {
        setCanvasEdges(edges)
    }, [edges, setCanvasEdges])

    // Update nodes when ERD data changes
    React.useEffect(() => {
        if (erdData) {
            const flowData = convertERDToFlow(erdData)
            setNodes(flowData.nodes)
            setEdges(flowData.edges)
        }
    }, [erdData, setNodes, setEdges])

    const onConnect = React.useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: false }, eds)),
        [setEdges]
    )

    const handleAddEntity = () => {
        const newEntity = {
            name: `Entity_${nodes.length + 1}`,
            attributes: [
                { name: 'id', type: 'int', key: 'PK' as const }
            ]
        }
        addEntity(newEntity)
    }

    const handleGenerate = async () => {
        if (isGenerating || nodes.length === 0) return
        setIsGenerating(true)

        try {
            // Convert nodes back to ERD structure
            const entities = nodes.map(node => ({
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
                nodes={nodes}
                edges={edges}
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
                        className="shadow-lg bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Entity
                    </Button>
                </Panel>
                <Panel position="top-right" className="m-4">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || nodes.length === 0}
                        className="shadow-lg bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 disabled:opacity-50"
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
