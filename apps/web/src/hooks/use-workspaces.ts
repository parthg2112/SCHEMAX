"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBackendUrl } from "@/lib/api-url"

export interface Project {
    id: string
    name: string
    createdAt: string
}

async function fetchProjects() {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/project`, {
        credentials: 'include',
    })
    if (!res.ok) throw new Error("Failed to fetch projects")
    const data = await res.json()
    return data.projects as Project[]
}

async function createProject(name: string) {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/project`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
    if (!res.ok) throw new Error("Failed to create project")
    const data = await res.json()
    return data.project as Project
}

async function updateProject({ id, name }: { id: string; name: string }) {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/project/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
    if (!res.ok) throw new Error("Failed to update project")
    return { id, name }
}

async function deleteProject(id: string) {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/project/${id}`, {
        method: "DELETE",
        credentials: 'include',
    })
    if (!res.ok) throw new Error("Failed to delete project")
    return id
}

export function useWorkspaces() {
    const queryClient = useQueryClient()

    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: fetchProjects,
    })

    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: (newProject) => {
            queryClient.setQueryData(["projects"], (old: Project[] = []) => [newProject, ...old])
        },
    })

    const updateMutation = useMutation({
        mutationFn: updateProject,
        onMutate: async (newProject) => {
            await queryClient.cancelQueries({ queryKey: ["projects"] })
            const previousProjects = queryClient.getQueryData<Project[]>(["projects"])
            queryClient.setQueryData(["projects"], (old: Project[] = []) =>
                old.map((p) => (p.id === newProject.id ? { ...p, name: newProject.name } : p))
            )
            return { previousProjects }
        },
        onError: (err, newProject, context) => {
            queryClient.setQueryData(["projects"], context?.previousProjects)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: ["projects"] })
            const previousProjects = queryClient.getQueryData<Project[]>(["projects"])
            queryClient.setQueryData(["projects"], (old: Project[] = []) =>
                old.filter((p) => p.id !== deletedId)
            )
            return { previousProjects }
        },
        onError: (err, deletedId, context) => {
            queryClient.setQueryData(["projects"], context?.previousProjects)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
        },
    })

    return {
        projects: projectsQuery.data || [],
        isLoading: projectsQuery.isLoading,
        isError: projectsQuery.isError,
        createWorkspace: createMutation.mutateAsync,
        updateWorkspace: updateMutation.mutateAsync,
        deleteWorkspace: deleteMutation.mutateAsync,
    }
}
