export const INVOICE_STATUS = {
  BORRADOR: 'borrador',
  EMITIDA: 'emitida',
  ENVIADA: 'enviada',
  NOTIFICADA: 'notificada',
  ACEPTADA: 'aceptada',
  RECHAZADA: 'rechazada',
  ANULADA: 'anulada'
} as const;

export type InvoiceStatusType = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

// Estados que permiten edición
export const EDITABLE_STATUSES: InvoiceStatusType[] = [
  INVOICE_STATUS.BORRADOR,
  INVOICE_STATUS.EMITIDA
];

// Estados que NO permiten edición (factura bloqueada)
export const NON_EDITABLE_STATUSES: InvoiceStatusType[] = [
  INVOICE_STATUS.ENVIADA,
  INVOICE_STATUS.NOTIFICADA,
  INVOICE_STATUS.ACEPTADA,
  INVOICE_STATUS.RECHAZADA,
  INVOICE_STATUS.ANULADA
];

// Estados que permiten anulación (solo antes de notificar al cliente)
export const CANCELLABLE_STATUSES: InvoiceStatusType[] = [
  INVOICE_STATUS.BORRADOR,
  INVOICE_STATUS.EMITIDA,
  INVOICE_STATUS.ENVIADA
];

// Estados que permiten auditoría (siempre disponible para ADMIN y ABOGADO)
export const AUDITABLE_STATUSES: InvoiceStatusType[] = [
  INVOICE_STATUS.BORRADOR,
  INVOICE_STATUS.EMITIDA,
  INVOICE_STATUS.ENVIADA,
  INVOICE_STATUS.NOTIFICADA,
  INVOICE_STATUS.ACEPTADA,
  INVOICE_STATUS.RECHAZADA,
  INVOICE_STATUS.ANULADA
];

// Función helper para verificar si una factura es editable
export const isInvoiceEditable = (status: string): boolean => {
  return EDITABLE_STATUSES.includes(status as InvoiceStatusType);
};

// Función helper para verificar si una factura permite auditoría
// Siempre disponible para ADMIN y ABOGADO, independientemente del estado
export const isInvoiceAuditable = (status: string): boolean => {
  return true; // Auditoría siempre disponible para ADMIN y ABOGADO
};

// Función helper para verificar si una factura puede ser anulada
export const isInvoiceCancellable = (status: string): boolean => {
  return CANCELLABLE_STATUSES.includes(status as InvoiceStatusType);
};

// Función helper para obtener el nombre legible del estado
export const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case INVOICE_STATUS.BORRADOR:
      return 'Borrador';
    case INVOICE_STATUS.EMITIDA:
      return 'Emitida';
    case INVOICE_STATUS.ENVIADA:
      return 'Enviada';
    case INVOICE_STATUS.NOTIFICADA:
      return 'Notificada al Cliente';
    case INVOICE_STATUS.ACEPTADA:
      return 'Aceptada';
    case INVOICE_STATUS.RECHAZADA:
      return 'Rechazada';
    case INVOICE_STATUS.ANULADA:
      return 'Anulada';
    default:
      return status;
  }
};

// Función helper para obtener el color del estado
export const getStatusColor = (status: string): string => {
  switch (status) {
    case INVOICE_STATUS.BORRADOR:
      return 'text-gray-600 bg-gray-100';
    case INVOICE_STATUS.EMITIDA:
      return 'text-blue-600 bg-blue-100';
    case INVOICE_STATUS.ENVIADA:
      return 'text-orange-600 bg-orange-100';
    case INVOICE_STATUS.NOTIFICADA:
      return 'text-purple-600 bg-purple-100';
    case INVOICE_STATUS.ACEPTADA:
      return 'text-green-600 bg-green-100';
    case INVOICE_STATUS.RECHAZADA:
      return 'text-red-600 bg-red-100';
    case INVOICE_STATUS.ANULADA:
      return 'text-red-800 bg-red-200';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Función helper para obtener el icono del estado
export const getStatusIcon = (status: string): string => {
  switch (status) {
    case INVOICE_STATUS.BORRADOR:
      return '📝';
    case INVOICE_STATUS.EMITIDA:
      return '📄';
    case INVOICE_STATUS.ENVIADA:
      return '📤';
    case INVOICE_STATUS.NOTIFICADA:
      return '📢';
    case INVOICE_STATUS.ACEPTADA:
      return '✅';
    case INVOICE_STATUS.RECHAZADA:
      return '❌';
    case INVOICE_STATUS.ANULADA:
      return '🚫';
    default:
      return '📋';
  }
}; 