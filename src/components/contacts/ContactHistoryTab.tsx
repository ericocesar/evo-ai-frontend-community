import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useDateFormat } from '@/hooks/useDateFormat';
import { contactsService } from '@/services/contacts/contactsService';
import type { ContactConversation } from '@/types/contacts';
import { Badge, ScrollArea } from '@evoapi/design-system';
import { Loader2, MessageSquare, Calendar, User, Clock, Inbox } from 'lucide-react';
import { toast } from 'sonner';

interface ContactHistoryTabProps {
  contactId: string;
}

export default function ContactHistoryTab({ contactId }: ContactHistoryTabProps) {
  const { t } = useLanguage('contacts');
  const { formatDateTime } = useDateFormat();
  const [conversations, setConversations] = useState<ContactConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!contactId) return;
    setIsLoading(true);
    try {
      const response = await contactsService.getContactConversations(contactId);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error loading contact conversation history:', error);
      toast.error(t('details.history.loadError', 'Erro ao carregar histórico de conversas'));
    } finally {
      setIsLoading(false);
    }
  }, [contactId, t]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'aberto':
        return 'success';
      case 'resolved':
      case 'resolvido':
        return 'secondary';
      case 'snoozed':
      case 'pendente':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return t('details.history.status.open', 'Aberto');
      case 'resolved':
        return t('details.history.status.resolved', 'Resolvido');
      case 'snoozed':
        return t('details.history.status.snoozed', 'Adiado');
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[450px]" data-testid="contact-history-tab">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          {t('details.history.subtitle', 'Histórico de Conversas')}
        </h4>
        {conversations.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {t('details.history.count', { count: conversations.length })}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8 border border-dashed rounded-lg">
            <Inbox className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">{t('details.history.empty', 'Nenhuma conversa anterior')}</p>
            <p className="text-xs mt-1">{t('details.history.emptySub', 'Este contato ainda não possui registros de conversas.')}</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-3">
            <div className="flex flex-col gap-4 pl-4 border-l border-border relative">
              {conversations.map((conv) => (
                <div key={conv.id} className="relative group">
                  {/* Bullet point on the timeline line */}
                  <div className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-border group-hover:bg-primary transition-colors border-2 border-background" />

                  {/* Conversation card */}
                  <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold truncate">
                          {conv.inbox?.name || t('details.history.unknownInbox', 'Canal Desconhecido')}
                        </span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(conv.status)} className="text-[10px] shrink-0 font-medium">
                        {getStatusLabel(conv.status)}
                      </Badge>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span>
                          {t('details.history.created', 'Iniciada:')} {formatDateTime(conv.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span>
                          {t('details.history.lastActivity', 'Atividade:')} {formatDateTime(conv.last_activity_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <User className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span>
                          {conv.assignee?.name
                            ? t('details.history.assignedTo', 'Atribuída a: {{name}}', { name: conv.assignee.name })
                            : t('details.history.unassigned', 'Sem atribuição')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom message count status */}
                    <div className="flex items-center justify-between border-t pt-2 mt-1 text-[11px] text-muted-foreground">
                      <span>
                        {t('details.history.messagesCount', 'Total de mensagens: {{count}}', {
                          count: conv.messages_count,
                        })}
                      </span>
                      <span className="text-xs text-primary group-hover:underline">
                        ID: #{conv.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
