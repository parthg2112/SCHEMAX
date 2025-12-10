"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react'
import { ParsedERD, Entity } from '@/lib/mermaid-parser'
import { Node, Edge } from '@xyflow/react'
import { useSearchParams } from 'next/navigation'

interface HistoryState {
    nodes: Node[]
    edges: Edge[]
}

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
    undo: () => void
    redo: () => void
    addToHistory: () => void
    canUndo: boolean
    canRedo: boolean
    updateEdge: (edgeId: string, data: any) => void
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

    // History State
    const [past, setPast] = useState<HistoryState[]>([])
    const [future, setFuture] = useState<HistoryState[]>([])

    // Track previous projectId to avoid unnecessary resets
    const prevProjectIdRef = useRef<string>("")

    // Calculate hash of current state
    useEffect(() => {
        const hash = JSON.stringify({ nodes: canvasNodes, edges: canvasEdges })
        setCurrentHash(hash)
    }, [canvasNodes, canvasEdges])

    // Load workspace data on mount or projectId change
    useEffect(() => {
        if (!projectId) return

        // Only reset state if projectId actually changed
        const projectIdChanged = prevProjectIdRef.current !== projectId
        if (projectIdChanged) {
            setCanvasNodes([])
            setCanvasEdges([])
            setErdData(null)
            setPast([])
            setFuture([])
            prevProjectIdRef.current = projectId
        }

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

        // Only fetch if projectId changed or data not loaded
        if (projectIdChanged || !isLoaded) {
            loadWorkspace()
        }
    }, [projectId])

    // Auto-save effect
    useEffect(() => {
        if (!isLoaded || !projectId) return

        const saveWorkspace = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                await fetch(`${backendUrl}/project/${projectId}`, {
                    method: "PUT",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        erdData: erdData,
                        canvasData: { nodes: canvasNodes, edges: canvasEdges }
                    })
                })
            } catch (error) {
                console.error("Auto-save failed:", error)
            }
        }

        const timeout = setTimeout(saveWorkspace, 2000)
        return () => clearTimeout(timeout)
    }, [erdData, canvasNodes, canvasEdges, projectId, isLoaded])


    const addToHistory = useCallback(() => {
        setPast(prev => [...prev, { nodes: canvasNodes, edges: canvasEdges }])
        setFuture([])
    }, [canvasNodes, canvasEdges])

    const undo = useCallback(() => {
        if (past.length === 0) return

        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)

        setFuture(prev => [{ nodes: canvasNodes, edges: canvasEdges }, ...prev])
        setPast(newPast)
        setCanvasNodes(previous.nodes)
        setCanvasEdges(previous.edges)
    }, [past, canvasNodes, canvasEdges])

    const redo = useCallback(() => {
        if (future.length === 0) return

        const next = future[0]
        const newFuture = future.slice(1)

        setPast(prev => [...prev, { nodes: canvasNodes, edges: canvasEdges }])
        setFuture(newFuture)
        setCanvasNodes(next.nodes)
        setCanvasEdges(next.edges)
    }, [future, canvasNodes, canvasEdges])

    const updateEntityInNodes = useCallback((entityName: string, updatedEntity: Entity) => {
        addToHistory()
        setCanvasNodes(nodes =>
            nodes.map(node =>
                node.id === entityName
                    ? { ...node, data: { ...node.data, label: updatedEntity.name, attributes: updatedEntity.attributes } }
                    : node
            )
        )
    }, [addToHistory])

    const addEntity = useCallback((entity: Entity) => {
        addToHistory()
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
    }, [addToHistory])

    const removeEntity = useCallback((entityName: string) => {
        addToHistory()
        setCanvasNodes(nodes => nodes.filter(node => node.id !== entityName))
        setCanvasEdges(edges => edges.filter(edge => edge.source !== entityName && edge.target !== entityName))
    }, [addToHistory])

    const updateEdge = useCallback((edgeId: string, data: any) => {
        addToHistory()
        setCanvasEdges(edges =>
            edges.map(edge =>
                edge.id === edgeId
                    ? { ...edge, data: { ...edge.data, ...data } }
                    : edge
            )
        )
    }, [addToHistory])

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
            currentHash,
            undo,
            redo,
            addToHistory,
            canUndo: past.length > 0,
            canRedo: future.length > 0,
            updateEdge
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
