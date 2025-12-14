"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "@/components/login-form";

import { getBackendUrl } from "@/lib/api-url";

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already authenticated and redirect to workspace
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const session = await authClient.getSession()

        if (session.data?.user) {
          // User is authenticated, fetch their projects
          const backendUrl = getBackendUrl()
          const response = await fetch(`${backendUrl}/project`, {
            credentials: 'include',
          })

          if (response.ok) {
            const projects = await response.json()
            if (projects && projects.length > 0) {
              // Redirect to workspace with first project
              router.push(`/workspace?p=${projects[0].id}`)
            } else {
              // No projects, create first one automatically
              const createRes = await fetch(`${backendUrl}/project`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: 'My First Workspace' }),
              })

              if (createRes.ok) {
                const newProject = await createRes.json()
                router.push(`/workspace?p=${newProject.id}`)
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return <LoginForm />;
}
