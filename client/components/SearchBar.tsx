'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Buscar Frases</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-10"
        />
      </div>
    </div>
  )
}