import { Client, Account, Databases, ID } from 'appwrite'

const client = new Client()

// Only initialize client if environment variables are available
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

if (endpoint && projectId) {
  client
    .setEndpoint(endpoint)
    .setProject(projectId)
}

// Only restore session if it exists and is valid
if (typeof window !== 'undefined' && projectId) {
  const storedSession = localStorage.getItem('appwrite-session')
  if (storedSession && storedSession !== 'undefined' && storedSession !== 'null') {
    try {
      client.setSession(storedSession)
      // Also set a cookie for middleware detection
      document.cookie = `a_session_${projectId}=${storedSession}; path=/; SameSite=Lax`
      console.log('🔄 Restored session from localStorage')
    } catch {
      console.log('⚠️ Failed to restore session, clearing stored data')
      localStorage.removeItem('appwrite-session')
      document.cookie = `a_session_${projectId}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
    }
  }
}

export const account = new Account(client)
export const databases = new Databases(client)

export { client, ID }
