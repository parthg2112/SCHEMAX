"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CanvasRevealEffect } from "@/components/blocks/sign-in-flow-1";

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState<"email" | "password" | "success">("email");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
    const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
    const router = useRouter();
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setStep("password");
            setError(null);
        }
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        if (isSignUp && !name) {
            setError("Name is required for sign up");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                await authClient.signUp.email({
                    email,
                    password,
                    name,
                }, {
                    onSuccess: () => {
                        handleSuccess();
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message || "Sign up failed");
                        setIsLoading(false);
                    }
                });
            } else {
                await authClient.signIn.email({
                    email,
                    password,
                }, {
                    onSuccess: () => {
                        handleSuccess();
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message || "Invalid email or password");
                        setIsLoading(false);
                    }
                });
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const handleSuccess = async () => {
        // Trigger success animation
        setReverseCanvasVisible(true);
        setTimeout(() => setInitialCanvasVisible(false), 50);
        setStep("success");

        // Fetch or create project
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

            // 1. Get existing projects
            const res = await fetch(`${backendUrl}/project`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                if (data.projects && data.projects.length > 0) {
                    // Redirect to latest project
                    setTimeout(() => router.push(`/workspace?projectId=${data.projects[0].id}`), 2000);
                    return;
                }
            }

            // 2. If no projects, create one
            const createRes = await fetch(`${backendUrl}/project`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: "Untitled Project" })
            });

            if (createRes.ok) {
                const data = await createRes.json();
                setTimeout(() => router.push(`/workspace?projectId=${data.project.id}`), 2000);
            } else {
                // Fallback if creation fails
                setTimeout(() => router.push("/workspace"), 2000);
            }

        } catch (e) {
            console.error("Failed to fetch/create project", e);
            setTimeout(() => router.push("/workspace"), 2000);
        }

        if (onSuccess) {
            onSuccess();
        }
    };

    const handleBackClick = () => {
        setStep("email");
        setPassword("");
        setError(null);
    };

    useEffect(() => {
        if (step === "password") {
            setTimeout(() => {
                passwordInputRef.current?.focus();
            }, 500);
        }
    }, [step]);

    return (
        <div className="flex w-full flex-col min-h-screen bg-black relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center justify-center pl-6 pr-6 py-3 backdrop-blur-sm rounded-full border border-[#333] bg-[#1f1f1f57] opacity-50 pointer-events-none">
                <div className="flex items-center gap-x-6">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                    </div>
                    <span className="text-2xl text-gray-100">SCHEMAX</span>
                </div>
            </header>

            {/* Canvas Background */}
            <div className="absolute inset-0 z-0">
                {initialCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={3}
                            containerClassName="bg-black"
                            colors={[[255, 255, 255], [255, 255, 255]]}
                            dotSize={6}
                            reverse={false}
                        />
                    </div>
                )}
                {reverseCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={4}
                            containerClassName="bg-black"
                            colors={[[255, 255, 255], [255, 255, 255]]}
                            dotSize={6}
                            reverse={true}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
            </div>

            {/* Form Content */}
            <div className="relative z-10 flex flex-col flex-1 items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <AnimatePresence mode="wait">
                        {step === "email" ? (
                            <motion.div
                                key="email-step"
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-6 text-center"
                            >
                                <div className="space-y-1">
                                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                                        {isSignUp ? "Create Account" : "Welcome Back"}
                                    </h1>
                                    <p className="text-[1.8rem] text-white/70 font-light">
                                        {isSignUp ? "Sign up to get started" : "Sign in to continue"}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <form onSubmit={handleEmailSubmit}>
                                        <div className="relative space-y-4">
                                            {isSignUp && (
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-transparent"
                                                    required
                                                />
                                            )}
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-transparent"
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors group overflow-hidden"
                                                >
                                                    <span className="relative w-full h-full block overflow-hidden">
                                                        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full">
                                                            →
                                                        </span>
                                                        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 -translate-x-full group-hover:translate-x-0">
                                                            →
                                                        </span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => {
                                                setIsSignUp(!isSignUp);
                                                setError(null);
                                            }}
                                            className="text-white/50 hover:text-white text-sm transition-colors"
                                        >
                                            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : step === "password" ? (
                            <motion.div
                                key="password-step"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-6 text-center"
                            >
                                <div className="space-y-1">
                                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Enter Password</h1>
                                    <p className="text-[1.25rem] text-white/50 font-light">for {email}</p>
                                </div>

                                <form onSubmit={handleAuthSubmit} className="space-y-4">
                                    <div className="relative">
                                        <input
                                            ref={passwordInputRef}
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-transparent"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-sm">{error}</p>
                                    )}

                                    <div className="flex w-full gap-3">
                                        <motion.button
                                            type="button"
                                            onClick={handleBackClick}
                                            className="rounded-full bg-white text-black font-medium px-8 py-3 hover:bg-white/90 transition-colors w-[30%]"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Back
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 rounded-full font-medium py-3 bg-[#111] text-white border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-step"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                                className="space-y-6 text-center"
                            >
                                <div className="space-y-1">
                                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">You're in!</h1>
                                    <p className="text-[1.25rem] text-white/50 font-light">Setting up your workspace...</p>
                                </div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="py-10"
                                >
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-black animate-spin" />
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
