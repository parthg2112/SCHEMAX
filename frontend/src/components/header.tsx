"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, LogOut } from "lucide-react"
import { WorkspaceSelector } from "@/components/workspace-selector"

export function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession()
                setIsAuthenticated(!!session.data)
            } catch (error) {
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [pathname])

    const handleLogout = async () => {
        try {
            await authClient.signOut()
            router.push("/")
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    // Don't show header on login page
    if (pathname === "/") return null

    const showWorkspaceSelector = pathname === "/workspace" || pathname === "/code"

    return (
        <>
            {/* Left bubble - Brand & Workspace Selector */}
            <header className="fixed top-3 left-6 z-50 flex items-center gap-x-2 px-3 py-2 backdrop-blur-sm rounded-full border border-[#333] bg-[#1f1f1f57]">
                <div className="flex items-center gap-x-3">
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        <span className="absolute w-1 h-1 rounded-full bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                        <span className="absolute w-1 h-1 rounded-full bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                        <span className="absolute w-1 h-1 rounded-full bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                        <span className="absolute w-1 h-1 rounded-full bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                    </div>
                    <span className="text-base text-white/90 dark:text-white/90 font-medium">AbleLove</span>
                </div>
                {showWorkspaceSelector && <WorkspaceSelector />}
            </header>

            {/* Right bubble - Actions */}
            <header className="fixed top-3 right-6 z-50 flex items-center gap-1.5 px-3 py-2 backdrop-blur-sm rounded-full border border-[#333] bg-[#1f1f1f57]">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full h-7 w-7 hover:bg-white/10"
                >
                    <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-800" />
                    <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {isAuthenticated && !isLoading && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="rounded-full h-7 w-7 hover:bg-white/10"
                    >
                        <LogOut className="h-3 w-3 text-gray-800 dark:text-white" />
                    </Button>
                )}
            </header>
        </>
    )
}
