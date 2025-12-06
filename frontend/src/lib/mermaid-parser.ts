export interface EntityAttribute {
    name: string
    type: string
    key?: 'PK' | 'FK'
}

export interface Entity {
    name: string
    attributes: EntityAttribute[]
}

export interface Relationship {
    from: string
    to: string
    cardinality: string // e.g., "||--o{", "||--||", etc.
    label?: string
}

export interface ParsedERD {
    entities: Entity[]
    relationships: Relationship[]
}

export function parseMermaidERD(mermaidCode: string): ParsedERD {
    const entities: Entity[] = []
    const relationships: Relationship[] = []

    // Remove code block markers if present
    let code = mermaidCode.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim()

    // Split into lines
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    let currentEntity: Entity | null = null

    for (const line of lines) {
        // Skip erDiagram declaration
        if (line === 'erDiagram') continue

        // Relationship pattern: ENTITY1 ||--o{ ENTITY2 : label
        const relationshipMatch = line.match(/^(\w+)\s+([\|\}o\-\{]+)\s+(\w+)\s*:\s*(.+)$/)
        if (relationshipMatch) {
            const [, from, cardinality, to, label] = relationshipMatch
            relationships.push({ from, to, cardinality, label })
            continue
        }

        // Entity start: ENTITY_NAME {
        const entityStartMatch = line.match(/^(\w+)\s*\{/)
        if (entityStartMatch) {
            currentEntity = {
                name: entityStartMatch[1],
                attributes: []
            }
            continue
        }

        // Entity end: }
        if (line === '}') {
            if (currentEntity) {
                entities.push(currentEntity)
                currentEntity = null
            }
            continue
        }

        // Attribute: type name KEY
        if (currentEntity) {
            const attrMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(PK|FK))?/)
            if (attrMatch) {
                const [, type, name, key] = attrMatch
                currentEntity.attributes.push({
                    name,
                    type,
                    key: key as 'PK' | 'FK' | undefined
                })
            }
        }
    }

    return { entities, relationships }
}
