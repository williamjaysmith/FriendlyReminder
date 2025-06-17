'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDB() {
  const [status, setStatus] = useState('Testing...')
  const supabase = createClient()

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { error } = await supabase.from('profiles').select('count')
        
        if (error) {
          setStatus(`Database Error: ${error.message}`)
        } else {
          setStatus('✅ Database connection successful!')
        }
      } catch (err: unknown) {
        setStatus(`Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    testConnection()
  }, [supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  )
}