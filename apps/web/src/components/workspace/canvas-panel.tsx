"use client"

import * as React from "react"
import { ReactFlow, Background, Controls, MiniMap, Panel, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from "@/components/ui/button"
import { Loader2, Plus, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/contexts/workspace-context"
import { ERDEntityNode } from "@/components/nodes/ERDEntityNode"
import CustomEdge from "@/components/edges/CustomEdge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { getBackendUrl } from "@/lib/api-url"

interface CanvasPanelProps {
    projectId: string
}

const nodeTypes = {
    erdEntity: ERDEntityNode as any,
}

const edgeTypes = {
    custom: CustomEdge,
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
        setLastGeneratedHash,
        undo,
        redo,
        addToHistory,
        updateEdge
    } = useWorkspace()
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [ormType, setOrmType] = React.useState<"prisma" | "drizzle" | "sql">("prisma")
    const router = useRouter()

    // Edge Editing State
    const [editingEdge, setEditingEdge] = React.useState<Edge | null>(null)
    const [edgeLabel, setEdgeLabel] = React.useState("")
    const [cardinalitySource, setCardinalitySource] = React.useState("")
    const [cardinalityTarget, setCardinalityTarget] = React.useState("")

    // Keyboard Shortcuts for Undo/Redo
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) {
                    e.preventDefault()
                    redo()
                } else {
                    e.preventDefault()
                    undo()
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault()
                redo()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    const onNodesChange = React.useCallback(
        (changes: NodeChange[]) => setCanvasNodes(applyNodeChanges(changes, canvasNodes)),
        [canvasNodes, setCanvasNodes]
    )

    const onEdgesChange = React.useCallback(
        (changes: EdgeChange[]) => setCanvasEdges(applyEdgeChanges(changes, canvasEdges)),
        [canvasEdges, setCanvasEdges]
    )

    const onConnect = React.useCallback(
        (params: Connection) => {
            addToHistory()
            setCanvasEdges(addEdge({ ...params, type: 'custom', animated: false }, canvasEdges))
        },
        [canvasEdges, setCanvasEdges, addToHistory]
    )

    const onNodeDragStart = React.useCallback(() => {
        addToHistory()
    }, [addToHistory])

    const onEdgeClick = React.useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation()
        setEditingEdge(edge)
        setEdgeLabel((edge.data?.label as string) || "")
        setCardinalitySource((edge.data?.cardinalitySource as string) || "")
        setCardinalityTarget((edge.data?.cardinalityTarget as string) || "")
    }, [])

    const handleSaveEdge = () => {
        if (editingEdge) {
            updateEdge(editingEdge.id, {
                label: edgeLabel,
                cardinalitySource,
                cardinalityTarget
            })
            setEditingEdge(null)
        }
    }

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

            const backendUrl = getBackendUrl()

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
                onNodeDragStart={onNodeDragStart}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
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
                    <div className="flex items-center shadow-sm rounded-full bg-background border border-border overflow-hidden transition-all duration-200 hover:shadow-md">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || (canvasNodes.length === 0 && !isUpToDate)}
                            variant="ghost"
                            className="rounded-none rounded-l-full px-4 h-9 hover:bg-accent/50 disabled:opacity-50 font-medium"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                                    <span className="text-muted-foreground">Generating...</span>
                                </>
                            ) : isUpToDate ? (
                                "View Code"
                            ) : (
                                "Generate Schema"
                            )}
                        </Button>
                        <div className="w-[1px] h-4 bg-border" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="rounded-none rounded-r-full px-2 h-9 hover:bg-accent/50"
                                    disabled={isGenerating}
                                >
                                    <span className="sr-only">Select ORM</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                                {["prisma", "drizzle", "sql"].map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => setOrmType(type as any)}
                                        className={ormType === type ? "bg-accent" : ""}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Panel>
            </ReactFlow>

            <Dialog open={!!editingEdge} onOpenChange={(open) => !open && setEditingEdge(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Relationship</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={edgeLabel}
                                onChange={(e) => setEdgeLabel(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. has, belongs to"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="source" className="text-right">
                                Source
                            </Label>
                            <Select value={cardinalitySource} onValueChange={setCardinalitySource}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select cardinality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="0..1">0..1</SelectItem>
                                    <SelectItem value="1..n">1..n</SelectItem>
                                    <SelectItem value="0..n">0..n</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="target" className="text-right">
                                Target
                            </Label>
                            <Select value={cardinalityTarget} onValueChange={setCardinalityTarget}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select cardinality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="0..1">0..1</SelectItem>
                                    <SelectItem value="1..n">1..n</SelectItem>
                                    <SelectItem value="0..n">0..n</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveEdge}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
