import { Client, Account, Databases } from 'node-appwrite'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const client = new Client()

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  // Get session cookie - check various possible names
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  const session = cookieStore.get('appwrite-session') || 
                 cookieStore.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) ||
                 cookieStore.get('a_session') ||
                 allCookies.find(c => c.name.includes('session') || c.name.includes('appwrite'))
  
  console.log('🔧 Server: Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
  console.log('🔧 Server: Using session cookie:', session?.name)
  
  if (session) {
    client.setSession(session.value)
  }

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  }
}