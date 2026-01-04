"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, LogOut, ChevronDown, Menu, Crown } from "lucide-react"
import { toast } from "sonner"
import { WorkspaceSelector } from "@/components/workspace-selector"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { PricingModal } from "@/components/pricing-modal"
import { ShimmerButton } from "@/components/ui/shimmer-button"

// User Menu Component
const UserMenu = ({
    userName,
    userEmail,
    userAvatar,
    onLogout
}: {
    userName: string;
    userEmail: string;
    userAvatar?: string;
    onLogout: () => void;
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground">
                <Avatar className="h-7 w-7">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-xs">
                        {userName ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                <span className="sr-only">User menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Settings coming soon!")}>
                Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Billing portal coming soon!")}>
                Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

export function Header() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const [user, setUser] = React.useState<{ name: string; email: string; image?: string } | null>(null)
    const [pricingOpen, setPricingOpen] = React.useState(false)
    const [userPlan, setUserPlan] = React.useState<'free' | 'pro'>('free')
    const router = useRouter()
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [isMobile, setIsMobile] = React.useState(false)

    // Listen for pricing modal open event from chat panel
    React.useEffect(() => {
        const handleOpenPricing = () => setPricingOpen(true)
        window.addEventListener('openPricing' as any, handleOpenPricing)
        return () => window.removeEventListener('openPricing' as any, handleOpenPricing)
    }, [])

    // Check auth status on mount
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession()
                if (session.data) {
                    setIsAuthenticated(true)
                    setUser({
                        name: session.data.user.name || "User",
                        email: session.data.user.email || "",
                        image: session.data.user.image || undefined
                    })
                } else {
                    setIsAuthenticated(false)
                    setUser(null)
                }
            } catch (error) {
                setIsAuthenticated(false)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [pathname])

    // Responsive check
    React.useEffect(() => {
        const checkWidth = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkWidth()
        window.addEventListener('resize', checkWidth)
        return () => window.removeEventListener('resize', checkWidth)
    }, [])

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
        <header className="z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-2">
                {/* Left side */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Mobile Menu Trigger */}
                    {isMobile && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                                <div className="flex flex-col gap-4 py-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="relative w-6 h-6 flex items-center justify-center">
                                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                                        </div>
                                        <span className="text-lg font-bold">SCHEMAX</span>
                                    </div>
                                    {showWorkspaceSelector && (
                                        <div className="px-2">
                                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                                Workspace
                                            </div>
                                            <WorkspaceSelector />
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* Brand */}
                    <div className="flex items-center gap-x-3 shrink-0">
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-black dark:bg-white bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                        </div>
                        <span className="text-lg font-bold hidden md:inline-block">SCHEMAX</span>
                    </div>

                    {/* Workspace Selector (Desktop) */}
                    {!isMobile && showWorkspaceSelector && (
                        <>
                            <div className="h-6 w-px bg-border mx-2" />
                            <WorkspaceSelector />
                        </>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* GET PRO Button */}
                    {isAuthenticated && userPlan === 'free' && (
                        <ShimmerButton
                            className="shadow-2xl"
                            onClick={() => setPricingOpen(true)}
                        >
                            <Crown className="h-4 w-4 mr-1.5" />
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-base">
                                GET PRO
                            </span>
                        </ShimmerButton>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-9 w-9"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {isAuthenticated && !isLoading && user && (
                        <UserMenu
                            userName={user.name}
                            userEmail={user.email}
                            userAvatar={user.image}
                            onLogout={handleLogout}
                        />
                    )}
                </div>
            </div>

            {/* Pricing Modal */}
            <PricingModal
                open={pricingOpen}
                onOpenChange={setPricingOpen}
                currentPlan={userPlan}
                onSelectPlan={(plan) => {
                    if (plan === 'pro') {
                        // TODO: Trigger payment flow
                        console.log('Upgrade to Pro - will integrate Cashfree')
                    }
                    setPricingOpen(false)
                }}
            />
        </header>
    )
}
