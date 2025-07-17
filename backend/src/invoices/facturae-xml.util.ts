import { create } from 'xmlbuilder2';

export interface FacturaeParty {
  taxIdentification: {
    personTypeCode: string;
    residenceTypeCode: string;
    taxIdentificationNumber: string;
  };
  individual?: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  legalEntity?: {
    corporateName: string;
    tradeName?: string;
    registrationData?: {
      book?: string;
      registerOfCompaniesLocation?: string;
      sheet?: string;
      folio?: string;
      section?: string;
      volume?: string;
      additionalRegistrationData?: string;
      entry?: string;
    };
  };
  firstSurname?: string;
  secondSurname?: string;
  name?: string;
  address: {
    address: string;
    postCode: string;
    town: string;
    province: string;
    countryCode: string;
  };
  contactDetails?: {
    telephone?: string;
    teleFax?: string;
    webSite?: string;
    electronicMail?: string;
    contactPersons?: string;
    cnoCnae?: string;
    ineTownCode?: string;
    additionalContactDetails?: string;
  };
}

export interface FacturaeInvoiceItem {
  itemDescription: string;
  quantity: number;
  unitPriceWithoutTax: number;
  totalCost: number;
  grossAmount: number;
  taxesOutputs?: Array<{
    taxTypeCode: string;
    taxRate: number;
    taxableBase: {
      totalAmount: number;
      equivalentInEuros?: number;
    };
    taxAmount: {
      totalAmount: number;
      equivalentInEuros?: number;
    };
  }>;
  taxesWithheld?: Array<{
    taxTypeCode: string;
    taxRate: number;
    taxableBase: {
      totalAmount: number;
      equivalentInEuros?: number;
    };
    taxAmount: {
      totalAmount: number;
      equivalentInEuros?: number;
    };
  }>;
  discountsAndRebates?: Array<{
    discount: number;
    discountReason?: string;
  }>;
  charges?: Array<{
    charge: number;
    chargeReason?: string;
  }>;
}

export interface FacturaeInvoice {
  // Header
  invoiceHeader: {
    invoiceNumber: string;
    invoiceSeriesCode?: string;
    invoiceDocumentType: string;
    invoiceClass: string;
  };
  
  // Issue Data
  invoiceIssueData: {
    issueDate: Date;
    operationDate?: Date;
    placeOfIssue?: {
      postCode: string;
      town: string;
      province: string;
      countryCode: string;
    };
    languageCode: string;
    currencyCode: string;
    exchangeRateDetails?: {
      exchangeRate: number;
      exchangeRateDate: Date;
    };
    periods?: Array<{
      startDate: Date;
      endDate: Date;
    }>;
    taxesOutputs?: Array<{
      taxTypeCode: string;
      taxRate: number;
      taxableBase: {
        totalAmount: number;
        equivalentInEuros?: number;
      };
      taxAmount: {
        totalAmount: number;
        equivalentInEuros?: number;
      };
    }>;
    taxesWithheld?: Array<{
      taxTypeCode: string;
      taxRate: number;
      taxableBase: {
        totalAmount: number;
        equivalentInEuros?: number;
      };
      taxAmount: {
        totalAmount: number;
        equivalentInEuros?: number;
      };
    }>;
  };
  
  // Totals
  invoiceTotals: {
    totalGrossAmount: number;
    totalGeneralDiscounts?: number;
    totalGeneralSurcharges?: number;
    totalGrossAmountBeforeTaxes: number;
    totalTaxOutputs: number;
    totalTaxesWithheld: number;
    invoiceTotal: number;
    totalOutstandingAmount: number;
    totalExecutableAmount: number;
  };
  
  // Items
  items: FacturaeInvoiceItem[];
  
  // Legal literals
  legalLiterals?: Array<{
    reference: string;
    literal: string;
  }>;
  
  // Additional data
  additionalData?: {
    relatedDocuments?: Array<{
      documentType: string;
      documentID: string;
      documentTypeDescription?: string;
      issuerParty?: string;
      receiverParty?: string;
      issueDate?: Date;
      otherRelevantData?: string;
    }>;
    invoiceAdditionalInformation?: string;
    extensions?: Array<{
      identificationExtension: string;
      nameExtension: string;
      versionExtension: string;
      extensionContent: string;
    }>;
  };
}

