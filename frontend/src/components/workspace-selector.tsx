"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ChevronDown, Plus, Trash2, Edit, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Project {
    id: string
    name: string
    createdAt: string
}

export function WorkspaceSelector() {
    const [projects, setProjects] = useState<Project[]>([])
    const [currentProject, setCurrentProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId")

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                const res = await fetch(`${backendUrl}/project`, {
                    credentials: 'include',
                })

                if (res.ok) {
                    const data = await res.json()
                    setProjects(data.projects || [])

                    // Set current project
                    const current = data.projects?.find((p: Project) => p.id === projectId)
                    setCurrentProject(current || data.projects?.[0] || null)
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjects()
    }, [projectId])

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editingId])

    const handleProjectSwitch = (project: Project) => {
        if (editingId) return // Don't switch if editing
        setCurrentProject(project)
        router.push(`${pathname}?projectId=${project.id}`)
    }

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation()

        if (!confirm("Are you sure you want to delete this workspace?")) return

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
            const res = await fetch(`${backendUrl}/project/${projectId}`, {
                method: "DELETE",
                credentials: 'include',
            })

            if (res.ok) {
                // Remove from local state
                const updatedProjects = projects.filter(p => p.id !== projectId)
                setProjects(updatedProjects)

                // If deleted current project, switch to first available or redirect
                if (currentProject?.id === projectId) {
                    if (updatedProjects.length > 0) {
                        router.push(`${pathname}?projectId=${updatedProjects[0].id}`)
                    } else {
                        router.push("/")
                    }
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

    const saveRename = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation()

        if (!editName.trim()) {
            cancelEditing()
            return
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
            const res = await fetch(`${backendUrl}/project/${projectId}`, {
                method: "PUT",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName })
            })

            if (res.ok) {
                setProjects(projects.map(p =>
                    p.id === projectId ? { ...p, name: editName } : p
                ))
                if (currentProject?.id === projectId) {
                    setCurrentProject({ ...currentProject, name: editName })
                }
            }
        } catch (error) {
            console.error("Failed to rename project:", error)
        } finally {
            setEditingId(null)
            setEditName("")
        }
    }

    const handleNewProject = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
            const res = await fetch(`${backendUrl}/project`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Untitled Project" })
            })

            if (res.ok) {
                const data = await res.json()
                const newProject = data.project
                setProjects([newProject, ...projects])
                router.push(`/workspace?projectId=${newProject.id}`)
            }
        } catch (error) {
            console.error("Failed to create project:", error)
        }
    }

    if (isLoading) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="gap-2 text-white/70 dark:text-white/70 hover:text-white/90 dark:hover:text-white/90 h-auto px-3 py-1 rounded-full hover:bg-white/5"
                >
                    <span className="text-sm">{currentProject?.name || "Select Workspace"}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-64 backdrop-blur-md bg-white/95 dark:bg-[#1f1f1f]/95 border-gray-200 dark:border-[#333] rounded-2xl"
            >
                {projects.map((project) => (
                    <DropdownMenuItem
                        key={project.id}
                        onClick={() => handleProjectSwitch(project)}
                        className="cursor-pointer rounded-xl focus:bg-black/5 dark:focus:bg-white/10 group justify-between px-2 py-1.5"
                    >
                        {editingId === project.id ? (
                            <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                                <Input
                                    ref={inputRef}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveRename(e as any, project.id)
                                        if (e.key === 'Escape') cancelEditing()
                                    }}
                                    className="h-7 text-sm px-2"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={(e) => saveRename(e, project.id)}
                                    className="p-1 hover:text-green-500"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="p-1 hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className={project.id === currentProject?.id ? "font-medium" : ""}>
                                    {project.name}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => startEditing(e, project)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500 p-1"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#333]" />
                <DropdownMenuItem
                    onClick={handleNewProject}
                    className="cursor-pointer rounded-xl focus:bg-black/5 dark:focus:bg-white/10"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New Workspace</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
