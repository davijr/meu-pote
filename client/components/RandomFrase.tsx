'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Frase } from '@/lib/types'
import { Shuffle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function RandomFrase() {
  const [frase, setFrase] = useState<Frase | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRandomFrase = async () => {
    try {
      setLoading(true)
      const response = await api.get('/frases/random')
      setFrase(response.data.frase)
    } catch (error) {
      toast.error('Erro ao buscar frase aleatória')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Frase do Momento</h3>
        <button
          onClick={fetchRandomFrase}
          disabled={loading}
          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
        </button>
      </div>

      {frase ? (
        <div className="space-y-3">
          <blockquote className="text-sm text-gray-700 leading-relaxed">
            "{frase.texto}"
          </blockquote>
          {frase.autor && (
            <p className="text-xs text-gray-500 italic">— {frase.autor}</p>
          )}
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="bg-gray-100 px-2 py-1 rounded">
              {frase.categoria}
            </span>
            <span>{frase.user.nome}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-3">
            Clique no botão acima para ver uma frase inspiradora!
          </p>
          <button
            onClick={fetchRandomFrase}
            disabled={loading}
            className="btn-primary text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Ver Frase Aleatória'
            )}
          </button>
        </div>
      )}
    </div>
  )
}