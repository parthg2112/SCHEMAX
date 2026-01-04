import { createAuthClient } from "better-auth/react"
import { getBackendUrl } from "./api-url"

export const authClient = createAuthClient({
    baseURL: `${getBackendUrl()}/auth`
})
