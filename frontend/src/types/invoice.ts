export interface Invoice {
  id: string;
  numeroFactura: string;
  fechaEmision: string;
  fechaFactura?: string;
  tipoFactura: string;
  estado: string;
  receptorId: string;
  importeTotal: number;
  baseImponible: number;
  cuotaIVA: number;
  tipoIVA: number;
  regimenIvaEmisor: string;
  claveOperacion: string;
  metodoPago: string;
  fechaOperacion: string;
  items: InvoiceItem[];
  receptor?: { name: string; email: string };
  emisor?: { name: string; email: string };
  expediente?: { title: string };
  provisionFondos?: any[];
  createdAt: string;
  updatedAt: string;
  motivoAnulacion?: string;
  aplicarIVA?: boolean;
  retencion?: string;
  descuento?: number;
  tipoImpuesto?: string;
  selloTiempo?: string;
  emisorId?: string;
  expedienteId?: string;
  xml?: string;
  xmlFirmado?: string;
  paymentDate?: string;
  fechaVencimiento?: string;
  concepto?: string;
  observaciones?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
