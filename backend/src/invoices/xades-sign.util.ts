import * as xadesjs from "xadesjs";
import { Crypto } from "@peculiar/webcrypto";
import { DOMParser, XMLSerializer } from "xmldom";
// xmldom no exporta tipos TS, así que usamos 'any' para Document y Element
// Alternativamente, podrías usar: import type { Document, Element } from "@types/xmldom";
type XmlDomDocument = any;
type XmlDomElement = any;
import * as fs from 'fs';

// Necesario para Node.js: establecer el motor de crypto global
const webcrypto = new Crypto();
xadesjs.Application.setEngine("OpenSSL", webcrypto);

export enum XAdESLevel {
  BES = 'XAdES_BES',
  T = 'XAdES_T',
  C = 'XAdES_C',
  X = 'XAdES_X',
  XL = 'XAdES_XL'
}

export interface SigningOptions {
  level: XAdESLevel;
  policy?: string;
  tsaUrl?: string;
  ocspUrl?: string;
  signDate?: Date;
  signerRole?: string;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  isValid: boolean;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Elimina encabezados y pies de línea
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const binary = Buffer.from(b64, 'base64');
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyBuffer = pemToArrayBuffer(pem);
  return await webcrypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );
}

/**
 * Firma un XML Facturae con XAdES avanzado
 */