export interface FacturaeDocument {
  fileHeader: {
    schemaVersion: string;
    modality: string;
    issuerParty: FacturaeParty;
    receiverParty: FacturaeParty;
    documentType: string;
    documentSubType?: string;
  };
  part: {
    sellerParty: FacturaeParty;
    buyerParty: FacturaeParty;
    invoices: FacturaeInvoice[];
  };
}

export function generateFacturaeXML(data: FacturaeDocument): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Facturae', { 
      xmlns: 'http://www.facturae.es/Facturae/2014/v3.2.2/Facturae',
      'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#'
    });

  // File Header
  const fileHeader = root.ele('FileHeader');
  fileHeader.ele('SchemaVersion').txt(data.fileHeader.schemaVersion).up();
  fileHeader.ele('Modality').txt(data.fileHeader.modality).up();
  fileHeader.ele('DocumentType').txt(data.fileHeader.documentType).up();
  if (data.fileHeader.documentSubType) {
    fileHeader.ele('DocumentSubType').txt(data.fileHeader.documentSubType).up();
  }
  fileHeader.up();

  // Parties
  const parties = root.ele('Parties');
  
  // Seller Party
  const sellerParty = parties.ele('SellerParty');
  addPartyToXML(sellerParty, data.part.sellerParty);
  sellerParty.up();
  
  // Buyer Party
  const buyerParty = parties.ele('BuyerParty');
  addPartyToXML(buyerParty, data.part.buyerParty);
  buyerParty.up();
  
  parties.up();

  // Invoices
  const invoices = root.ele('Invoices');
  
  for (const invoice of data.part.invoices) {
    const invoiceElement = invoices.ele('Invoice');
    
    // Invoice Header
    const invoiceHeader = invoiceElement.ele('InvoiceHeader');
    invoiceHeader.ele('InvoiceNumber').txt(invoice.invoiceHeader.invoiceNumber).up();
    if (invoice.invoiceHeader.invoiceSeriesCode) {
      invoiceHeader.ele('InvoiceSeriesCode').txt(invoice.invoiceHeader.invoiceSeriesCode).up();
    }
    invoiceHeader.ele('InvoiceDocumentType').txt(invoice.invoiceHeader.invoiceDocumentType).up();
    invoiceHeader.ele('InvoiceClass').txt(invoice.invoiceHeader.invoiceClass).up();
    invoiceHeader.up();
    
    // Invoice Issue Data
    const invoiceIssueData = invoiceElement.ele('InvoiceIssueData');
    invoiceIssueData.ele('IssueDate').txt(invoice.invoiceIssueData.issueDate.toISOString().slice(0, 10)).up();
    if (invoice.invoiceIssueData.operationDate) {
      invoiceIssueData.ele('OperationDate').txt(invoice.invoiceIssueData.operationDate.toISOString().slice(0, 10)).up();
    }
    if (invoice.invoiceIssueData.placeOfIssue) {
      const placeOfIssue = invoiceIssueData.ele('PlaceOfIssue');
      placeOfIssue.ele('PostCode').txt(invoice.invoiceIssueData.placeOfIssue.postCode).up();
      placeOfIssue.ele('Town').txt(invoice.invoiceIssueData.placeOfIssue.town).up();
      placeOfIssue.ele('Province').txt(invoice.invoiceIssueData.placeOfIssue.province).up();
      placeOfIssue.ele('CountryCode').txt(invoice.invoiceIssueData.placeOfIssue.countryCode).up();
      placeOfIssue.up();
    }
    invoiceIssueData.ele('LanguageCode').txt(invoice.invoiceIssueData.languageCode).up();
    invoiceIssueData.ele('CurrencyCode').txt(invoice.invoiceIssueData.currencyCode).up();
    if (invoice.invoiceIssueData.exchangeRateDetails) {
      const exchangeRateDetails = invoiceIssueData.ele('ExchangeRateDetails');
      exchangeRateDetails.ele('ExchangeRate').txt(invoice.invoiceIssueData.exchangeRateDetails.exchangeRate.toString()).up();
      exchangeRateDetails.ele('ExchangeRateDate').txt(invoice.invoiceIssueData.exchangeRateDetails.exchangeRateDate.toISOString().slice(0, 10)).up();
      exchangeRateDetails.up();
    }
    invoiceIssueData.up();
    
    // Taxes Outputs
    if (invoice.invoiceIssueData.taxesOutputs && invoice.invoiceIssueData.taxesOutputs.length > 0) {
      const taxesOutputs = invoiceElement.ele('TaxesOutputs');
      for (const tax of invoice.invoiceIssueData.taxesOutputs) {
        const taxElement = taxesOutputs.ele('TaxOutput');
        taxElement.ele('TaxTypeCode').txt(tax.taxTypeCode).up();
        taxElement.ele('TaxRate').txt(tax.taxRate.toString()).up();
        const taxableBase = taxElement.ele('TaxableBase');
        taxableBase.ele('TotalAmount').txt(tax.taxableBase.totalAmount.toString()).up();
        if (tax.taxableBase.equivalentInEuros) {
          taxableBase.ele('EquivalentInEuros').txt(tax.taxableBase.equivalentInEuros.toString()).up();
        }
        taxableBase.up();
        const taxAmount = taxElement.ele('TaxAmount');
        taxAmount.ele('TotalAmount').txt(tax.taxAmount.totalAmount.toString()).up();
        if (tax.taxAmount.equivalentInEuros) {
          taxAmount.ele('EquivalentInEuros').txt(tax.taxAmount.equivalentInEuros.toString()).up();
        }
        taxAmount.up();
        taxElement.up();
      }
      taxesOutputs.up();
    }
    
    // Taxes Withheld
    if (invoice.invoiceIssueData.taxesWithheld && invoice.invoiceIssueData.taxesWithheld.length > 0) {
      const taxesWithheld = invoiceElement.ele('TaxesWithheld');
      for (const tax of invoice.invoiceIssueData.taxesWithheld) {
        const taxElement = taxesWithheld.ele('TaxWithheld');
        taxElement.ele('TaxTypeCode').txt(tax.taxTypeCode).up();
        taxElement.ele('TaxRate').txt(tax.taxRate.toString()).up();
        const taxableBase = taxElement.ele('TaxableBase');
        taxableBase.ele('TotalAmount').txt(tax.taxableBase.totalAmount.toString()).up();
        if (tax.taxableBase.equivalentInEuros) {
          taxableBase.ele('EquivalentInEuros').txt(tax.taxableBase.equivalentInEuros.toString()).up();
        }
        taxableBase.up();
        const taxAmount = taxElement.ele('TaxAmount');
        taxAmount.ele('TotalAmount').txt(tax.taxAmount.totalAmount.toString()).up();
        if (tax.taxAmount.equivalentInEuros) {
          taxAmount.ele('EquivalentInEuros').txt(tax.taxAmount.equivalentInEuros.toString()).up();
        }
        taxAmount.up();
        taxElement.up();
      }
      taxesWithheld.up();
    }
    
    // Invoice Totals
    const invoiceTotals = invoiceElement.ele('InvoiceTotals');
    invoiceTotals.ele('TotalGrossAmount').txt(invoice.invoiceTotals.totalGrossAmount.toString()).up();
    if (invoice.invoiceTotals.totalGeneralDiscounts) {
      invoiceTotals.ele('TotalGeneralDiscounts').txt(invoice.invoiceTotals.totalGeneralDiscounts.toString()).up();
    }
    if (invoice.invoiceTotals.totalGeneralSurcharges) {
      invoiceTotals.ele('TotalGeneralSurcharges').txt(invoice.invoiceTotals.totalGeneralSurcharges.toString()).up();
    }
    invoiceTotals.ele('TotalGrossAmountBeforeTaxes').txt(invoice.invoiceTotals.totalGrossAmountBeforeTaxes.toString()).up();
    invoiceTotals.ele('TotalTaxOutputs').txt(invoice.invoiceTotals.totalTaxOutputs.toString()).up();
    invoiceTotals.ele('TotalTaxesWithheld').txt(invoice.invoiceTotals.totalTaxesWithheld.toString()).up();
    invoiceTotals.ele('InvoiceTotal').txt(invoice.invoiceTotals.invoiceTotal.toString()).up();
    invoiceTotals.ele('TotalOutstandingAmount').txt(invoice.invoiceTotals.totalOutstandingAmount.toString()).up();
    invoiceTotals.ele('TotalExecutableAmount').txt(invoice.invoiceTotals.totalExecutableAmount.toString()).up();
    invoiceTotals.up();
    
    // Items
    if (invoice.items && invoice.items.length > 0) {
      const items = invoiceElement.ele('Items');
      for (const item of invoice.items) {
        const itemElement = items.ele('InvoiceLine');
        itemElement.ele('ItemDescription').txt(item.itemDescription).up();
        itemElement.ele('Quantity').txt(item.quantity.toString()).up();
        itemElement.ele('UnitPriceWithoutTax').txt(item.unitPriceWithoutTax.toString()).up();
        itemElement.ele('TotalCost').txt(item.totalCost.toString()).up();
        itemElement.ele('GrossAmount').txt(item.grossAmount.toString()).up();
        
        // Item Taxes Outputs
        if (item.taxesOutputs && item.taxesOutputs.length > 0) {
          const itemTaxesOutputs = itemElement.ele('TaxesOutputs');
          for (const tax of item.taxesOutputs) {
            const taxElement = itemTaxesOutputs.ele('TaxOutput');
            taxElement.ele('TaxTypeCode').txt(tax.taxTypeCode).up();
            taxElement.ele('TaxRate').txt(tax.taxRate.toString()).up();
            const taxableBase = taxElement.ele('TaxableBase');
            taxableBase.ele('TotalAmount').txt(tax.taxableBase.totalAmount.toString()).up();
            if (tax.taxableBase.equivalentInEuros) {
              taxableBase.ele('EquivalentInEuros').txt(tax.taxableBase.equivalentInEuros.toString()).up();
            }
            taxableBase.up();
            const taxAmount = taxElement.ele('TaxAmount');
            taxAmount.ele('TotalAmount').txt(tax.taxAmount.totalAmount.toString()).up();
            if (tax.taxAmount.equivalentInEuros) {
              taxAmount.ele('EquivalentInEuros').txt(tax.taxAmount.equivalentInEuros.toString()).up();
            }
            taxAmount.up();
            taxElement.up();
          }
          itemTaxesOutputs.up();
        }
        
        // Item Taxes Withheld
        if (item.taxesWithheld && item.taxesWithheld.length > 0) {
          const itemTaxesWithheld = itemElement.ele('TaxesWithheld');
          for (const tax of item.taxesWithheld) {
            const taxElement = itemTaxesWithheld.ele('TaxWithheld');
            taxElement.ele('TaxTypeCode').txt(tax.taxTypeCode).up();
            taxElement.ele('TaxRate').txt(tax.taxRate.toString()).up();
            const taxableBase = taxElement.ele('TaxableBase');
            taxableBase.ele('TotalAmount').txt(tax.taxableBase.totalAmount.toString()).up();
            if (tax.taxableBase.equivalentInEuros) {
              taxableBase.ele('EquivalentInEuros').txt(tax.taxableBase.equivalentInEuros.toString()).up();
            }
            taxableBase.up();
            const taxAmount = taxElement.ele('TaxAmount');
            taxAmount.ele('TotalAmount').txt(tax.taxAmount.totalAmount.toString()).up();
            if (tax.taxAmount.equivalentInEuros) {
              taxAmount.ele('EquivalentInEuros').txt(tax.taxAmount.equivalentInEuros.toString()).up();
            }
            taxAmount.up();
            taxElement.up();
          }
          itemTaxesWithheld.up();
        }
        
        itemElement.up();
      }
      items.up();
    }
    
    // Legal Literals
    if (invoice.legalLiterals && invoice.legalLiterals.length > 0) {
      const legalLiterals = invoiceElement.ele('LegalLiterals');
      for (const literal of invoice.legalLiterals) {
        const literalElement = legalLiterals.ele('LegalLiteral');
        literalElement.ele('Reference').txt(literal.reference).up();
        literalElement.ele('Literal').txt(literal.literal).up();
        literalElement.up();
      }
      legalLiterals.up();
    }
    
    // Additional Data
    if (invoice.additionalData) {
      const additionalData = invoiceElement.ele('AdditionalData');
      if (invoice.additionalData.invoiceAdditionalInformation) {
        additionalData.ele('InvoiceAdditionalInformation').txt(invoice.additionalData.invoiceAdditionalInformation).up();
      }
      if (invoice.additionalData.relatedDocuments && invoice.additionalData.relatedDocuments.length > 0) {
        const relatedDocuments = additionalData.ele('RelatedDocuments');
        for (const doc of invoice.additionalData.relatedDocuments) {
          const docElement = relatedDocuments.ele('RelatedDocument');
          docElement.ele('DocumentType').txt(doc.documentType).up();
          docElement.ele('DocumentID').txt(doc.documentID).up();
          if (doc.documentTypeDescription) {
            docElement.ele('DocumentTypeDescription').txt(doc.documentTypeDescription).up();
          }
          if (doc.issuerParty) {
            docElement.ele('IssuerParty').txt(doc.issuerParty).up();
          }
          if (doc.receiverParty) {
            docElement.ele('ReceiverParty').txt(doc.receiverParty).up();
          }
          if (doc.issueDate) {
            docElement.ele('IssueDate').txt(doc.issueDate.toISOString().slice(0, 10)).up();
          }
          if (doc.otherRelevantData) {
            docElement.ele('OtherRelevantData').txt(doc.otherRelevantData).up();
          }
          docElement.up();
        }
        relatedDocuments.up();
      }
      additionalData.up();
    }
    
    invoiceElement.up();
  }
  
  invoices.up();

  return root.end({ prettyPrint: true });
}

