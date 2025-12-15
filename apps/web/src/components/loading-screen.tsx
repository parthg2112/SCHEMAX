"use server"

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="relative">
                {/* Animated spinner */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-700 border-t-white"></div>

                {/* Optional text below spinner */}
                <p className="mt-4 text-center text-sm text-gray-400 animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    )
}
