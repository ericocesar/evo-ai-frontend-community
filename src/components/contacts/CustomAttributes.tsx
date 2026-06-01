import CustomAttributesForm from '@/components/customAttributes/CustomAttributesForm';

interface CustomAttributesProps {
  attributes: Record<string, unknown>;
  onAttributesChange: (attributes: Record<string, unknown>) => void;
  disabled?: boolean;
}

/**
 * Declarative grid layout for the contact "Atributos" tab.
 * Each inner array is rendered as one row, side by side, in responsive
 * columns (1 col on mobile, N cols >= md where N = row length).
 *
 * Any defined `attribute_key` not present here falls through to a
 * single-column "Demais atributos" section below the grid.
 */
const CONTACT_FIELD_LAYOUT: string[][] = [
  ['nome_titular', 'cpf_titular', 'data_nascimento_titular'],
  ['tipo_ligacao', 'tipo_cliente', 'concessionaria', 'uc_numero'],
  ['cep', 'cidade', 'estado'],
];

/**
 * CustomAttributes component for contacts form.
 * Wrapper around the generic CustomAttributesForm component,
 * applying the contact-specific grid layout to defined attributes.
 */
export default function CustomAttributes({
  attributes,
  onAttributesChange,
  disabled = false,
}: CustomAttributesProps) {
  return (
    <CustomAttributesForm
      attributeModel="contact_attribute"
      attributes={attributes}
      mode="form"
      onAttributesChange={onAttributesChange}
      disabled={disabled}
      fieldLayout={CONTACT_FIELD_LAYOUT}
    />
  );
}
