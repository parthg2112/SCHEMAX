import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { cn } from '@/lib/utils';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const label = (data?.label as string) || "";
    const cardinalitySource = (data?.cardinalitySource as string) || "";
    const cardinalityTarget = (data?.cardinalityTarget as string) || "";

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    {label && (
                        <div className="bg-background border rounded px-2 py-0.5 text-xs font-medium shadow-sm">
                            {label}
                        </div>
                    )}
                </div>

                {/* Source Cardinality */}
                {cardinalitySource && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.15}px,${sourceY + (targetY - sourceY) * 0.15}px)`,
                            fontSize: 12,
                            pointerEvents: 'none',
                        }}
                        className="nodrag nopan font-bold text-muted-foreground bg-background/80 px-1 rounded"
                    >
                        {cardinalitySource}
                    </div>
                )}

                {/* Target Cardinality */}
                {cardinalityTarget && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${targetX - (targetX - sourceX) * 0.15}px,${targetY - (targetY - sourceY) * 0.15}px)`,
                            fontSize: 12,
                            pointerEvents: 'none',
                        }}
                        className="nodrag nopan font-bold text-muted-foreground bg-background/80 px-1 rounded"
                    >
                        {cardinalityTarget}
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
}
