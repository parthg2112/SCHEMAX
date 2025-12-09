import * as React from "react"
import { CodeBlock } from "@/components/ui/code-block"

interface CodeViewerProps {
    code: string
    language: string
    filename?: string
}

export function CodeViewer({ code, language, filename = "Code" }: CodeViewerProps) {
    return (
        <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-4">
            <CodeBlock
                language={language}
                filename={filename}
                code={code}
            />
        </div>
    )
}
