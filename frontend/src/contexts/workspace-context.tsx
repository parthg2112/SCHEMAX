"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { ParsedERD, Entity } from '@/lib/mermaid-parser'
import { Node, Edge } from '@xyflow/react'
import { useSearchParams } from 'next/navigation'

interface WorkspaceContextType {
    erdData: ParsedERD | null
    setErdData: (data: ParsedERD | null) => void
    canvasNodes: Node[]
    setCanvasNodes: (nodes: Node[]) => void
    canvasEdges: Edge[]
    setCanvasEdges: (edges: Edge[]) => void
    updateEntityInNodes: (entityName: string, updatedEntity: Entity) => void
    addEntity: (entity: Entity) => void
    removeEntity: (entityName: string) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId") || ""
    const [erdData, setErdData] = useState<ParsedERD | null>(null)
    const [canvasNodes, setCanvasNodes] = useState<Node[]>([])
    const [canvasEdges, setCanvasEdges] = useState<Edge[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load workspace data on mount
    useEffect(() => {
        if (!projectId) return

        const loadWorkspace = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                const res = await fetch(`${backendUrl}/project/${projectId}`, {
                    credentials: 'include',
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.project?.erdData) {
                        setErdData(data.project.erdData)
                    }
                    if (data.project?.canvasData) {
                        const canvasData = data.project.canvasData
                        if (canvasData.nodes) setCanvasNodes(canvasData.nodes)
                        if (canvasData.edges) setCanvasEdges(canvasData.edges)
                    }
                }
            } catch (error) {
                console.error("Failed to load workspace:", error)
            } finally {
                setIsLoaded(true)
            }
        }
        loadWorkspace()
    }, [projectId])

    // Auto-save workspace data when it changes (debounced)
    useEffect(() => {
        if (!projectId || !isLoaded) return

        const timer = setTimeout(async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                await fetch(`${backendUrl}/project/${projectId}`, {
                    method: "PUT",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        erdData,
                        canvasData: { nodes: canvasNodes, edges: canvasEdges }
                    }),
                })
            } catch (error) {
                console.error("Failed to save workspace:", error)
            }
        }, 1000) // Debounce for 1 second

        return () => clearTimeout(timer)
    }, [erdData, canvasNodes, canvasEdges, projectId, isLoaded])

    const updateEntityInNodes = useCallback((entityName: string, updatedEntity: Entity) => {
        setCanvasNodes(nodes =>
            nodes.map(node =>
                node.id === entityName
                    ? { ...node, data: { ...node.data, label: updatedEntity.name, attributes: updatedEntity.attributes } }
                    : node
            )
        )
    }, [])

    const addEntity = useCallback((entity: Entity) => {
        const newNode: Node = {
            id: entity.name,
            type: 'erdEntity',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label: entity.name,
                attributes: entity.attributes,
            },
        }
        setCanvasNodes(nodes => [...nodes, newNode])
    }, [])

    const removeEntity = useCallback((entityName: string) => {
        setCanvasNodes(nodes => nodes.filter(node => node.id !== entityName))
        setCanvasEdges(edges => edges.filter(edge => edge.source !== entityName && edge.target !== entityName))
    }, [])

    return (
        <WorkspaceContext.Provider value={{
            erdData,
            setErdData,
            canvasNodes,
            setCanvasNodes,
            canvasEdges,
            setCanvasEdges,
            updateEntityInNodes,
            addEntity,
            removeEntity,
        }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error('useWorkspace must be used within WorkspaceProvider')
    }
    return context
}
