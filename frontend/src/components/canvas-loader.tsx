"use client";
import React from "react";
import { CanvasRevealEffect } from "@/components/blocks/sign-in-flow-1";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function CanvasLoader() {
    return (
        <div className="h-screen w-full bg-black relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <CanvasRevealEffect
                    animationSpeed={4}
                    containerClassName="bg-black"
                    colors={[[255, 255, 255], [255, 255, 255]]}
                    dotSize={6}
                    reverse={true}
                />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-black animate-spin" />
                </div>
            </motion.div>
        </div>
    )
};
