"use client"

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { EntityAttribute, Entity } from '@/lib/mermaid-parser'
import { Button } from '@/components/ui/button'
import { X, Edit2 } from 'lucide-react'
import { useWorkspace } from '@/contexts/workspace-context'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ERDEntityData {
    label: string
    attributes: EntityAttribute[]
}

export const ERDEntityNode = memo(({ data, id }: NodeProps<ERDEntityData>) => {
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

    return (
        <>
            <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px] group">
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

                {/* Connection handles */}
                <Handle type="target" position={Position.Top} className="w-3 h-3" />
                <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
                <Handle type="target" position={Position.Left} className="w-3 h-3" />
                <Handle type="source" position={Position.Right} className="w-3 h-3" />
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Entity</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Entity Name</label>
                            <Input
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                placeholder="Entity name"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Attributes</label>
                                <Button size="sm" variant="outline" onClick={handleAddAttribute}>
                                    Add Attribute
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {attributes.map((attr, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="name"
                                            value={attr.name}
                                            onChange={(e) => {
                                                const newAttrs = [...attributes]
                                                newAttrs[idx].name = e.target.value
                                                setAttributes(newAttrs)
                                            }}
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="type"
                                            value={attr.type}
                                            onChange={(e) => {
                                                const newAttrs = [...attributes]
                                                newAttrs[idx].type = e.target.value
                                                setAttributes(newAttrs)
                                            }}
                                            className="flex-1"
                                        />
                                        <select
                                            value={attr.key || ''}
                                            onChange={(e) => {
                                                const newAttrs = [...attributes]
                                                newAttrs[idx].key = e.target.value as 'PK' | 'FK' | undefined
                                                setAttributes(newAttrs)
                                            }}
                                            className="px-2 py-1 border rounded"
                                        >
                                            <option value="">-</option>
                                            <option value="PK">PK</option>
                                            <option value="FK">FK</option>
                                        </select>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveAttribute(idx)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
})

ERDEntityNode.displayName = 'ERDEntityNode'
