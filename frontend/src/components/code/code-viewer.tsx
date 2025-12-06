"use client"

import * as React from "react"
import Editor, { useMonaco } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface CodeViewerProps {
    code: string
    language: string
}

export function CodeViewer({ code, language }: CodeViewerProps) {
    const { theme } = useTheme()

    return (
        <div className="h-full w-full bg-[#1e1e1e]">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "var(--font-geist-mono)",
                }}
            />
        </div>
    )
}
