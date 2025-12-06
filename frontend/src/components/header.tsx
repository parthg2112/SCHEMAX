"use client"

import * as React from "react"
import { Moon, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function Header() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <header className="fixed top-0 right-0 p-6 flex items-center gap-4 z-50">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>

            <Button variant="outline" className="gap-2 rounded-full">
                <User className="h-4 w-4" />
                Login
            </Button>
        </header>
    )
}
