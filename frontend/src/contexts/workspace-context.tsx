"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ParsedERD, Entity } from '@/lib/mermaid-parser'
import { Node, Edge } from '@xyflow/react'

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
    const [erdData, setErdData] = useState<ParsedERD | null>(null)
    const [canvasNodes, setCanvasNodes] = useState<Node[]>([])
    const [canvasEdges, setCanvasEdges] = useState<Edge[]>([])

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
