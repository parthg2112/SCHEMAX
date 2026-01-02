import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Drizzle ORM Template</h1>
                <p className="text-gray-600 mb-4">
                    Your database schema has been generated successfully!
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-blue-700">
                        <strong>Next steps:</strong>
                    </p>
                    <ol className="list-decimal list-inside text-blue-600 mt-2 space-y-1">
                        <li>Copy <code className="bg-blue-100 px-2 py-1 rounded">.env.example</code> to <code className="bg-blue-100 px-2 py-1 rounded">.env</code></li>
                        <li>Update your database URL</li>
                        <li>Run <code className="bg-blue-100 px-2 py-1 rounded">npm run db:push</code></li>
                        <li>Start building your app!</li>
                    </ol>
                </div>
                <p className="text-sm text-gray-500">
                    Check <code className="bg-gray-100 px-2 py-1 rounded">src/db/schema.ts</code> to see your generated schema.
                </p>
            </div>
        </div>
    )
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
