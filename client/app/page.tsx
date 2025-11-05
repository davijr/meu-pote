'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { api } from '@/lib/api'
import { Frase, Categoria } from '@/lib/types'
import { RandomFrase } from '@/components/RandomFrase'
import { SearchBar } from '@/components/SearchBar'
import { CategoryFilter } from '@/components/CategoryFilter'
import { FraseCard } from '@/components/FraseCard'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [frases, setFrases] = useState<Frase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Categoria | ''>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchFrases(true)
  }, [user, searchTerm, selectedCategory])

  const fetchFrases = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setLoadingMore(true)
      }

      const currentPage = reset ? 1 : page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { categoria: selectedCategory })
      })

      const response = await api.get(`/frases?${params}`)
      const newFrases = response.data.frases

      if (reset) {
        setFrases(newFrases)
      } else {
        setFrases(prev => [...prev, ...newFrases])
      }

      setHasMore(newFrases.length === 10)
      if (!reset) {
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error('Erro ao buscar frases:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLike = async (fraseId: number) => {
    try {
      await api.post(`/frases/${fraseId}/curtir`)
      setFrases(prev => prev.map(frase => 
        frase.id === fraseId 
          ? { ...frase, curtidas: frase.curtidas + 1, curtidaPeloUsuario: true }
          : frase
      ))
    } catch (error) {
      console.error('Erro ao curtir frase:', error)
    }
  }

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchFrases(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user.nome}!
          </h1>
          <p className="text-gray-600">
            Descubra frases inspiradoras para o seu dia
          </p>
        </div>

        <RandomFrase />

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Todas as Frases</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar frases..."
              />
            </div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : frases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma frase encontrada</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || selectedCategory 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Seja o primeiro a adicionar uma frase!'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 mb-8">
                {frases.map((frase) => (
                  <FraseCard
                    key={frase.id}
                    frase={frase}
                    onLike={handleLike}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-secondary flex items-center space-x-2 mx-auto"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Carregar mais</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}