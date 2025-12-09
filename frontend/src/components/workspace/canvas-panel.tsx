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
    const {
        erdData,
        canvasNodes,
        setCanvasNodes,
        canvasEdges,
        setCanvasEdges,
        addEntity,
        currentHash,
        lastGeneratedHash,
        setLastGeneratedHash
    } = useWorkspace()
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [ormType, setOrmType] = React.useState<"prisma" | "drizzle" | "sql">("prisma")
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
        // If state hasn't changed, just view code
        if (currentHash === lastGeneratedHash && lastGeneratedHash !== "") {
            router.push(`/code?projectId=${projectId}`)
            return
        }

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
                    image: "",
                    prompt: `Generate a ${ormType} schema for these entities: ${JSON.stringify(entities)}`,
                    history: [],
                    ormType
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

            // Update last generated hash
            setLastGeneratedHash(currentHash)

            router.push(`/code?projectId=${projectId}`)
        } catch (error) {
            console.error("Generation error:", error)
            alert("Failed to generate schema")
            setIsGenerating(false)
        }
    }

    const isUpToDate = currentHash === lastGeneratedHash && lastGeneratedHash !== ""

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
                <Panel position="top-right" className="m-4 flex gap-2">
                    <div className="flex items-center shadow-lg rounded-md overflow-hidden border border-transparent dark:border-gray-300">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || (canvasNodes.length === 0 && !isUpToDate)}
                            className="rounded-none rounded-l-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border-r border-white/20 dark:border-gray-300/20 disabled:opacity-50 px-4"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : isUpToDate ? (
                                "View Code"
                            ) : (
                                "Generate Schema"
                            )}
                        </Button>
                        <div className="relative group">
                            <Button
                                className="rounded-none rounded-r-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-2"
                                disabled={isGenerating}
                            >
                                <span className="sr-only">Select ORM</span>
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Button>
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-50">
                                <div className="py-1">
                                    {["prisma", "drizzle", "sql"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setOrmType(type as any)}
                                            className={`block w-full text-left px-4 py-2 text-sm ${ormType === type
                                                    ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-medium"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}
