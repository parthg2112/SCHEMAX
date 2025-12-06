"use client"

import * as React from "react"
import { Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import { useTheme } from "next-themes"

export function CanvasPanel() {
    const { theme } = useTheme()

    // Force a remount when theme changes to ensure tldraw picks up the correct mode
    // tldraw handles theme via a prop or system preference, but explicit control is better here

    return (
        <div className="h-full w-full relative bg-background">
            {/* Tldraw container needs to be absolute or have specific height */}
            <div className="absolute inset-0">
                <Tldraw
                    persistenceKey="ablelove-canvas"
                    // Tldraw's 'dark' mode prop. 
                    // If theme is 'system', we might need to check media query, but for now let's trust 'dark' class presence or theme value
                    options={{
                        maxPages: 1,
                    }}
                />
            </div>
        </div>
    )
}