function addPartyToXML(element: any, party: FacturaeParty): void {
  // Tax Identification
  const taxIdentification = element.ele('TaxIdentification');
  taxIdentification.ele('PersonTypeCode').txt(party.taxIdentification.personTypeCode).up();
  taxIdentification.ele('ResidenceTypeCode').txt(party.taxIdentification.residenceTypeCode).up();
  taxIdentification.ele('TaxIdentificationNumber').txt(party.taxIdentification.taxIdentificationNumber).up();
  taxIdentification.up();
  
  // Individual or Legal Entity
  if (party.individual) {
    const individual = element.ele('Individual');
    individual.ele('FirstName').txt(party.individual.firstName).up();
    individual.ele('LastName').txt(party.individual.lastName).up();
    if (party.individual.middleName) {
      individual.ele('MiddleName').txt(party.individual.middleName).up();
    }
    individual.up();
  } else if (party.legalEntity) {
    const legalEntity = element.ele('LegalEntity');
    legalEntity.ele('CorporateName').txt(party.legalEntity.corporateName).up();
    if (party.legalEntity.tradeName) {
      legalEntity.ele('TradeName').txt(party.legalEntity.tradeName).up();
    }
    if (party.legalEntity.registrationData) {
      const registrationData = legalEntity.ele('RegistrationData');
      if (party.legalEntity.registrationData.book) {
        registrationData.ele('Book').txt(party.legalEntity.registrationData.book).up();
      }
      if (party.legalEntity.registrationData.registerOfCompaniesLocation) {
        registrationData.ele('RegisterOfCompaniesLocation').txt(party.legalEntity.registrationData.registerOfCompaniesLocation).up();
      }
      if (party.legalEntity.registrationData.sheet) {
        registrationData.ele('Sheet').txt(party.legalEntity.registrationData.sheet).up();
      }
      if (party.legalEntity.registrationData.folio) {
        registrationData.ele('Folio').txt(party.legalEntity.registrationData.folio).up();
      }
      if (party.legalEntity.registrationData.section) {
        registrationData.ele('Section').txt(party.legalEntity.registrationData.section).up();
      }
      if (party.legalEntity.registrationData.volume) {
        registrationData.ele('Volume').txt(party.legalEntity.registrationData.volume).up();
      }
      if (party.legalEntity.registrationData.additionalRegistrationData) {
        registrationData.ele('AdditionalRegistrationData').txt(party.legalEntity.registrationData.additionalRegistrationData).up();
      }
      if (party.legalEntity.registrationData.entry) {
        registrationData.ele('Entry').txt(party.legalEntity.registrationData.entry).up();
      }
      registrationData.up();
    }
    legalEntity.up();
  }
  
  // Address
  const address = element.ele('Address');
  address.ele('Address').txt(party.address.address).up();
  address.ele('PostCode').txt(party.address.postCode).up();
  address.ele('Town').txt(party.address.town).up();
  address.ele('Province').txt(party.address.province).up();
  address.ele('CountryCode').txt(party.address.countryCode).up();
  address.up();
  
  // Contact Details
  if (party.contactDetails) {
    const contactDetails = element.ele('ContactDetails');
    if (party.contactDetails.telephone) {
      contactDetails.ele('Telephone').txt(party.contactDetails.telephone).up();
    }
    if (party.contactDetails.teleFax) {
      contactDetails.ele('TeleFax').txt(party.contactDetails.teleFax).up();
    }
    if (party.contactDetails.webSite) {
      contactDetails.ele('WebSite').txt(party.contactDetails.webSite).up();
    }
    if (party.contactDetails.electronicMail) {
      contactDetails.ele('ElectronicMail').txt(party.contactDetails.electronicMail).up();
    }
    if (party.contactDetails.contactPersons) {
      contactDetails.ele('ContactPersons').txt(party.contactDetails.contactPersons).up();
    }
    if (party.contactDetails.cnoCnae) {
      contactDetails.ele('CnoCnae').txt(party.contactDetails.cnoCnae).up();
    }
    if (party.contactDetails.ineTownCode) {
      contactDetails.ele('IneTownCode').txt(party.contactDetails.ineTownCode).up();
    }
    if (party.contactDetails.additionalContactDetails) {
      contactDetails.ele('AdditionalContactDetails').txt(party.contactDetails.additionalContactDetails).up();
    }
    contactDetails.up();
  }
}

