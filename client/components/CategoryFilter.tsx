'use client'

import { Categoria } from '@/lib/types'

interface CategoryFilterProps {
  value: Categoria | ''
  onChange: (value: Categoria | '') => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const categorias = [
    { value: '', label: 'Todas as categorias' },
    { value: 'MOTIVACIONAL', label: 'Motivacional' },
    { value: 'INSPIRACIONAL', label: 'Inspiracional' },
    { value: 'REFLEXAO', label: 'Reflexão' },
    { value: 'AMOR', label: 'Amor' },
    { value: 'AMIZADE', label: 'Amizade' },
    { value: 'SUCESSO', label: 'Sucesso' },
    { value: 'VIDA', label: 'Vida' },
    { value: 'SABEDORIA', label: 'Sabedoria' },
  ]

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Categorias</h3>
      <div className="space-y-2">
        {categorias.map((categoria) => (
          <button
            key={categoria.value}
            onClick={() => onChange(categoria.value as Categoria | '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              value === categoria.value
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {categoria.label}
          </button>
        ))}
      </div>
    </div>
  )
}