export async function signFacturaeXMLAdvanced(
  xml: string, 
  certPem: string, 
  keyPem: string, 
  options: SigningOptions = { level: XAdESLevel.BES }
): Promise<string> {
  try {
    // Parsear el XML
    const parser = new DOMParser();
    const xmlDoc: XmlDomDocument = parser.parseFromString(xml, "application/xml");

    // Importar la clave privada
    const privateKey = await importPrivateKey(keyPem);

    // Certificado como base64 (sin encabezados)
    const certBase64 = certPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');

    // Crear la firma XAdES
    const signedXml = new xadesjs.SignedXml();

    // Configurar opciones de firma
    const signingOptions: any = {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    };

    // Firmar el XML
    await signedXml.Sign(
      signingOptions,
      privateKey,
      xmlDoc.documentElement
    );

    // Agregar el certificado al KeyInfo
    const signatureNode = signedXml.GetXml();
    const keyInfo = signatureNode.getElementsByTagName("KeyInfo")[0];
    if (keyInfo) {
      const x509Data = xmlDoc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:X509Data");
      const x509Cert = xmlDoc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:X509Certificate");
      x509Cert.textContent = certBase64;
      x509Data.appendChild(x509Cert);
      keyInfo.appendChild(x509Data);
    }

    // Aplicar nivel XAdES según las opciones
    if (options.level !== XAdESLevel.BES) {
      await applyXAdESLevel(signedXml, options, xmlDoc);
    }

    // Insertar la firma en el documento original
    xmlDoc.documentElement.appendChild(xmlDoc.importNode(signatureNode, true));
    
    return new XMLSerializer().serializeToString(xmlDoc);
  } catch (error) {
    throw new Error(`Error al firmar XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Aplica niveles avanzados de XAdES
 */
async function applyXAdESLevel(
  signedXml: xadesjs.SignedXml, 
  options: SigningOptions, 
  xmlDoc: XmlDomDocument
): Promise<void> {
  const signatureElement = signedXml.GetXml();
  
  // Agregar elementos XAdES según el nivel
  if (options.level >= XAdESLevel.T) {
    await addXAdEST(signatureElement, options, xmlDoc);
  }
  
  if (options.level >= XAdESLevel.C) {
    await addXAdESC(signatureElement, options, xmlDoc);
  }
  
  if (options.level >= XAdESLevel.X) {
    await addXAdESX(signatureElement, options, xmlDoc);
  }
}

/**
 * Agrega elementos XAdES-T (Sello de tiempo)
 */
async function addXAdEST(signatureElement: XmlDomElement, options: SigningOptions, xmlDoc: XmlDomDocument): Promise<void> {
  if (!options.tsaUrl) {
    throw new Error('URL del servidor TSA requerida para XAdES-T');
  }

  // Crear elemento UnsignedSignatureProperties
  const unsignedProps = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:UnsignedSignatureProperties"
  );

  // Crear elemento SignatureTimeStamp
  const timeStamp = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:SignatureTimeStamp"
  );

  // En una implementación real, aquí se obtendría el sello de tiempo del TSA
  // Por ahora, simulamos la estructura
  const timeStampInfo = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:EncapsulatedTimeStamp"
  );
  
  // Simular sello de tiempo (en producción se obtendría del TSA)
  const timestamp = new Date().toISOString();
  timeStampInfo.textContent = Buffer.from(timestamp).toString('base64');
  
  timeStamp.appendChild(timeStampInfo);
  unsignedProps.appendChild(timeStamp);
  
  // Agregar al elemento Object
  const objectElement = signatureElement.getElementsByTagName("ds:Object")[0];
  if (objectElement) {
    objectElement.appendChild(unsignedProps);
  }
}

/**
 * Agrega elementos XAdES-C (Validación de certificados)
 */
async function addXAdESC(signatureElement: XmlDomElement, options: SigningOptions, xmlDoc: XmlDomDocument): Promise<void> {
  if (!options.ocspUrl) {
    throw new Error('URL del servidor OCSP requerida para XAdES-C');
  }

  // Crear elemento RevocationValues
  const revocationValues = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:RevocationValues"
  );

  // Crear elemento OCSPValues
  const ocspValues = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:OCSPValues"
  );

  // En una implementación real, aquí se obtendría la respuesta OCSP
  // Por ahora, simulamos la estructura
  const encapsulatedOCSP = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:EncapsulatedOCSPValue"
  );
  
  // Simular respuesta OCSP (en producción se obtendría del servidor OCSP)
  const ocspResponse = "Simulated OCSP Response";
  encapsulatedOCSP.textContent = Buffer.from(ocspResponse).toString('base64');
  
  ocspValues.appendChild(encapsulatedOCSP);
  revocationValues.appendChild(ocspValues);
  
  // Agregar al elemento UnsignedSignatureProperties
  const unsignedProps = signatureElement.getElementsByTagName("xades:UnsignedSignatureProperties")[0];
  if (unsignedProps) {
    unsignedProps.appendChild(revocationValues);
  }
}

/**
 * Agrega elementos XAdES-X (Sello de tiempo de la firma)
 */
async function addXAdESX(signatureElement: XmlDomElement, options: SigningOptions, xmlDoc: XmlDomDocument): Promise<void> {
  // Crear elemento SignatureTimeStamp para XAdES-X
  const sigTimeStamp = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:SigAndRefsTimeStamp"
  );

  // En una implementación real, aquí se obtendría el sello de tiempo
  // Por ahora, simulamos la estructura
  const timeStampInfo = xmlDoc.createElementNS(
    "http://uri.etsi.org/01903/v1.3.2#", 
    "xades:EncapsulatedTimeStamp"
  );
  
  const timestamp = new Date().toISOString();
  timeStampInfo.textContent = Buffer.from(timestamp).toString('base64');
  
  sigTimeStamp.appendChild(timeStampInfo);
  
  // Agregar al elemento UnsignedSignatureProperties
  const unsignedProps = signatureElement.getElementsByTagName("xades:UnsignedSignatureProperties")[0];
  if (unsignedProps) {
    unsignedProps.appendChild(sigTimeStamp);
  }
}

/**
 * Firma un XML Facturae con XAdES básico (compatibilidad)
 */
export async function signFacturaeXML(xml: string, certPem: string, keyPem: string): Promise<string> {
  return signFacturaeXMLAdvanced(xml, certPem, keyPem, { level: XAdESLevel.BES });
}

/**
 * Valida un certificado digital
 */
export function validateCertificate(certPem: string): CertificateInfo {
  try {
    // Parsear el certificado
    const certBase64 = certPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const certBuffer = Buffer.from(certBase64, 'base64');
    
    // En una implementación real, aquí se parsearía el certificado X.509
    // Por ahora, simulamos la validación
    
    const now = new Date();
    const validFrom = new Date(now.getFullYear() - 1, 0, 1); // Simular fecha de emisión
    const validTo = new Date(now.getFullYear() + 1, 11, 31); // Simular fecha de expiración
    
    return {
      subject: "CN=Test Certificate",
      issuer: "CN=Test CA",
      serialNumber: "123456789",
      validFrom,
      validTo,
      isValid: now >= validFrom && now <= validTo
    };
  } catch (error) {
    throw new Error(`Error al validar certificado: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verifica el estado de un certificado mediante OCSP
 */
export async function checkCertificateStatus(certPem: string, ocspUrl: string): Promise<boolean> {
  try {
    // En una implementación real, aquí se haría la consulta OCSP
    // Por ahora, simulamos que el certificado es válido
    return true;
  } catch (error) {
    throw new Error(`Error al verificar estado del certificado: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Obtiene un sello de tiempo de un servidor TSA
 */
export async function getTimestamp(tsaUrl: string, data: string): Promise<string> {
  try {
    // En una implementación real, aquí se obtendría el sello de tiempo del TSA
    // Por ahora, simulamos el sello de tiempo
    const timestamp = new Date().toISOString();
    return Buffer.from(timestamp).toString('base64');
  } catch (error) {
    throw new Error(`Error al obtener sello de tiempo: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Valida una firma digital
 */
export function validateSignature(xmlContent: string): boolean {
  try {
    const parser = new DOMParser();
    const xmlDoc: XmlDomDocument = parser.parseFromString(xmlContent, "application/xml");
    
    // Verificar que existe el elemento Signature
    const signatures = xmlDoc.getElementsByTagName("ds:Signature");
    if (signatures.length === 0) {
      return false;
    }
    
    // Verificar estructura básica de la firma
    const signature = signatures[0];
    const requiredElements = ['ds:SignedInfo', 'ds:SignatureValue', 'ds:KeyInfo'];
    
    for (const elementName of requiredElements) {
      const element = signature.getElementsByTagName(elementName);
      if (element.length === 0) {
        return false;
      }
    }
    
    // En una implementación real, aquí se validaría criptográficamente la firma
    // Por ahora, solo verificamos la estructura
    
    return true;
  } catch (error) {
    return false;
  }
} 