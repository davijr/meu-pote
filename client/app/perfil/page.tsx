'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { UserStats } from '@/lib/types'
import { toast } from 'react-hot-toast'
import { ArrowLeft, User, Eye, Heart, Calendar, Loader2, Edit2, Save, X } from 'lucide-react'
import Link from 'next/link'
import NotificationSettings from '@/components/NotificationSettings'

interface ProfileForm {
  nome: string
  email: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function PerfilPage() {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProfileForm>()

  const newPassword = watch('newPassword')

  useEffect(() => {
    if (user) {
      reset({
        nome: user.nome,
        email: user.email
      })
      fetchStats()
    }
  }, [user, reset])

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats')
      setStats(response.data)
    } catch (error) {
      toast.error('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    try {
      setUpdating(true)
      
      const updateData: any = {
        nome: data.nome,
        email: data.email
      }

      if (data.newPassword) {
        if (!data.currentPassword) {
          toast.error('Senha atual é obrigatória para alterar a senha')
          return
        }
        updateData.currentPassword = data.currentPassword
        updateData.newPassword = data.newPassword
      }

      const response = await api.put('/users/profile', updateData)
      updateUser(response.data.user)
      toast.success('Perfil atualizado com sucesso!')
      setEditing(false)
      reset({
        nome: response.data.user.nome,
        email: response.data.user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    reset({
      nome: user?.nome,
      email: user?.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
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
            <h1 className="ml-6 text-2xl font-bold text-gray-900">Meu Perfil</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    {...register('nome', {
                      required: 'Nome é obrigatório',
                      minLength: {
                        value: 2,
                        message: 'Nome deve ter pelo menos 2 caracteres'
                      }
                    })}
                    type="text"
                    disabled={!editing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    type="email"
                    disabled={!editing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {editing && (
                  <>
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Senha Atual
                          </label>
                          <input
                            {...register('currentPassword')}
                            type="password"
                            className="input-field"
                            placeholder="Digite sua senha atual"
                          />
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                          </label>
                          <input
                            {...register('newPassword', {
                              minLength: newPassword ? {
                                value: 6,
                                message: 'Nova senha deve ter pelo menos 6 caracteres'
                              } : undefined
                            })}
                            type="password"
                            className="input-field"
                            placeholder="Digite sua nova senha"
                          />
                          {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                          </label>
                          <input
                            {...register('confirmPassword', {
                              validate: newPassword ? (value) =>
                                value === newPassword || 'Senhas não coincidem'
                              : undefined
                            })}
                            type="password"
                            className="input-field"
                            placeholder="Confirme sua nova senha"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={updating}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Salvar Alterações</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Estatísticas</h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Total de Visualizações</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.totalVisualizacoes}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Total de Curtidas</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.totalCurtidas}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Agendamentos Ativos</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.agendamentosAtivos}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Erro ao carregar estatísticas</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Link href="/frases/nova" className="btn-primary w-full text-center">
                  Nova Frase
                </Link>
                <Link href="/agendamentos" className="btn-secondary w-full text-center">
                  Meus Agendamentos
                </Link>
              </div>
            </div>

            <NotificationSettings />
          </div>
        </div>
      </main>
    </div>
  )
}