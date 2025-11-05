'use client'

import { Frase } from '@/lib/types'
import { Heart, Eye, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FraseCardProps {
  frase: Frase
  onLike: () => void
}

export function FraseCard({ frase, onLike }: FraseCardProps) {
  const getCategoriaColor = (categoria: string) => {
    const colors = {
      MOTIVACIONAL: 'bg-blue-100 text-blue-800',
      INSPIRACIONAL: 'bg-purple-100 text-purple-800',
      REFLEXAO: 'bg-green-100 text-green-800',
      AMOR: 'bg-red-100 text-red-800',
      AMIZADE: 'bg-yellow-100 text-yellow-800',
      SUCESSO: 'bg-indigo-100 text-indigo-800',
      VIDA: 'bg-pink-100 text-pink-800',
      SABEDORIA: 'bg-gray-100 text-gray-800',
    }
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoriaColor(frase.categoria)}`}>
          {frase.categoria}
        </span>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{frase._count.visualizacoes}</span>
          </div>
          <button
            onClick={onLike}
            className="flex items-center space-x-1 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span>{frase._count.curtidas}</span>
          </button>
        </div>
      </div>

      <blockquote className="text-lg text-gray-800 mb-4 leading-relaxed">
        "{frase.texto}"
      </blockquote>

      {frase.autor && (
        <p className="text-sm text-gray-600 mb-4 italic">— {frase.autor}</p>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{frase.user.nome}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(frase.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      </div>
    </div>
  )
}