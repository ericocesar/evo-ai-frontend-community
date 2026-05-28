import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Switch,
} from '@evoapi/design-system';
import { useLanguage } from '@/hooks/useLanguage';

interface ViaCepConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: { enabled: boolean }) => void;
  onDeactivate?: () => void;
  initialConfig?: { enabled?: boolean };
}

const ViaCepConfigDialog = ({
  open,
  onOpenChange,
  onSave,
  onDeactivate,
  initialConfig,
}: ViaCepConfigDialogProps) => {
  const { t } = useLanguage('aiAgents');
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? false);

  useEffect(() => {
    if (open) {
      setEnabled(initialConfig?.enabled ?? false);
    }
  }, [open, initialConfig]);

  const handleSave = () => {
    onSave({ enabled });
    onOpenChange(false);
  };

  const handleDeactivate = () => {
    onDeactivate?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('edit.integrations.viaCep.configTitle') || 'Configurar ViaCEP'}
          </DialogTitle>
          <DialogDescription>
            {t('edit.integrations.viaCep.intro') ||
              'Ative a consulta de CEP para que o agente possa buscar endereços brasileiros automaticamente durante o atendimento.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t('edit.integrations.viaCep.toggleLabel') || 'Consulta de CEP'}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('edit.integrations.viaCep.toggleHint') ||
                  'Quando ativo, o agente pode consultar endereços pela API ViaCEP'}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              {t('edit.integrations.viaCep.info') ||
                'A API ViaCEP é pública e gratuita. Nenhuma chave ou credencial é necessária. O agente poderá consultar CEPs brasileiros e retornar endereço completo (logradouro, bairro, cidade, UF).'}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleSave} className="w-full">
              {t('edit.integrations.viaCep.apply') || 'SALVAR CONFIGURAÇÃO'}
            </Button>

            {onDeactivate && (
              <Button
                variant="ghost"
                onClick={handleDeactivate}
                className="w-full text-destructive hover:text-destructive/80"
              >
                {t('edit.integrations.viaCep.deactivate') || 'Desativar integração'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViaCepConfigDialog;
