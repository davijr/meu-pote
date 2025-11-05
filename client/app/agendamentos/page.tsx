'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { Agendamento, Categoria } from '@/lib/types'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Plus, Clock, Calendar, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface AgendamentoForm {
  horario: string
  diasSemana: string[]
  categoria?: Categoria
  ativo: boolean
}

export default function AgendamentosPage() {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AgendamentoForm>()

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

  const diasSemanaOptions = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda' },
    { value: '2', label: 'Terça' },
    { value: '3', label: 'Quarta' },
    { value: '4', label: 'Quinta' },
    { value: '5', label: 'Sexta' },
    { value: '6', label: 'Sábado' },
  ]

  useEffect(() => {
    if (user) {
      fetchAgendamentos()
    }
  }, [user])

  const fetchAgendamentos = async () => {
    try {
      const response = await api.get('/schedules')
      setAgendamentos(response.data)
    } catch (error) {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: AgendamentoForm) => {
    try {
      setSubmitting(true)
      
      const payload = {
        ...data,
        categoria: data.categoria || null,
        diasSemana: data.diasSemana.map(Number)
      }

      if (editingId) {
        await api.put(`/schedules/${editingId}`, payload)
        toast.success('Agendamento atualizado com sucesso!')
      } else {
        await api.post('/schedules', payload)
        toast.success('Agendamento criado com sucesso!')
      }
      
      await fetchAgendamentos()
      handleCancel()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (agendamento: Agendamento) => {
    setEditingId(agendamento.id)
    setShowForm(true)
    reset({
      horario: agendamento.horario,
      diasSemana: agendamento.diasSemana.map(String),
      categoria: agendamento.categoria || '',
      ativo: agendamento.ativo
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    reset({
      horario: '',
      diasSemana: [],
      categoria: '',
      ativo: true
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return
    }

    try {
      await api.delete(`/schedules/${id}`)
      toast.success('Agendamento excluído com sucesso!')
      await fetchAgendamentos()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir agendamento')
    }
  }

  const toggleActive = async (id: number, ativo: boolean) => {
    try {
      await api.patch(`/schedules/${id}/toggle`, { ativo: !ativo })
      toast.success(`Agendamento ${!ativo ? 'ativado' : 'desativado'} com sucesso!`)
      await fetchAgendamentos()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar status')
    }
  }

  const formatDiasSemana = (dias: number[]) => {
    return dias
      .sort()
      .map(dia => diasSemanaOptions.find(d => d.value === String(dia))?.label)
      .join(', ')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Link>
              <h1 className="ml-6 text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-2">
                    Horário *
                  </label>
                  <input
                    {...register('horario', {
                      required: 'Horário é obrigatório',
                      pattern: {
                        value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                        message: 'Formato de horário inválido (HH:MM)'
                      }
                    })}
                    type="time"
                    className="input-field"
                  />
                  {errors.horario && (
                    <p className="mt-1 text-sm text-red-600">{errors.horario.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    {...register('categoria')}
                    className="input-field"
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias da Semana *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {diasSemanaOptions.map((dia) => (
                    <label key={dia.value} className="flex items-center space-x-2">
                      <input
                        {...register('diasSemana', {
                          required: 'Selecione pelo menos um dia'
                        })}
                        type="checkbox"
                        value={dia.value}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{dia.label}</span>
                    </label>
                  ))}
                </div>
                {errors.diasSemana && (
                  <p className="mt-1 text-sm text-red-600">{errors.diasSemana.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  {...register('ativo')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="text-sm text-gray-700">Agendamento ativo</label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingId ? 'Atualizar' : 'Criar'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-500 mb-6">Crie seu primeiro agendamento para receber frases inspiradoras.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Criar Agendamento
              </button>
            </div>
          ) : (
            agendamentos.map((agendamento) => (
              <div key={agendamento.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{agendamento.horario}</span>
                      </div>
                      {agendamento.categoria && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          {categorias.find(c => c.value === agendamento.categoria)?.label}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        agendamento.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agendamento.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDiasSemana(agendamento.diasSemana)}
                    </p>
                    {agendamento.ultimoEnvio && (
                      <p className="text-xs text-gray-500 mt-1">
                        Último envio: {new Date(agendamento.ultimoEnvio).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(agendamento.id, agendamento.ativo)}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        agendamento.ativo
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agendamento.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleEdit(agendamento)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(agendamento.id)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}