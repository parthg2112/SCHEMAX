

"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspaces, Project } from "@/hooks/use-workspaces"
import { cn } from "@/lib/utils"

export function WorkspaceSelector() {
    const { projects, isLoading, createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaces()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId")

    const currentProject = projects.find(p => p.id === projectId) || projects[0]

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editingId])

    const handleProjectSwitch = (project: Project) => {
        if (editingId) return
        router.push(`/workspace?projectId=${project.id}`)
    }

    const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("Delete this workspace?")) return

        try {
            await deleteWorkspace(id)
            if (currentProject?.id === id) {
                const remaining = projects.filter(p => p.id !== id)
                if (remaining.length > 0) {
                    router.push(`/workspace?projectId=${remaining[0].id}`)
                } else {
                    handleNewProject()
                }
            }
        } catch (error) {
            console.error("Failed to delete project:", error)
        }
    }

    const startEditing = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation()
        setEditingId(project.id)
        setEditName(project.name)
    }

    const cancelEditing = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setEditingId(null)
        setEditName("")
    }

    const saveRename = async (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
        e.stopPropagation()
        if (!editName.trim()) {
            cancelEditing()
            return
        }

        try {
            await updateWorkspace({ id, name: editName })
            setEditingId(null)
        } catch (error) {
            console.error("Failed to rename project:", error)
        }
    }

    const handleNewProject = async () => {
        setIsCreating(true)
        try {
            const newProject = await createWorkspace("Untitled Project")
            router.push(`/workspace?projectId=${newProject.id}`)
        } catch (error) {
            console.error("Failed to create project:", error)
        } finally {
            setIsCreating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="h-8 w-32 bg-muted/50 animate-pulse rounded-full" />
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="group gap-2 h-9 px-4 rounded-full bg-background/50 hover:bg-accent/50 border border-transparent hover:border-border transition-all duration-200"
                >
                    <span className="text-sm font-medium max-w-[150px] truncate">
                        {currentProject?.name || "Select Workspace"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-72 p-2 backdrop-blur-xl bg-background/80 border-border/50 shadow-2xl rounded-2xl"
            >
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                    {projects.map((project) => (
                        <DropdownMenuItem
                            key={project.id}
                            onClick={() => handleProjectSwitch(project)}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200",
                                project.id === currentProject?.id
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {editingId === project.id ? (
                                <div className="flex items-center gap-1 flex-1 w-full" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                        ref={inputRef}
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveRename(e, project.id)
                                            if (e.key === 'Escape') cancelEditing()
                                        }}
                                        className="h-7 text-sm px-2 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-ring"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex items-center gap-0.5">
                                        <button
                                            onClick={(e) => saveRename(e, project.id)}
                                            className="p-1.5 hover:bg-green-500/10 hover:text-green-500 rounded-md transition-colors"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="truncate font-medium flex-1">
                                        {project.name}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={(e) => startEditing(e, project)}
                                            className="p-1.5 hover:bg-background/80 rounded-md hover:text-blue-500 transition-colors"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteProject(e, project.id)}
                                            className="p-1.5 hover:bg-background/80 rounded-md hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                <DropdownMenuItem
                    onClick={handleNewProject}
                    disabled={isCreating}
                    className="cursor-pointer rounded-xl py-2.5 px-3 hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors justify-center font-medium"
                >
                    {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    New Workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
