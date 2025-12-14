import { Editor, TLShapeId, createShapeId } from 'tldraw'
import { Entity, Relationship, ParsedERD } from './mermaid-parser'

interface Position {
    x: number
    y: number
}

const ENTITY_WIDTH = 200
const ENTITY_PADDING = 20
const ATTRIBUTE_HEIGHT = 24
const ENTITY_SPACING_X = 300
const ENTITY_SPACING_Y = 250

export function renderERDToCanvas(editor: Editor, erd: ParsedERD) {
    // Clear existing shapes
    const existingShapes = editor.getCurrentPageShapeIds()
    editor.deleteShapes([...existingShapes])

    // Calculate layout positions for entities
    const positions = calculateLayout(erd.entities)

    // Store entity shape IDs for relationship arrows
    const entityShapeIds = new Map<string, TLShapeId>()

    // Create entity shapes
    erd.entities.forEach((entity, index) => {
        const pos = positions[index]
        const shapeId = createEntityShape(editor, entity, pos)
        entityShapeIds.set(entity.name, shapeId)
    })

    // Create relationship arrows
    erd.relationships.forEach(relationship => {
        const fromId = entityShapeIds.get(relationship.from)
        const toId = entityShapeIds.get(relationship.to)

        if (fromId && toId) {
            createRelationshipArrow(editor, fromId, toId, relationship.label || '')
        }
    })

    // Zoom to fit all shapes
    editor.zoomToFit()
}

function calculateLayout(entities: Entity[]): Position[] {
    // Simple grid layout
    const positions: Position[] = []
    const cols = Math.ceil(Math.sqrt(entities.length))

    entities.forEach((_, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)

        positions.push({
            x: col * ENTITY_SPACING_X,
            y: row * ENTITY_SPACING_Y
        })
    })

    return positions
}

function createEntityShape(editor: Editor, entity: Entity, pos: Position): TLShapeId {
    const shapeId = createShapeId()
    const textShapeId = createShapeId()

    // Calculate height based on attributes
    const headerHeight = 40
    const attributesHeight = entity.attributes.length * ATTRIBUTE_HEIGHT + ENTITY_PADDING
    const totalHeight = headerHeight + attributesHeight

    // Create rectangle for entity background
    editor.createShape({
        id: shapeId,
        type: 'geo',
        x: pos.x,
        y: pos.y,
        props: {
            geo: 'rectangle',
            w: ENTITY_WIDTH,
            h: totalHeight,
            color: 'blue',
            fill: 'semi',
            font: 'mono',
            align: 'start',
            verticalAlign: 'start',
        },
    })

    // Create text shape for content
    editor.createShape({
        id: textShapeId,
        type: 'text',
        x: pos.x + 10, // Padding
        y: pos.y + 10, // Padding
        props: {
            text: formatEntityText(entity),
            font: 'mono',
            size: 's',
            align: 'start',
            color: 'black',
        },
    })

    // Group them so they move together
    editor.groupShapes([shapeId, textShapeId])

    return shapeId // Return main shape ID for connections
}

function formatEntityText(entity: Entity): string {
    let text = `${entity.name}\n${'─'.repeat(20)}\n`

    entity.attributes.forEach(attr => {
        const keyIndicator = attr.key === 'PK' ? '🔑 ' : attr.key === 'FK' ? '🔗 ' : ''
        text += `${keyIndicator}${attr.name}: ${attr.type}\n`
    })

    return text
}

function createRelationshipArrow(
    editor: Editor,
    fromId: TLShapeId,
    toId: TLShapeId,
    label: string
) {
    const arrowId = createShapeId()

    // Get positions of the entities
    const fromShape = editor.getShape(fromId)
    const toShape = editor.getShape(toId)

    if (!fromShape || !toShape) return

    // Create arrow from center of fromShape to center of toShape
    editor.createShape({
        id: arrowId,
        type: 'arrow',
        props: {
            start: {
                type: 'binding',
                boundShapeId: fromId,
                normalizedAnchor: { x: 0.5, y: 0.5 },
                isExact: false,
            },
            end: {
                type: 'binding',
                boundShapeId: toId,
                normalizedAnchor: { x: 0.5, y: 0.5 },
                isExact: false,
            },
            color: 'grey',
            labelColor: 'black',
            bend: 0,
            text: label,
            font: 'sans',
        },
    })
}
