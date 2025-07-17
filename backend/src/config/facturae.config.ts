export interface FacturaeConfig {
  // Rutas de certificados
  certificatePath: string;
  privateKeyPath: string;
  
  // Servicios externos
  tsaUrl?: string;
  ocspUrl?: string;
  
  // Configuración de firma
  xadesLevel: 'BES' | 'T' | 'C' | 'X' | 'XL';
  
  // Rutas de salida
  outputPath: string;
  
  // Configuración de validación
  strictValidation: boolean;
  
  // Configuración de logs
  enableLogs: boolean;
}

export const getFacturaeConfig = (): FacturaeConfig => {
  return {
    // Rutas de certificados
    certificatePath: process.env.FACTURAE_CERT_PATH || './certs/certificate.pem',
    privateKeyPath: process.env.FACTURAE_KEY_PATH || './certs/private_key.pem',
    
    // Servicios externos
    tsaUrl: process.env.FACTURAE_TSA_URL,
    ocspUrl: process.env.FACTURAE_OCSP_URL,
    
    // Configuración de firma
    xadesLevel: (process.env.FACTURAE_XADES_LEVEL as any) || 'BES',
    
    // Rutas de salida
    outputPath: process.env.FACTURAE_OUTPUT_PATH || './output',
    
    // Configuración de validación
    strictValidation: process.env.FACTURAE_STRICT_VALIDATION === 'true',
    
    // Configuración de logs
    enableLogs: process.env.FACTURAE_ENABLE_LOGS !== 'false',
  };
};

export const validateFacturaeConfig = (config: FacturaeConfig): string[] => {
  const errors: string[] = [];

  // Validar rutas de certificados
  if (!config.certificatePath) {
    errors.push('FACTURAE_CERT_PATH no está configurado');
  }
  
  if (!config.privateKeyPath) {
    errors.push('FACTURAE_KEY_PATH no está configurado');
  }

  // Validar nivel XAdES
  const validXAdESLevels = ['BES', 'T', 'C', 'X', 'XL'];
  if (!validXAdESLevels.includes(config.xadesLevel)) {
    errors.push(`FACTURAE_XADES_LEVEL debe ser uno de: ${validXAdESLevels.join(', ')}`);
  }

  // Validar URLs si están configuradas
  if (config.tsaUrl && !isValidUrl(config.tsaUrl)) {
    errors.push('FACTURAE_TSA_URL no es una URL válida');
  }

  if (config.ocspUrl && !isValidUrl(config.ocspUrl)) {
    errors.push('FACTURAE_OCSP_URL no es una URL válida');
  }

  return errors;
};

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Configuración por defecto para desarrollo
export const getDefaultFacturaeConfig = (): FacturaeConfig => {
  return {
    certificatePath: './certs/certificate.pem',
    privateKeyPath: './certs/private_key.pem',
    xadesLevel: 'BES',
    outputPath: './output',
    strictValidation: false,
    enableLogs: true,
  };
}; 