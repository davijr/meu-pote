'use client';

import { useState } from 'react';
import { useNotifications } from '../lib/hooks/useNotifications';
import { toast } from 'react-hot-toast';

export default function NotificationSettings() {
  const { isSupported, isSubscribed, subscribeUser, unsubscribeUser, sendTestNotification } = useNotifications();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const success = await subscribeUser();
    if (success) {
      toast.success('Notificações ativadas com sucesso!');
    } else {
      toast.error('Erro ao ativar notificações');
    }
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    const success = await unsubscribeUser();
    if (success) {
      toast.success('Notificações desativadas');
    } else {
      toast.error('Erro ao desativar notificações');
    }
    setLoading(false);
  };

  const handleTestNotification = async () => {
    setLoading(true);
    const success = await sendTestNotification();
    if (success) {
      toast.success('Notificação de teste enviada!');
    } else {
      toast.error('Erro ao enviar notificação de teste');
    }
    setLoading(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Seu navegador não suporta notificações push.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Configurações de Notificações
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Notificações Push</p>
            <p className="text-sm text-gray-500">
              Receba notificações de frases agendadas
            </p>
          </div>
          
          <button
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isSubscribed
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            } disabled:opacity-50`}
          >
            {loading ? 'Processando...' : isSubscribed ? 'Desativar' : 'Ativar'}
          </button>
        </div>

        {isSubscribed && (
          <div className="pt-4 border-t">
            <button
              onClick={handleTestNotification}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Enviando...' : 'Enviar Notificação de Teste'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}