export const getBackendUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use internal docker network url
    return process.env.INTERNAL_BACKEND_URL || "http://localhost:3001";
  }
  // Client-side: use public url (which will be /api in docker)
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
};
