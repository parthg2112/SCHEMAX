"use server"

import ClassicLoader from "@/components/ui/loader"

export function CanvasLoader() {
    return (
        <div className="h-screen w-full bg-black relative flex items-center justify-center overflow-hidden">
            <ClassicLoader />
        </div>
    )
}
