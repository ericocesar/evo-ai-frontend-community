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

interface FaturaParserConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: { enabled: boolean }) => void;
  onDeactivate?: () => void;
  initialConfig?: { enabled?: boolean };
}

const FaturaParserConfigDialog = ({
  open,
  onOpenChange,
  onSave,
  onDeactivate,
  initialConfig,
}: FaturaParserConfigDialogProps) => {
  const { t } = useLanguage('aiAgents');
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? true);

  useEffect(() => {
    if (open) {
      setEnabled(initialConfig?.enabled ?? true);
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
            {t('edit.integrations.faturaParser.configTitle') || 'Configurar Leitor de Faturas'}
          </DialogTitle>
          <DialogDescription>
            {t('edit.integrations.faturaParser.intro') ||
              'Ative a leitura automática de faturas de energia para que o agente extraia os dados (valor, concessionária, consumo, vencimento) a partir de PDFs ou imagens enviados pelo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t('edit.integrations.faturaParser.toggleLabel') || 'Leitura de Faturas de Energia'}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('edit.integrations.faturaParser.toggleHint') ||
                  'Quando ativo, o agente pode extrair dados de faturas enviadas como PDF ou imagem'}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('edit.integrations.faturaParser.fieldsLabel') || 'Campos extraídos automaticamente:'}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('edit.integrations.faturaParser.field1') || 'Valor total da fatura (R$)'}</li>
              <li>{t('edit.integrations.faturaParser.field2') || 'Concessionária / Distribuidora'}</li>
              <li>{t('edit.integrations.faturaParser.field3') || 'Consumo em kWh'}</li>
              <li>{t('edit.integrations.faturaParser.field4') || 'Data de vencimento'}</li>
              <li>{t('edit.integrations.faturaParser.field5') || 'Código do cliente / instalação'}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleSave} className="w-full">
              {t('edit.integrations.faturaParser.apply') || 'SALVAR CONFIGURAÇÃO'}
            </Button>

            {onDeactivate && (
              <Button
                variant="ghost"
                onClick={handleDeactivate}
                className="w-full text-destructive hover:text-destructive/80"
              >
                {t('edit.integrations.faturaParser.deactivate') || 'Desativar integração'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaturaParserConfigDialog;
