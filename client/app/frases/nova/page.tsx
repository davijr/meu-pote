'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { Categoria } from '@/lib/types'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FraseForm {
  texto: string
  autor?: string
  categoria: Categoria
}

export default function NovaFrasePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FraseForm>()

  const categorias = [
    { value: 'MOTIVACIONAL', label: 'Motivacional' },
    { value: 'INSPIRACIONAL', label: 'Inspiracional' },
    { value: 'REFLEXAO', label: 'Reflexão' },
    { value: 'AMOR', label: 'Amor' },
    { value: 'AMIZADE', label: 'Amizade' },
    { value: 'SUCESSO', label: 'Sucesso' },
    { value: 'VIDA', label: 'Vida' },
    { value: 'SABEDORIA', label: 'Sabedoria' },
  ]

  const onSubmit = async (data: FraseForm) => {
    try {
      setLoading(true)
      await api.post('/frases', data)
      toast.success('Frase criada com sucesso!')
      router.push('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar frase')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
            <h1 className="ml-6 text-2xl font-bold text-gray-900">Nova Frase</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-2">
                Texto da Frase *
              </label>
              <textarea
                {...register('texto', {
                  required: 'Texto da frase é obrigatório',
                  minLength: {
                    value: 10,
                    message: 'Frase deve ter pelo menos 10 caracteres'
                  },
                  maxLength: {
                    value: 500,
                    message: 'Frase deve ter no máximo 500 caracteres'
                  }
                })}
                rows={4}
                className="input-field resize-none"
                placeholder="Digite sua frase inspiradora..."
              />
              {errors.texto && (
                <p className="mt-1 text-sm text-red-600">{errors.texto.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-2">
                Autor (opcional)
              </label>
              <input
                {...register('autor', {
                  maxLength: {
                    value: 100,
                    message: 'Nome do autor deve ter no máximo 100 caracteres'
                  }
                })}
                type="text"
                className="input-field"
                placeholder="Nome do autor da frase"
              />
              {errors.autor && (
                <p className="mt-1 text-sm text-red-600">{errors.autor.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                {...register('categoria', {
                  required: 'Categoria é obrigatória'
                })}
                className="input-field"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/" className="btn-secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Criar Frase</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}