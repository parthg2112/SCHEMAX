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
    lastGeneratedHash: string
    setLastGeneratedHash: (hash: string) => void
    currentHash: string
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId") || ""
    const [erdData, setErdData] = useState<ParsedERD | null>(null)
    const [canvasNodes, setCanvasNodes] = useState<Node[]>([])
    const [canvasEdges, setCanvasEdges] = useState<Edge[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    const [lastGeneratedHash, setLastGeneratedHash] = useState<string>("")
    const [currentHash, setCurrentHash] = useState<string>("")

    // Calculate hash of current state
    useEffect(() => {
        const hash = JSON.stringify({ nodes: canvasNodes, edges: canvasEdges })
        setCurrentHash(hash)
    }, [canvasNodes, canvasEdges])

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

                        // Initialize hash
                        const hash = JSON.stringify({ nodes: canvasData.nodes || [], edges: canvasData.edges || [] })
                        setCurrentHash(hash)

                        // If we have a lastGeneratedAt, we assume the state at load time matches
                        // (This is a simplification, ideally we'd store the hash in DB too)
                        if (data.project.lastGeneratedAt) {
                            setLastGeneratedHash(hash)
                        }
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

    // ... existing auto-save effect ...

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
            lastGeneratedHash,
            setLastGeneratedHash,
            currentHash
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
