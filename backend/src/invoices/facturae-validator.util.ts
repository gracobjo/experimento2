import { DOMParser } from 'xmldom';
// xmldom no exporta tipos TS, así que usamos 'any' para Document y Element
// Alternativamente, podrías usar: import type { Document, Element } from "@types/xmldom";
type XmlDomDocument = any;
type XmlDomElement = any;
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FacturaeValidationOptions {
  validateSchema?: boolean;
  validateBusinessRules?: boolean;
  validateForExternalSystems?: boolean;
  strictMode?: boolean;
}

export interface ExternalSystemValidation {
  system: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requirements: string[];
}

export class FacturaeValidator {
  private static readonly FACTURAE_SCHEMA_URL = 'http://www.facturae.es/Facturae/2014/v3.2.2/Facturae';
  private static readonly FACTURAE_SCHEMA_PATH = path.join(__dirname, '../../schemas/facturae_3.2.2.xsd');
  
  /**
   * Valida un XML Facturae contra el esquema XSD y reglas de negocio
   */
  static validateXML(xmlContent: string, options: FacturaeValidationOptions = {}): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Parsear el XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Validar sintaxis XML básica
      const parseErrors = this.validateXMLSyntax(xmlDoc);
      if (parseErrors.length > 0) {
        result.errors.push(...parseErrors);
        result.isValid = false;
        return result;
      }

      // Validar estructura básica
      const structureErrors = this.validateBasicStructure(xmlDoc);
      if (structureErrors.length > 0) {
        result.errors.push(...structureErrors);
        result.isValid = false;
      }

      // Validar esquema XSD si está habilitado
      if (options.validateSchema !== false) {
        const schemaErrors = this.validateAgainstSchema(xmlDoc);
        if (schemaErrors.length > 0) {
          result.errors.push(...schemaErrors);
          result.isValid = false;
        }
      }

      // Validar reglas de negocio si está habilitado
      if (options.validateBusinessRules !== false) {
        const businessErrors = this.validateBusinessRules(xmlDoc);
        if (businessErrors.length > 0) {
          if (options.strictMode) {
            result.errors.push(...businessErrors);
            result.isValid = false;
          } else {
            result.warnings.push(...businessErrors);
          }
        }
      }

