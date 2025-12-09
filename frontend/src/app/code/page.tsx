"use client"

import * as React from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { FileExplorer, FileNode } from "@/components/code/file-explorer"
import { CodeViewer } from "@/components/code/code-viewer"
import { useSearchParams } from "next/navigation"

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

    const [files, setFiles] = React.useState<FileNode[]>([])
    const [selectedFile, setSelectedFile] = React.useState<FileNode | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!projectId) {
            setError("No Project ID provided")
            setIsLoading(false)
            return
        }

        const fetchProjectCode = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                const res = await fetch(`${backendUrl}/project/${projectId}/code`, {
                    credentials: 'include',
                })

                if (!res.ok) throw new Error("Failed to fetch project code")

                const data = await res.json()
                setFiles(data.files || [])

                // Try to find schema.prisma to select by default, otherwise select first file
                // Helper to find file recursively
                const findSchema = (nodes: FileNode[]): FileNode | null => {
                    for (const node of nodes) {
                        if (node.name === 'schema.prisma') return node;
                        if (node.children) {
                            const found = findSchema(node.children);
                            if (found) return found;
                        }
                    }
                    return null;
                }

                const schemaNode = findSchema(data.files);
                if (schemaNode) {
                    setSelectedFile(schemaNode);
                } else if (data.files.length > 0) {
                    setSelectedFile(data.files[0]);
                }

            } catch (err) {
                console.error(err)
                setError("Failed to load project code")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjectCode()
    }, [projectId])

    const handleDownload = () => {
        alert("Downloading generated code as ZIP... (Feature coming soon)")
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
        <div className="h-screen w-full pt-16 pb-4 px-4 flex flex-col">
            <div className="flex-1 rounded-xl border bg-background shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                    <div className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : "No file selected"}
                    </div>
                    <Button size="sm" onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download ZIP
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                            <FileExplorer
                                files={files}
                                selectedFileId={selectedFile?.id || null}
                                onSelectFile={setSelectedFile}
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={75}>
                            {selectedFile && selectedFile.content ? (
                                <CodeViewer
                                    code={selectedFile.content}
                                    language={selectedFile.language || "plaintext"}
                                    filename={selectedFile.name}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    Select a file to view content
                                </div>
                            )}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    )
}
