"use client";
import React from "react";
import { CanvasRevealEffect } from "@/components/blocks/sign-in-flow-1";
import { AnimatePresence, motion } from "framer-motion";

export const CanvasLoader = () => {
    return (
        <div className="h-screen w-full relative flex items-center justify-center bg-black overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
                <CanvasRevealEffect
                    animationSpeed={3}
                    containerClassName="bg-black"
                    colors={[
                        [236, 72, 153],
                        [232, 121, 249],
                    ]}
                    dotSize={2}
                />
            </div>
            <div className="z-20 flex flex-col items-center justify-center gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500"
                >
                    AbleLove
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-neutral-400"
                >
                    Loading your workspace...
                </motion.div>
            </div>
        </div>
    );
};
