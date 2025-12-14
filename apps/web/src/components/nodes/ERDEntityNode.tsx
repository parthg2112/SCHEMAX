"use client"

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { EntityAttribute, Entity } from '@/lib/mermaid-parser'
import { Button } from '@/components/ui/button'
import { X, Edit2 } from 'lucide-react'
import { useWorkspace } from '@/contexts/workspace-context'
import { Input } from '@/components/ui/input'

interface ERDEntityData extends Record<string, unknown> {
    label: string
    attributes: EntityAttribute[]
}

type ERDNode = Node<ERDEntityData>

export const ERDEntityNode = memo(({ data, id }: NodeProps<ERDNode>) => {
    const { updateEntityInNodes, removeEntity } = useWorkspace()
    const [isEditing, setIsEditing] = useState(false)
    const [entityName, setEntityName] = useState(data.label)
    const [attributes, setAttributes] = useState(data.attributes)

    const handleSave = () => {
        const updatedEntity: Entity = {
            name: entityName,
            attributes: attributes,
        }
        updateEntityInNodes(id, updatedEntity)
        setIsEditing(false)
    }

    const handleAddAttribute = () => {
        setAttributes([...attributes, { name: 'newField', type: 'string' }])
    }

    const handleRemoveAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index))
    }

    const frontRef = React.useRef<HTMLDivElement>(null)
    const backRef = React.useRef<HTMLDivElement>(null)
    const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)

    React.useEffect(() => {
        const updateHeight = () => {
            const frontHeight = frontRef.current?.scrollHeight
            const backHeight = backRef.current?.scrollHeight

            if (isEditing && backHeight) {
                setContainerHeight(backHeight)
            } else if (!isEditing && frontHeight) {
                setContainerHeight(frontHeight)
            }
        }

        // Update immediately and after a small delay to ensure rendering
        updateHeight()
        const timer = setTimeout(updateHeight, 50)
        return () => clearTimeout(timer)
    }, [isEditing, attributes, entityName])

    return (
        <div
            style={{
                perspective: '1000px',
                height: containerHeight ? `${containerHeight}px` : 'auto',
                transition: 'height 0.6s ease-in-out'
            }}
            className="min-w-[250px] relative"
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: isEditing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front Face */}
                <div
                    ref={frontRef}
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        zIndex: 2,
                        transform: 'rotateY(0deg) translateZ(0.1px)',
                    }}
                    className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg group"
                >
                    {/* Entity Header */}
                    <div className="bg-blue-500 text-white px-4 py-2 font-bold text-center rounded-t-md flex items-center justify-between">
                        <span>{data.label}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 hover:bg-blue-600 rounded"
                            >
                                <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => removeEntity(id)}
                                className="p-1 hover:bg-red-600 rounded"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div className="p-3 space-y-1">
                        {data.attributes.length === 0 && (
                            <div className="text-xs text-gray-400 italic">No attributes</div>
                        )}
                        {data.attributes.map((attr, idx) => (
                            <div key={idx} className="text-sm font-mono flex items-center gap-2">
                                {attr.key === 'PK' && <span className="text-yellow-500">🔑</span>}
                                {attr.key === 'FK' && <span className="text-blue-500">🔗</span>}
                                <span className="text-gray-700 dark:text-gray-300">
                                    {attr.name}: <span className="text-gray-500 dark:text-gray-400">{attr.type}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back Face (Edit Form) */}
                <div
                    ref={backRef}
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: 'rotateY(180deg) translateZ(0.1px)',
                    }}
                    className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg p-4 flex flex-col gap-4 overflow-hidden"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Entity Name</label>
                            <Input
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                placeholder="Entity name"
                                className="h-8"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Attributes</label>
                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleAddAttribute}>
                                    + Add
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {attributes.map((attr, idx) => (
                                    <div key={idx} className="flex gap-1 items-center">
                                        <Input
                                            placeholder="name"
                                            value={attr.name}
                                            onChange={(e) => {
                                                const newAttrs = [...attributes]
                                                newAttrs[idx].name = e.target.value
                                                setAttributes(newAttrs)
                                            }}
                                            className="h-7 text-xs flex-1 min-w-0"
                                        />
                                        <Input
                                            placeholder="type"
                                            value={attr.type}
                                            onChange={(e) => {
                                                const newAttrs = [...attributes]
                                                newAttrs[idx].type = e.target.value
                                                setAttributes(newAttrs)
                                            }}
                                            className="h-7 text-xs w-16 min-w-0"
                                        />
                                        <select
                                            value={attr.key || ''}
                                            onChange={(e) => {
                                                const newAttrs = [...attributes]
                                                newAttrs[idx].key = e.target.value as 'PK' | 'FK' | undefined
                                                setAttributes(newAttrs)
                                            }}
                                            className="h-7 text-xs border rounded bg-background w-12"
                                        >
                                            <option value="">-</option>
                                            <option value="PK">PK</option>
                                            <option value="FK">FK</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveAttribute(idx)}
                                            className="p-1 hover:text-red-500 text-gray-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </div>

            {/* Connection handles */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-500" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-500" />
        </div>
    )
})

ERDEntityNode.displayName = 'ERDEntityNode'
