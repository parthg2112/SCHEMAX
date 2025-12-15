"use server"

import * as React from "react"
import { FileCode, FileJson, Folder, ChevronRight, ChevronDown, Database } from "lucide-react"
import { cn } from "@/lib/utils"

export type FileNode = {
    id: string
    name: string
    type: "file" | "folder"
    language?: string
    content?: string
    children?: FileNode[]
    isOpen?: boolean
}

interface FileExplorerProps {
    files: FileNode[]
    selectedFileId: string | null
    onSelectFile: (file: FileNode) => void
}

export function FileExplorer({ files, selectedFileId, onSelectFile }: FileExplorerProps) {
    return (
        <div className="h-full w-full bg-muted/30 flex flex-col border-r">
            <div className="p-4 border-b text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Explorer
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {files.map((file) => (
                    <FileItem
                        key={file.id}
                        node={file}
                        selectedFileId={selectedFileId}
                        onSelect={onSelectFile}
                        depth={0}
                    />
                ))}
            </div>
        </div>
    )
}

function FileItem({
    node,
    selectedFileId,
    onSelect,
    depth,
}: {
    node: FileNode
    selectedFileId: string | null
    onSelect: (file: FileNode) => void
    depth: number
}) {
    const [isOpen, setIsOpen] = React.useState(true)
    const isSelected = node.id === selectedFileId

    const handleClick = () => {
        if (node.type === "folder") {
            setIsOpen(!isOpen)
        } else {
            onSelect(node)
        }
    }

    const Icon = node.type === "folder"
        ? Folder
        : node.name.endsWith(".prisma")
            ? Database
            : node.name.endsWith(".json")
                ? FileJson
                : FileCode

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer text-sm select-none transition-colors",
                    isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleClick}
            >
                <span className="shrink-0 opacity-70">
                    {node.type === "folder" && (
                        isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                    )}
                    {node.type === "file" && <div className="w-3" />}
                </span>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{node.name}</span>
            </div>
            {node.type === "folder" && isOpen && node.children && (
                <div>
                    {node.children.map((child) => (
                        <FileItem
                            key={child.id}
                            node={child}
                            selectedFileId={selectedFileId}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
