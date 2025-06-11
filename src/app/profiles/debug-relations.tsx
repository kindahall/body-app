'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'

export default function DebugRelations() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const runDiagnostic = async () => {
    if (!user?.id) {
      setDebugInfo({ error: 'Pas d\'utilisateur connecté' })
      return
    }

    try {
      // 1. Récupérer les données directement depuis Supabase
      const { data: relationships, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setDebugInfo({ error: `Erreur Supabase: ${error.message}` })
        return
      }

      // 2. Analyser les types
      const typeAnalysis = relationships?.reduce((acc: any, rel: any) => {
        const type = rel.type
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      // 3. Test de filtrage
      const testFilters = ['romantic', 'sexual', 'friend', 'friendzone', 'other']
      const filterResults: any = {}
      
      testFilters.forEach(filter => {
        filterResults[filter] = relationships?.filter(r => r.type === filter) || []
      })

      // 4. Examiner les valeurs exactes
      const exactValues = relationships?.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        typeOf: typeof r.type,
        length: r.type?.length,
        charCodes: r.type?.split('').map((c: string) => c.charCodeAt(0))
      }))

      setDebugInfo({
        totalRelations: relationships?.length || 0,
        typeAnalysis,
        filterResults: Object.entries(filterResults).map(([filter, results]) => ({
          filter,
          count: (results as any[]).length,
          names: (results as any[]).map(r => r.name)
        })),
        exactValues,
        sampleRelation: relationships?.[0] || null
      })

    } catch (error: any) {
      setDebugInfo({ error: `Erreur inattendue: ${error.message}` })
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl border border-white/40 shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-900">🔍 Diagnostic des Relations</h3>
      
      <button
        onClick={runDiagnostic}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
      >
        Lancer le diagnostic
      </button>

      {debugInfo && (
        <div className="space-y-4">
          {debugInfo.error ? (
            <div className="bg-red-100 border border-red-300 p-3 rounded-lg">
              <p className="text-red-700">{debugInfo.error}</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-100 border border-blue-300 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-900">Statistiques générales</h4>
                <p>Total des relations: {debugInfo.totalRelations}</p>
              </div>

              <div className="bg-green-100 border border-green-300 p-3 rounded-lg">
                <h4 className="font-semibold text-green-900">Analyse des types</h4>
                <pre className="text-sm text-green-800">{JSON.stringify(debugInfo.typeAnalysis, null, 2)}</pre>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg">
                <h4 className="font-semibold text-yellow-900">Résultats de filtrage</h4>
                {debugInfo.filterResults.map((result: any) => (
                  <div key={result.filter} className="mb-2">
                    <strong>{result.filter}:</strong> {result.count} relation(s)
                    {result.names.length > 0 && (
                      <span className="ml-2 text-sm">({result.names.join(', ')})</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-purple-100 border border-purple-300 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-900">Valeurs exactes</h4>
                <div className="max-h-40 overflow-y-auto">
                  <pre className="text-xs text-purple-800">{JSON.stringify(debugInfo.exactValues, null, 2)}</pre>
                </div>
              </div>

              {debugInfo.sampleRelation && (
                <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Exemple de relation</h4>
                  <pre className="text-xs text-gray-800">{JSON.stringify(debugInfo.sampleRelation, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}