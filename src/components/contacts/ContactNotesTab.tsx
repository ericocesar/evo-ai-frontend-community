import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useDateFormat } from '@/hooks/useDateFormat';
import { contactsService } from '@/services/contacts/contactsService';
import type { ContactNote } from '@/types/contacts';
import { Button, Textarea, ScrollArea } from '@evoapi/design-system';
import { Loader2, StickyNote, Trash2, User, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ContactNotesTabProps {
  contactId: string;
}

export default function ContactNotesTab({ contactId }: ContactNotesTabProps) {
  const { t } = useLanguage('contacts');
  const { formatDateTime } = useDateFormat();
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState('');

  const loadNotes = useCallback(async () => {
    if (!contactId) return;
    setIsLoading(true);
    try {
      const response = await contactsService.getContactNotes(contactId);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error loading contact notes:', error);
      toast.error(t('details.notes.loadError', 'Erro ao carregar notas'));
    } finally {
      setIsLoading(false);
    }
  }, [contactId, t]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const createdNote = await contactsService.createContactNote(contactId, newNote.trim());
      setNotes((prev) => [createdNote, ...prev]);
      setNewNote('');
      toast.success(t('details.notes.createSuccess', 'Nota adicionada com sucesso'));
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error(t('details.notes.createError', 'Erro ao adicionar nota'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await contactsService.deleteContactNote(contactId, noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast.success(t('details.notes.deleteSuccess', 'Nota excluída com sucesso'));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(t('details.notes.deleteError', 'Erro ao excluir nota'));
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 h-[450px]" data-testid="contact-notes-tab">
      {/* Form to add note */}
      <form onSubmit={handleAddNote} className="flex flex-col gap-3">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t('details.notes.placeholder', 'Escreva uma nota para este contato...')}
          className="min-h-[80px] resize-none"
          disabled={isSaving}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!newNote.trim() || isSaving} size="sm" className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t('details.notes.addButton', 'Adicionar Nota')}
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8 border border-dashed rounded-lg">
            <StickyNote className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">{t('details.notes.empty', 'Nenhuma nota registrada')}</p>
            <p className="text-xs mt-1">{t('details.notes.emptySub', 'Use o campo acima para criar a primeira nota.')}</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-3">
            <div className="flex flex-col gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* User Avatar fallback */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {note.user ? getInitials(note.user.name) : <User className="h-4 w-4" />}
                  </div>

                  {/* Note Body */}
                  <div className="flex-1 space-y-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {note.user?.name || t('details.notes.system', 'Sistema')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    title={t('details.notes.delete', 'Excluir Nota')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
