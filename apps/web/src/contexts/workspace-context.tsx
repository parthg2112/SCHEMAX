"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react'
import { ParsedERD, Entity } from '@/lib/mermaid-parser'
import { Node, Edge } from '@xyflow/react'
import { getBackendUrl } from '@/lib/api-url'

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

interface WorkspaceProviderProps {
    children: ReactNode
    projectId: string
}

export function WorkspaceProvider({ children, projectId }: WorkspaceProviderProps) {
    // projectId is now passed as prop from parent, not read from URL
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
        if (!projectId) {
            console.log('[Workspace] No projectId, skipping load')
            return
        }

        // Only reset state if projectId actually changed
        const projectIdChanged = prevProjectIdRef.current !== projectId
        console.log('[Workspace] Load effect triggered', {
            projectId,
            projectIdChanged,
            prevProjectId: prevProjectIdRef.current,
            isLoaded
        })

        if (projectIdChanged) {
            console.log('[Workspace] Project ID changed, resetting state')
            setCanvasNodes([])
            setCanvasEdges([])
            setErdData(null)
            setPast([])
            setFuture([])
            prevProjectIdRef.current = projectId
        }

        const loadWorkspace = async () => {
            try {
                console.log('[Workspace] Loading workspace data for project:', projectId)
                const backendUrl = getBackendUrl()
                const res = await fetch(`${backendUrl}/project/${projectId}`, {
                    credentials: 'include',
                })

                console.log('[Workspace] Fetch response:', res.status, res.ok)

                if (res.ok) {
                    const data = await res.json()
                    console.log('[Workspace] Received data:', {
                        hasErdData: !!data.project?.erdData,
                        hasCanvasData: !!data.project?.canvasData,
                        nodesCount: data.project?.canvasData?.nodes?.length || 0,
                        edgesCount: data.project?.canvasData?.edges?.length || 0
                    })

                    if (data.project?.erdData) {
                        console.log('[Workspace] Setting ERD data:', data.project.erdData)
                        setErdData(data.project.erdData)
                    } else {
                        console.log('[Workspace] No ERD data found in response')
                    }

                    if (data.project?.canvasData) {
                        const canvasData = data.project.canvasData
                        console.log('[Workspace] Canvas data found:', {
                            nodes: canvasData.nodes?.length || 0,
                            edges: canvasData.edges?.length || 0
                        })

                        if (canvasData.nodes) {
                            console.log('[Workspace] Setting canvas nodes:', canvasData.nodes.length, 'nodes')
                            setCanvasNodes(canvasData.nodes)
                        }
                        if (canvasData.edges) {
                            console.log('[Workspace] Setting canvas edges:', canvasData.edges.length, 'edges')
                            setCanvasEdges(canvasData.edges)
                        }

                        // Initialize hash
                        const hash = JSON.stringify({ nodes: canvasData.nodes || [], edges: canvasData.edges || [] })
                        setCurrentHash(hash)

                        if (data.project.lastGeneratedAt) {
                            setLastGeneratedHash(hash)
                        }
                    } else {
                        console.log('[Workspace] No canvas data in response')
                    }
                } else {
                    console.error('[Workspace] Failed to load, status:', res.status)
                }
            } catch (error) {
                console.error("[Workspace] Failed to load workspace:", error)
            } finally {
                setIsLoaded(true)
                console.log('[Workspace] Load complete, isLoaded set to true')
            }
        }

        // Only fetch if projectId changed or data not loaded
        if (projectIdChanged || !isLoaded) {
            console.log('[Workspace] Triggering loadWorkspace()')
            loadWorkspace()
        } else {
            console.log('[Workspace] Skipping load - already loaded and project unchanged')
        }
    }, [projectId])

    // Auto-save effect
    useEffect(() => {
        if (!isLoaded || !projectId) {
            console.log('[Workspace] Skipping auto-save:', { isLoaded, hasProjectId: !!projectId })
            return
        }

        const saveWorkspace = async () => {
            try {
                console.log('[Workspace] Auto-saving workspace:', {
                    projectId,
                    nodesCount: canvasNodes.length,
                    edgesCount: canvasEdges.length,
                    hasErdData: !!erdData
                })

                const backendUrl = getBackendUrl()
                const response = await fetch(`${backendUrl}/project/${projectId}`, {
                    method: "PUT",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        erdData: erdData,
                        canvasData: { nodes: canvasNodes, edges: canvasEdges }
                    })
                })

                if (response.ok) {
                    console.log('[Workspace] Auto-save successful')
                } else {
                    console.error('[Workspace] Auto-save failed with status:', response.status)
                }
            } catch (error) {
                console.error("[Workspace] Auto-save failed:", error)
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