// Función de compatibilidad para mantener la API existente
export function generateFacturaeXMLFromInvoice(invoice: any): string {
  // Convertir el formato antiguo al nuevo formato
  const facturaeData: FacturaeDocument = {
    fileHeader: {
      schemaVersion: '3.2.2',
      modality: 'I',
      issuerParty: {
        taxIdentification: {
          personTypeCode: 'J',
          residenceTypeCode: 'R',
          taxIdentificationNumber: invoice.emisor?.dni || 'B00000000'
        },
        legalEntity: {
          corporateName: invoice.emisor?.name || 'Empresa Emisora'
        },
        address: {
          address: 'Dirección del Emisor',
          postCode: '28001',
          town: 'Madrid',
          province: 'Madrid',
          countryCode: 'ESP'
        }
      },
      receiverParty: {
        taxIdentification: {
          personTypeCode: 'J',
          residenceTypeCode: 'R',
          taxIdentificationNumber: invoice.receptor?.dni || 'B00000000'
        },
        legalEntity: {
          corporateName: invoice.receptor?.name || 'Empresa Receptora'
        },
        address: {
          address: 'Dirección del Receptor',
          postCode: '28001',
          town: 'Madrid',
          province: 'Madrid',
          countryCode: 'ESP'
        }
      },
      documentType: 'FC'
    },
    part: {
      sellerParty: {
        taxIdentification: {
          personTypeCode: 'J',
          residenceTypeCode: 'R',
          taxIdentificationNumber: invoice.emisor?.dni || 'B00000000'
        },
        legalEntity: {
          corporateName: invoice.emisor?.name || 'Empresa Emisora'
        },
        address: {
          address: 'Dirección del Emisor',
          postCode: '28001',
          town: 'Madrid',
          province: 'Madrid',
          countryCode: 'ESP'
        }
      },
      buyerParty: {
        taxIdentification: {
          personTypeCode: 'J',
          residenceTypeCode: 'R',
          taxIdentificationNumber: invoice.receptor?.dni || 'B00000000'
        },
        legalEntity: {
          corporateName: invoice.receptor?.name || 'Empresa Receptora'
        },
        address: {
          address: 'Dirección del Receptor',
          postCode: '28001',
          town: 'Madrid',
          province: 'Madrid',
          countryCode: 'ESP'
        }
      },
      invoices: [{
        invoiceHeader: {
          invoiceNumber: invoice.numeroFactura || 'FAC-001',
          invoiceDocumentType: 'FC',
          invoiceClass: 'OO'
        },
        invoiceIssueData: {
          issueDate: invoice.fechaFactura || new Date(),
          languageCode: 'es',
          currencyCode: 'EUR'
        },
        invoiceTotals: {
          totalGrossAmount: invoice.importeTotal || 0,
          totalGrossAmountBeforeTaxes: invoice.baseImponible || 0,
          totalTaxOutputs: invoice.cuotaIVA || 0,
          totalTaxesWithheld: 0,
          invoiceTotal: invoice.importeTotal || 0,
          totalOutstandingAmount: invoice.importeTotal || 0,
          totalExecutableAmount: invoice.importeTotal || 0
        },
        items: (invoice.items || []).map((item: any) => ({
          itemDescription: item.description || '',
          quantity: item.quantity || 0,
          unitPriceWithoutTax: item.unitPrice || 0,
          totalCost: (item.quantity || 0) * (item.unitPrice || 0),
          grossAmount: item.total || 0
        }))
      }]
    }
  };
  
  return generateFacturaeXML(facturaeData);
} 