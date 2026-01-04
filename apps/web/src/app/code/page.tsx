"use client"

import * as React from "react"
import { Download, Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getBackendUrl } from "@/lib/api-url"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SchemaInfo {
    filename: string
    language: string
    content: string
    downloadName: string
}

export default function CodePage() {
    return (
        <React.Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <CodePageContent />
        </React.Suspense>
    )
}

function CodePageContent() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId") || ""

    const [schema, setSchema] = React.useState<SchemaInfo | null>(null)
    const [ormType, setOrmType] = React.useState<string>("prisma")
    const [projectName, setProjectName] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [copied, setCopied] = React.useState(false)

    const fetchSchema = React.useCallback(async (orm: string) => {
        if (!projectId) return

        try {
            setIsLoading(true)
            const backendUrl = getBackendUrl()
            const res = await fetch(`${backendUrl}/project/${projectId}/code?ormType=${orm}`, {
                credentials: 'include',
            })

            if (!res.ok) throw new Error("Failed to fetch schema")

            const data = await res.json()
            setSchema(data.schema)
            setOrmType(data.ormType || "prisma")
            setProjectName(data.projectName || "")
        } catch (err) {
            console.error(err)
            setError("Failed to load schema")
        } finally {
            setIsLoading(false)
        }
    }, [projectId])

    React.useEffect(() => {
        if (!projectId) {
            setError("No Project ID provided")
            setIsLoading(false)
            return
        }
        fetchSchema(ormType)
    }, [projectId, fetchSchema])

    const handleOrmChange = (newOrm: string) => {
        setOrmType(newOrm)
        fetchSchema(newOrm)
    }

    const handleCopy = async () => {
        if (!schema) return
        await navigator.clipboard.writeText(schema.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        if (!schema) return
        const blob = new Blob([schema.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = schema.downloadName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center text-red-500">
                {error}
            </div>
        )
    }

    return (
        <div className="h-full w-full pb-4 px-4 flex flex-col">
            <div className="flex-1 rounded-xl border bg-background shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <Link href={`/workspace?projectId=${projectId}`} prefetch={true}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ← Back to Workspace
                            </Button>
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <div className="text-sm font-medium">
                            {projectName && <span className="text-muted-foreground mr-2">{projectName} /</span>}
                            {schema?.filename}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={ormType} onValueChange={handleOrmChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="prisma">Prisma</SelectItem>
                                <SelectItem value="drizzle">Drizzle</SelectItem>
                                <SelectItem value="sql">SQL</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button size="sm" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </div>

                {/* Schema Content */}
                <div className="flex-1 overflow-auto">
                    {schema ? (
                        <pre className="p-4 font-mono text-sm leading-relaxed">
                            <code className={`language-${schema.language}`}>
                                {schema.content}
                            </code>
                        </pre>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            No schema generated yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