      // Validar para sistemas externos si está habilitado
      if (options.validateForExternalSystems) {
        const externalErrors = this.validateForExternalSystems(xmlDoc);
        if (externalErrors.length > 0) {
          result.warnings.push(...externalErrors);
        }
      }

    } catch (error) {
      result.errors.push(`Error de validación: ${error instanceof Error ? error.message : String(error)}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Valida un XML para envío a sistemas externos específicos
   */
  static validateForExternalSystem(xmlContent: string, system: 'AEAT' | 'FACE' | 'GENERAL'): ExternalSystemValidation {
    const result: ExternalSystemValidation = {
      system,
      isValid: true,
      errors: [],
      warnings: [],
      requirements: []
    };

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      switch (system) {
        case 'AEAT':
          this.validateForAEAT(xmlDoc, result);
          break;
        case 'FACE':
          this.validateForFACE(xmlDoc, result);
          break;
        case 'GENERAL':
          this.validateForGeneral(xmlDoc, result);
          break;
      }

    } catch (error) {
      result.errors.push(`Error de validación para ${system}: ${error instanceof Error ? error.message : String(error)}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validaciones específicas para AEAT
   */
  private static validateForAEAT(xmlDoc: XmlDomDocument, result: ExternalSystemValidation): void {
    result.requirements = [
      'Certificado digital válido',
      'Firma XAdES-BES o superior',
      'NIF/CIF válido del emisor',
      'NIF/CIF válido del receptor',
      'Totales coherentes',
      'Fecha de emisión válida'
    ];

    // Verificar certificado
    const certificates = xmlDoc.getElementsByTagName('ds:X509Certificate');
    if (certificates.length === 0) {
      result.errors.push('AEAT requiere certificado digital válido');
      result.isValid = false;
    }

    // Verificar firma
    const signatures = xmlDoc.getElementsByTagName('ds:Signature');
    if (signatures.length === 0) {
      result.errors.push('AEAT requiere firma digital');
      result.isValid = false;
    }

    // Verificar NIF del emisor
    const sellerNIF = xmlDoc.getElementsByTagName('TaxIdentificationNumber')[0]?.textContent;
    if (!sellerNIF || !this.isValidNIF(sellerNIF)) {
      result.errors.push('NIF del emisor no válido para AEAT');
      result.isValid = false;
    }

    // Verificar NIF del receptor
    const buyerNIF = xmlDoc.getElementsByTagName('TaxIdentificationNumber')[1]?.textContent;
    if (!buyerNIF || !this.isValidNIF(buyerNIF)) {
      result.errors.push('NIF del receptor no válido para AEAT');
      result.isValid = false;
    }

    // Verificar totales
    const invoiceTotal = xmlDoc.getElementsByTagName('InvoiceTotal')[0]?.textContent;
    if (!invoiceTotal || parseFloat(invoiceTotal) <= 0) {
      result.errors.push('Total de factura debe ser mayor que 0 para AEAT');
      result.isValid = false;
    }

    // Verificar fecha
    const issueDate = xmlDoc.getElementsByTagName('IssueDate')[0]?.textContent;
    if (!issueDate || !this.isValidDate(issueDate)) {
      result.errors.push('Fecha de emisión no válida para AEAT');
      result.isValid = false;
    }

    // Verificar que la fecha no sea futura
    const issueDateObj = new Date(issueDate);
    if (issueDateObj > new Date()) {
      result.errors.push('Fecha de emisión no puede ser futura para AEAT');
      result.isValid = false;
    }
  }

  /**
   * Validaciones específicas para FACE
   */
  private static validateForFACE(xmlDoc: XmlDomDocument, result: ExternalSystemValidation): void {
    result.requirements = [
      'Certificado digital válido',
      'Firma XAdES-T o superior',
      'NIF/CIF válido del emisor',
      'NIF/CIF válido del receptor',
      'Totales coherentes',
      'Fecha de emisión válida',
      'Sello de tiempo TSA'
    ];

    // Verificar certificado
    const certificates = xmlDoc.getElementsByTagName('ds:X509Certificate');
    if (certificates.length === 0) {
      result.errors.push('FACE requiere certificado digital válido');
      result.isValid = false;
    }

    // Verificar firma XAdES-T
    const timeStamps = xmlDoc.getElementsByTagName('xades:SignatureTimeStamp');
    if (timeStamps.length === 0) {
      result.errors.push('FACE requiere firma XAdES-T con sello de tiempo');
      result.isValid = false;
    }

    // Verificar NIF del emisor
    const sellerNIF = xmlDoc.getElementsByTagName('TaxIdentificationNumber')[0]?.textContent;
    if (!sellerNIF || !this.isValidNIF(sellerNIF)) {
      result.errors.push('NIF del emisor no válido para FACE');
      result.isValid = false;
    }

    // Verificar NIF del receptor
    const buyerNIF = xmlDoc.getElementsByTagName('TaxIdentificationNumber')[1]?.textContent;
    if (!buyerNIF || !this.isValidNIF(buyerNIF)) {
      result.errors.push('NIF del receptor no válido para FACE');
      result.isValid = false;
    }

    // Verificar totales
    const invoiceTotal = xmlDoc.getElementsByTagName('InvoiceTotal')[0]?.textContent;
    if (!invoiceTotal || parseFloat(invoiceTotal) <= 0) {
      result.errors.push('Total de factura debe ser mayor que 0 para FACE');
      result.isValid = false;
    }

    // Verificar fecha
    const issueDate = xmlDoc.getElementsByTagName('IssueDate')[0]?.textContent;
    if (!issueDate || !this.isValidDate(issueDate)) {
      result.errors.push('Fecha de emisión no válida para FACE');
      result.isValid = false;
    }

    // Verificar que la fecha no sea futura
    const issueDateObj = new Date(issueDate);
    if (issueDateObj > new Date()) {
      result.errors.push('Fecha de emisión no puede ser futura para FACE');
      result.isValid = false;
    }

    // Verificar sello de tiempo
    const encapsulatedTimeStamp = xmlDoc.getElementsByTagName('xades:EncapsulatedTimeStamp');
    if (encapsulatedTimeStamp.length === 0) {
      result.errors.push('FACE requiere sello de tiempo TSA');
      result.isValid = false;
    }
  }

  /**
   * Validaciones generales para sistemas externos
   */
  private static validateForGeneral(xmlDoc: XmlDomDocument, result: ExternalSystemValidation): void {
    result.requirements = [
      'Certificado digital válido',
      'Firma digital válida',
      'NIF/CIF válido del emisor',
      'NIF/CIF válido del receptor',
      'Totales coherentes',
      'Fecha de emisión válida'
    ];

    // Verificar certificado
    const certificates = xmlDoc.getElementsByTagName('ds:X509Certificate');
    if (certificates.length === 0) {
      result.errors.push('Sistema requiere certificado digital válido');
      result.isValid = false;
    }

    // Verificar firma
    const signatures = xmlDoc.getElementsByTagName('ds:Signature');
    if (signatures.length === 0) {
      result.errors.push('Sistema requiere firma digital');
      result.isValid = false;
    }

    // Verificar NIF del emisor
    const sellerNIF = xmlDoc.getElementsByTagName('TaxIdentificationNumber')[0]?.textContent;
    if (!sellerNIF || !this.isValidNIF(sellerNIF)) {
      result.errors.push('NIF del emisor no válido');
      result.isValid = false;
    }

    // Verificar NIF del receptor
    const buyerNIF = xmlDoc.getElementsByTagName('TaxIdentificationNumber')[1]?.textContent;
    if (!buyerNIF || !this.isValidNIF(buyerNIF)) {
      result.errors.push('NIF del receptor no válido');
      result.isValid = false;
    }

    // Verificar totales
    const invoiceTotal = xmlDoc.getElementsByTagName('InvoiceTotal')[0]?.textContent;
    if (!invoiceTotal || parseFloat(invoiceTotal) <= 0) {
      result.errors.push('Total de factura debe ser mayor que 0');
      result.isValid = false;
    }

    // Verificar fecha
    const issueDate = xmlDoc.getElementsByTagName('IssueDate')[0]?.textContent;
    if (!issueDate || !this.isValidDate(issueDate)) {
      result.errors.push('Fecha de emisión no válida');
      result.isValid = false;
    }
  }

  /**
   * Validaciones para sistemas externos (método general)
   */
  private static validateForExternalSystems(xmlDoc: XmlDomDocument): string[] {
    const warnings: string[] = [];

    // Verificar que hay al menos un item
    const items = xmlDoc.getElementsByTagName('InvoiceLine');
    if (items.length === 0) {
      warnings.push('Sistemas externos requieren al menos un item en la factura');
    }

    // Verificar descripción de items
    for (let i = 0; i < items.length; i++) {
      const itemDescription = items[i].getElementsByTagName('ItemDescription')[0]?.textContent;
      if (!itemDescription || itemDescription.trim().length < 3) {
        warnings.push(`Item ${i + 1} debe tener una descripción válida`);
      }
    }

    // Verificar que el emisor tiene dirección completa
    const sellerAddress = xmlDoc.getElementsByTagName('Address')[0];
    if (sellerAddress) {
      const postCode = sellerAddress.getElementsByTagName('PostCode')[0]?.textContent;
      const town = sellerAddress.getElementsByTagName('Town')[0]?.textContent;
      const province = sellerAddress.getElementsByTagName('Province')[0]?.textContent;
      
      if (!postCode || !town || !province) {
        warnings.push('Sistemas externos requieren dirección completa del emisor');
      }
    }

    // Verificar que el receptor tiene dirección completa
    const buyerAddress = xmlDoc.getElementsByTagName('Address')[1];
    if (buyerAddress) {
      const postCode = buyerAddress.getElementsByTagName('PostCode')[0]?.textContent;
      const town = buyerAddress.getElementsByTagName('Town')[0]?.textContent;
      const province = buyerAddress.getElementsByTagName('Province')[0]?.textContent;
      
      if (!postCode || !town || !province) {
        warnings.push('Sistemas externos requieren dirección completa del receptor');
      }
    }

    return warnings;
  }

  /**
   * Valida la sintaxis XML básica
   */
  private static validateXMLSyntax(xmlDoc: XmlDomDocument): string[] {
    const errors: string[] = [];

    // Verificar si hay errores de parsing
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      errors.push('El XML contiene errores de sintaxis');
    }

    // Verificar que el documento tiene un elemento raíz
    if (!xmlDoc.documentElement) {
      errors.push('El documento XML no tiene un elemento raíz');
    }

    return errors;
  }

  /**
   * Valida la estructura básica del documento Facturae
   */
  private static validateBasicStructure(xmlDoc: XmlDomDocument): string[] {
    const errors: string[] = [];

    // Verificar elemento raíz
    const rootElement = xmlDoc.documentElement;
    if (!rootElement || rootElement.nodeName !== 'Facturae') {
      errors.push('El elemento raíz debe ser "Facturae"');
    }

    // Verificar namespace
    const namespace = rootElement?.getAttribute('xmlns');
    if (namespace !== this.FACTURAE_SCHEMA_URL) {
      errors.push(`Namespace incorrecto. Esperado: ${this.FACTURAE_SCHEMA_URL}, Encontrado: ${namespace}`);
    }

    // Verificar elementos obligatorios
    const requiredElements = ['FileHeader', 'Parties', 'Invoices'];
    for (const elementName of requiredElements) {
      const element = xmlDoc.getElementsByTagName(elementName);
      if (element.length === 0) {
        errors.push(`Elemento obligatorio "${elementName}" no encontrado`);
      }
    }

    // Verificar estructura de FileHeader
    const fileHeader = xmlDoc.getElementsByTagName('FileHeader')[0];
    if (fileHeader) {
      const headerElements = ['SchemaVersion', 'Modality', 'DocumentType'];
      for (const elementName of headerElements) {
        const element = fileHeader.getElementsByTagName(elementName);
        if (element.length === 0) {
          errors.push(`Elemento obligatorio "${elementName}" no encontrado en FileHeader`);
        }
      }
    }

    // Verificar estructura de Parties
    const parties = xmlDoc.getElementsByTagName('Parties')[0];
    if (parties) {
      const partyElements = ['SellerParty', 'BuyerParty'];
      for (const elementName of partyElements) {
        const element = parties.getElementsByTagName(elementName);
        if (element.length === 0) {
          errors.push(`Elemento obligatorio "${elementName}" no encontrado en Parties`);
        }
      }
    }

    // Verificar estructura de Invoices
    const invoices = xmlDoc.getElementsByTagName('Invoices')[0];
    if (invoices) {
      const invoiceElements = xmlDoc.getElementsByTagName('Invoice');
      if (invoiceElements.length === 0) {
        errors.push('Debe haber al menos una factura en el documento');
      } else {
        // Verificar estructura de cada factura
        for (let i = 0; i < invoiceElements.length; i++) {
          const invoice = invoiceElements[i];
          const invoiceRequiredElements = ['InvoiceHeader', 'InvoiceIssueData', 'InvoiceTotals'];
          for (const elementName of invoiceRequiredElements) {
            const element = invoice.getElementsByTagName(elementName);
            if (element.length === 0) {
              errors.push(`Elemento obligatorio "${elementName}" no encontrado en la factura ${i + 1}`);
            }
          }
        }
      }
    }

    return errors;
  }

  /**
   * Valida contra el esquema XSD (simulado - en producción usaría una librería XSD)
   */
  private static validateAgainstSchema(xmlDoc: XmlDomDocument): string[] {
    const errors: string[] = [];

    // En una implementación real, aquí se validaría contra el esquema XSD
    // Por ahora, hacemos validaciones básicas de tipos de datos

    // Validar que los números son válidos
    const numericElements = xmlDoc.getElementsByTagName('TotalAmount');
    for (let i = 0; i < numericElements.length; i++) {
      const element = numericElements[i];
      const value = parseFloat(element.textContent || '');
      if (isNaN(value) || value < 0) {
        errors.push(`Valor numérico inválido en ${element.nodeName}: ${element.textContent}`);
      }
    }

    // Validar fechas
    const dateElements = xmlDoc.getElementsByTagName('IssueDate');
    for (let i = 0; i < dateElements.length; i++) {
      const element = dateElements[i];
      const dateValue = element.textContent;
      if (dateValue && !this.isValidDate(dateValue)) {
        errors.push(`Fecha inválida en ${element.nodeName}: ${dateValue}`);
      }
    }

    // Validar códigos de país
    const countryElements = xmlDoc.getElementsByTagName('CountryCode');
    for (let i = 0; i < countryElements.length; i++) {
      const element = countryElements[i];
      const countryCode = element.textContent;
      if (countryCode && !this.isValidCountryCode(countryCode)) {
        errors.push(`Código de país inválido: ${countryCode}`);
      }
    }

    return errors;
  }

  /**
   * Valida reglas de negocio específicas de Facturae
   */
  private static validateBusinessRules(xmlDoc: XmlDomDocument): string[] {
    const errors: string[] = [];

    // Validar que el NIF tiene formato válido
    const nifElements = xmlDoc.getElementsByTagName('TaxIdentificationNumber');
    for (let i = 0; i < nifElements.length; i++) {
      const element = nifElements[i];
      const nif = element.textContent;
      if (nif && !this.isValidNIF(nif)) {
        errors.push(`NIF inválido: ${nif}`);
      }
    }

    // Validar que los totales coinciden
    const invoiceElements = xmlDoc.getElementsByTagName('Invoice');
    for (let i = 0; i < invoiceElements.length; i++) {
      const invoice = invoiceElements[i];
      const totalErrors = this.validateInvoiceTotals(invoice);
      errors.push(...totalErrors);
    }

    // Validar que hay al menos un item por factura
    for (let i = 0; i < invoiceElements.length; i++) {
      const invoice = invoiceElements[i];
      const items = invoice.getElementsByTagName('InvoiceLine');
      if (items.length === 0) {
        errors.push(`La factura ${i + 1} debe tener al menos un item`);
      }
    }

    return errors;
  }

  /**
   * Valida que los totales de una factura son consistentes
   */
  private static validateInvoiceTotals(invoice: XmlDomElement): string[] {
    const errors: string[] = [];

    const totals = invoice.getElementsByTagName('InvoiceTotals')[0];
    if (!totals) return errors;

    const totalGrossAmount = parseFloat(totals.getElementsByTagName('TotalGrossAmount')[0]?.textContent || '0');
    const totalTaxOutputs = parseFloat(totals.getElementsByTagName('TotalTaxOutputs')[0]?.textContent || '0');
    const totalTaxesWithheld = parseFloat(totals.getElementsByTagName('TotalTaxesWithheld')[0]?.textContent || '0');
    const invoiceTotal = parseFloat(totals.getElementsByTagName('InvoiceTotal')[0]?.textContent || '0');

    // Calcular total esperado
    const expectedTotal = totalGrossAmount + totalTaxOutputs - totalTaxesWithheld;
    const tolerance = 0.01; // Tolerancia para errores de redondeo

    if (Math.abs(expectedTotal - invoiceTotal) > tolerance) {
      errors.push(`Los totales de la factura no coinciden. Esperado: ${expectedTotal.toFixed(2)}, Encontrado: ${invoiceTotal.toFixed(2)}`);
    }

    return errors;
  }

  /**
   * Valida si una fecha tiene formato válido (YYYY-MM-DD)
   */
  private static isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Valida si un código de país es válido (ISO 3166-1 alpha-2)
   */
  private static isValidCountryCode(countryCode: string): boolean {
    const validCountryCodes = [
      'ES', 'FR', 'DE', 'IT', 'PT', 'GB', 'US', 'CA', 'MX', 'AR', 'BR', 'CL', 'CO', 'PE', 'VE'
    ];
    return validCountryCodes.includes(countryCode.toUpperCase());
  }

  /**
   * Valida si un NIF tiene formato válido
   */
  private static isValidNIF(nif: string): boolean {
    // Validación básica de NIF español
    const nifRegex = /^[0-9A-Z][0-9]{7}[0-9A-Z]$/;
    return nifRegex.test(nif.toUpperCase());
  }

  /**
   * Valida un documento Facturae completo (XML + firma)
   */
  static validateSignedDocument(xmlContent: string, options: FacturaeValidationOptions = {}): ValidationResult {
    const result = this.validateXML(xmlContent, options);

    // Validar firma digital si existe
    if (xmlContent.includes('ds:Signature')) {
      const signatureErrors = this.validateDigitalSignature(xmlContent);
      if (signatureErrors.length > 0) {
        result.errors.push(...signatureErrors);
        result.isValid = false;
      }
    } else {
      result.warnings.push('El documento no contiene firma digital');
    }

    return result;
  }

  /**
   * Valida la firma digital del documento
   */
  private static validateDigitalSignature(xmlContent: string): string[] {
    const errors: string[] = [];

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Verificar que existe el elemento Signature
      const signatures = xmlDoc.getElementsByTagName('ds:Signature');
      if (signatures.length === 0) {
        errors.push('No se encontró elemento de firma digital');
        return errors;
      }

      // Verificar estructura básica de la firma
      const signature = signatures[0];
      const requiredSignatureElements = ['ds:SignedInfo', 'ds:SignatureValue', 'ds:KeyInfo'];
      
      for (const elementName of requiredSignatureElements) {
        const element = signature.getElementsByTagName(elementName);
        if (element.length === 0) {
          errors.push(`Elemento obligatorio de firma "${elementName}" no encontrado`);
        }
      }

      // Verificar que hay un certificado
      const certificates = xmlDoc.getElementsByTagName('ds:X509Certificate');
      if (certificates.length === 0) {
        errors.push('No se encontró certificado en la firma digital');
      }

    } catch (error) {
      errors.push(`Error al validar firma digital: ${error instanceof Error ? error.message : String(error)}`);
    }

    return errors;
  }
} 