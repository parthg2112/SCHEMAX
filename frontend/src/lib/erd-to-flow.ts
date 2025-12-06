import { Node, Edge } from '@xyflow/react'
import { Entity, Relationship, ParsedERD } from './mermaid-parser'

export interface ERDFlowData {
    nodes: Node[]
    edges: Edge[]
}

export function convertERDToFlow(erd: ParsedERD): ERDFlowData {
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Calculate layout positions
    const cols = Math.ceil(Math.sqrt(erd.entities.length))
    const SPACING_X = 350
    const SPACING_Y = 300

    // Create nodes for entities
    erd.entities.forEach((entity, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)

        nodes.push({
            id: entity.name,
            type: 'erdEntity',
            position: {
                x: col * SPACING_X,
                y: row * SPACING_Y,
            },
            data: {
                label: entity.name,
                attributes: entity.attributes,
            },
        })
    })

    // Create edges for relationships
    erd.relationships.forEach((rel, index) => {
        edges.push({
            id: `edge-${index}`,
            source: rel.from,
            target: rel.to,
            label: rel.label || rel.cardinality,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#64748b', strokeWidth: 2 },
            labelStyle: { fill: '#64748b', fontWeight: 500 },
        })
    })

    return { nodes, edges }
}
