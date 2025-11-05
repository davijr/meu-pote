export interface User {
  id: string
  nome: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Frase {
  id: string
  texto: string
  autor?: string
  categoria: Categoria
  ativa: boolean
  userId: string
  user: User
  visualizacoes: Visualizacao[]
  curtidas: Curtida[]
  _count: {
    visualizacoes: number
    curtidas: number
  }
  createdAt: string
  updatedAt: string
}

export interface Visualizacao {
  id: string
  userId: string
  fraseId: string
  createdAt: string
}

export interface Curtida {
  id: string
  userId: string
  fraseId: string
  createdAt: string
}

export interface Agendamento {
  id: string
  userId: string
  horario: string
  diasSemana: string[]
  categoria?: Categoria
  ativo: boolean
  ultimoEnvio?: string
  createdAt: string
  updatedAt: string
}

export interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export enum Categoria {
  MOTIVACIONAL = 'MOTIVACIONAL',
  INSPIRACIONAL = 'INSPIRACIONAL',
  REFLEXAO = 'REFLEXAO',
  AMOR = 'AMOR',
  AMIZADE = 'AMIZADE',
  SUCESSO = 'SUCESSO',
  VIDA = 'VIDA',
  SABEDORIA = 'SABEDORIA'
}

export interface UserStats {
  totalVisualizacoes: number
  totalCurtidas: number
  agendamentosAtivos: number
  visualizacoesRecentes: Visualizacao[]
  curtidasRecentes: Curtida[]
}