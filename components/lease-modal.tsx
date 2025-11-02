"use client";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase/client';
import { X, Download, Save, Printer, FileText, Scale, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface LeaseData {
  // Información básica
  start_date: string;
  end_date: string;
  tenant_id?: string;
  monthly_rent: number | string;
  securityDeposit: number | string;
  terminationConditions?: string;

  // Información del propietario
  landlordName?: string;
  landlordAddress?: string;
  landlordPhone?: string;
  landlordEmail?: string;
  landlordAgentName?: string;

  // Información del inquilino
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenantEmergencyContact?: string;
  tenantEmergencyPhone?: string;

  // Detalles de la propiedad
  propertyLocation?: string;
  propertyState?: string;
  propertyType?: string;
  propertyBuiltYear?: string;
  bathrooms?: number;
  bedrooms?: number;
  propertyId?: string;

  // Términos de pago
  rentPaymentFrequency?: string;
  rentDueDay?: string;
  paymentMethodsAllowed?: string[];
  latePaymentFee?: string;
  nsfFee?: string;
  securityDepositReturnDays?: string;
  securityDepositRefund?: string;

  // Políticas
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  vapingAllowed?: boolean;
  parkingAllowed?: boolean;
  subleasingAllowed?: boolean;

  // Responsabilidades
  utilities?: Record<string, string>;
  maintenanceResponsibilities?: string;
  insuranceResponsibilities?: string;

  // Notificaciones
  entryNoticeHours?: string;
  terminationNoticeDays?: string;
  noticesAddress?: string;

  // Cláusulas
  customClauses?: string[];
  additionalTerms?: string;

  // Firma
  signingDate?: string;

  // Otros campos
  [key: string]: any;
}

interface ContractModalProps {
  leaseHtml: string;
  legalInfo: string;
  onClose: () => void;
  propertyId: string;
  leaseData: LeaseData;
}

export default function ContractModal({
  leaseHtml,
  legalInfo,
  onClose,
  propertyId,
  leaseData,
}: ContractModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contract");
  const [parsedLegalInfo, setParsedLegalInfo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const contractRef = useRef<HTMLDivElement>(null);
  const legalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          setAccessToken(data.session.access_token);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not retrieve user session",
        });
      }
    };

    fetchSession();
  }, []);

  // Parsear la información legal
  useEffect(() => {
    if (legalInfo) {
      const formattedLegalInfo = legalInfo
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

      setParsedLegalInfo(formattedLegalInfo);
    }
  }, [legalInfo]);

  const handleSaveLease = async () => {
    setIsSaving(true);
    try {
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-lease`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: propertyId,
          lease: leaseHtml,
          leaseData,
          legalInfo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lease');
      }

      toast({
        title: "Lease details saved",
        description: "Lease information has been successfully updated",
      });
    } catch (error: any) {
      console.error('Error saving lease:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not save lease details",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Función para convertir HTML a párrafos de DOCX
  const htmlToDocxElements = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const elements: any[] = [];

    // Recorrer todos los nodos
    tempDiv.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: node.textContent || '', size: 22 })],
                        spacing: { after: 100 }
          })
        );
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        // Manejar diferentes tipos de elementos
        switch (element.tagName.toLowerCase()) {
          case 'h1':
            elements.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: element.textContent || '', bold: true, size: 28 })],
                            spacing: { after: 150 }
              })
            );
            break;

          case 'h2':
            elements.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: element.textContent || '', bold: true, size: 24 })],
                            spacing: { after: 120 }
              })
            );
            break;

          case 'h3':
            elements.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_3,
                children: [new TextRun({ text: element.textContent || '', bold: true, size: 22 })],
                            spacing: { after: 100 }
              })
            );
            break;

          case 'p':
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: element.textContent || '', size: 22 })],
                            spacing: { after: 100 }
              })
            );
            break;

          case 'strong':
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: element.textContent || '', bold: true, size: 22 })],
                            spacing: { after: 100 }
              })
            );
            break;

          case 'em':
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: element.textContent || '', italics: true, size: 22 })],
                            spacing: { after: 100 }
              })
            );
            break;

          case 'br':
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: '' })],
                            spacing: { after: 100 }
              })
            );
            break;

          default:
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: element.textContent || '', size: 22 })],
                            spacing: { after: 100 }
              })
            );
        }
      }
    });

    return elements;
  };

  const downloadDOCX = async () => {
    setIsDownloading(true);
    try {
      let finalBlob: Blob;
      let fileName = '';

      if (activeTab === "contract") {
        // Descargar plantilla base
        const response = await fetch('/templates/lease-template.docx');

        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
        }

        const templateBuffer = await response.arrayBuffer();

        if (!templateBuffer || templateBuffer.byteLength === 0) {
          throw new Error('Fetched template is empty');
        }

        // Cargar el documento con JSZip
        const zip = new JSZip();
        try {
          await zip.loadAsync(templateBuffer);
        } catch (zipError) {
          console.error('JSZip load error:', zipError);
          throw new Error('Failed to load the template as a ZIP file. Make sure it is a valid DOCX.');
        }

        const documentContent = await zip.file("word/document.xml")?.async("text") || "";

        // Convertir valores numéricos a string
        const monthlyRent = typeof leaseData.monthly_rent === 'number' ? leaseData.monthly_rent.toString() : leaseData.monthly_rent || "0";
        const securityDeposit = typeof leaseData.securityDeposit === 'number' ? leaseData.securityDeposit.toString() : leaseData.securityDeposit || "0";
        const latePaymentFee = typeof leaseData.latePaymentFee === 'number' ? leaseData.latePaymentFee.toString() : leaseData.latePaymentFee || "0";
        const nsfFee = typeof leaseData.nsfFee === 'number' ? leaseData.nsfFee.toString() : leaseData.nsfFee || "0";

        // Reemplazar variables con datos reales (patrón actualizado para funcionar con/sin asteriscos)
        const updatedContent = documentContent
        // Información del propietario
        .replace(/-\$landlordName-(\*)?/g, leaseData.landlordName || "N/A")
        .replace(/-\$landlordAddress-(\*)?/g, leaseData.landlordAddress || "N/A")
        .replace(/-\$landlordPhone-(\*)?/g, leaseData.landlordPhone || "N/A")
        .replace(/-\$landlordEmail-(\*)?/g, leaseData.landlordEmail || "N/A")
        .replace(/-\$landlordAgentSection-(\*)?/g, leaseData.landlordAgentName ? `Agent: ${leaseData.landlordAgentName}` : "")

        // Información del inquilino
        .replace(/-\$tenantName-(\*)?/g, leaseData.tenantName || "N/A")
        .replace(/-\$propertyLocation-(\*)?/g, leaseData.propertyLocation || "N/A")
        .replace(/-\$tenantPhone-(\*)?/g, leaseData.tenantPhone || "N/A")
        .replace(/-\$tenantEmail-(\*)?/g, leaseData.tenantEmail || "N/A")
        .replace(/-\$tenantEmergencyContact-(\*)?/g, leaseData.tenantEmergencyContact || "N/A")
        .replace(/-\$tenantEmergencyPhone-(\*)?/g, leaseData.tenantEmergencyPhone || "N/A")

        // Detalles de la propiedad
        .replace(/-\$propertyState-(\*)?/g, leaseData.propertyState || "N/A")
        .replace(/-\$propertyBathrooms-(\*)?/g, leaseData.bathrooms?.toString() || "1")
        .replace(/-\$propertyBedrooms-(\*)?/g, leaseData.bedrooms?.toString() || "1")
        .replace(/-\$propertyType-(\*)?/g, leaseData.propertyType || "Single Family Home")
        .replace(/-\$propertyBuiltYear-(\*)?/g, leaseData.propertyBuiltYear || "N/A")

        // Términos del contrato
        .replace(/-\$signingDate-(\*)?/g, leaseData.signingDate || new Date().toISOString().split('T')[0])
        .replace(/-\$leaseStart-(\*)?/g, leaseData.start_date || "N/A")
        .replace(/-\$leaseEnd-(\*)?/g, leaseData.end_date || "N/A")
        .replace(/-\$renewalOptionClause-(\*)?/g, leaseData.renewalOption ? "Renewal option included" : "No renewal option")
        .replace(/-\$earlyPossessionClause-(\*)?/g, leaseData.earlyPossession ? "Early possession allowed" : "No early possession")

        // Pagos
        .replace(/-\$rentPaymentFrequency-(\*)?/g, leaseData.rentPaymentFrequency || "Monthly")
        .replace(/-\$monthlyRent-(\*)?/g, monthlyRent)
        .replace(/-\$rentDueDay-(\*)?/g, leaseData.rentDueDay || "1")
        .replace(/-\$paymentMethodsString-(\*)?/g,
                 leaseData.paymentMethodsAllowed?.join(", ") || "Check, Bank Transfer")
        .replace(/-\$latePaymentFee-(\*)?/g, latePaymentFee)
        .replace(/-\$nsfFee-(\*)?/g, nsfFee)

        // Depósito de seguridad
        .replace(/-\$securityDeposit-(\*)?/g, securityDeposit)
        .replace(/-\$securityDepositReturnDays-(\*)?/g, leaseData.securityDepositReturnDays || "30")
        .replace(/-\$securityDepositRefund-(\*)?/g, leaseData.securityDepositRefund || "")

        // Otras cláusulas
        .replace(/-\$subleasingClause-(\*)?/g, leaseData.subleasingAllowed ? "Subleasing allowed" : "Subleasing not allowed")
        .replace(/-\$entryNoticeHours-(\*)?/g, leaseData.entryNoticeHours || "24")
        .replace(/-\$utilitiesBreakdown-(\*)?/g,
                 leaseData.utilities ? Object.entries(leaseData.utilities)
                 .map(([key, value]) => `${key}: ${value}`)
                 .join(", ") : "N/A")
        .replace(/-\$maintenanceResponsibilities-(\*)?/g, leaseData.maintenanceResponsibilities || "N/A")
        .replace(/-\$earlyTerminationClause-(\*)?/g, leaseData.terminationConditions || "N/A")
        .replace(/-\$petsPolicy-(\*)?/g, leaseData.petsAllowed ? "Pets allowed" : "No pets allowed")
        .replace(/-\$smokingPolicy-(\*)?/g,
                 leaseData.smokingAllowed ? "Smoking allowed" :
                 leaseData.vapingAllowed ? "Vaping allowed" : "No smoking or vaping")
        .replace(/-\$parkingPolicy-(\*)?/g, leaseData.parkingAllowed ? "Parking allowed" : "No parking")
        .replace(/-\$insuranceResponsibilities-(\*)?/g, leaseData.insuranceResponsibilities || "N/A")
        .replace(/-\$existingIssuesList-(\*)?/g, leaseData.existingIssues?.join(", ") || "None")
        .replace(/-\$terminationNoticeDays-(\*)?/g, leaseData.terminationNoticeDays || "30")
        .replace(/-\$holdoverPenalty-(\*)?/g, leaseData.holdoverPenalty || "0")
        .replace(/-\$asbestosDisclosure-(\*)?/g, leaseData.asbestos ? "Asbestos disclosed" : "No asbestos")
        .replace(/-\$disputeResolutionClause-(\*)?/g, leaseData.disputeResolution || "N/A")
        .replace(/-\$purchaseOptionSection-(\*)?/g, leaseData.optionToPurchase ? "Purchase option included" : "")
        .replace(/-\$customClauses-(\*)?/g,
                 leaseData.customClauses?.join("\n\n") || "")
        .replace(/-\$additionalTerms-(\*)?/g, leaseData.additionalTerms || "")
        .replace(/-\$noticesAddress-(\*)?/g, leaseData.noticesAddress || "N/A")
        .replace(/-\$landlordAgentSection-(\*)?/g, leaseData.landlordAgentName || "")
        .replace(/-\$leadPaintDisclosure-(\*)?/g, leaseData.leadPaint ? "Lead paint disclosed" : "No lead paint")

        // Recibo de depósito
        .replace(/-\$depositBankName-(\*)?/g, leaseData.depositBankName || "N/A")
        .replace(/-\$depositAccountNumber-(\*)?/g, leaseData.depositAccountNumber || "N/A");

        // Actualizar el contenido en el ZIP
        zip.file("word/document.xml", updatedContent);

        // Generar el nuevo DOCX
        finalBlob = await zip.generateAsync({ type: "blob" });
        fileName = `lease-contract-${propertyId}.docx`;
      } else {
        // Para la pestaña legal, generamos desde HTML
        fileName = `lease-legal-analysis-${propertyId}.docx`;

        // Crear el documento
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: "Legal Analysis", bold: true, size: 32 })],
                            spacing: { after: 200 }
              }),
              ...htmlToDocxElements(parsedLegalInfo)
            ]
          }]
        });

        // Generar el blob
        finalBlob = await Packer.toBlob(doc);
      }

      // Descargar el documento
      saveAs(finalBlob, fileName);

      toast({
        title: "Download completed",
        description: "DOCX document has been generated successfully",
      });
    } catch (error: any) {
      console.error('Error generating DOCX:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not generate DOCX document",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
    <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white">
    <div className="flex justify-between items-center">
    <div className="flex items-center space-x-2">
    <DialogTitle className="text-xl font-bold text-slate-800">Lease Agreement Preview</DialogTitle>
    <div className="flex items-center text-sm text-slate-500">
    <span className="font-medium">Property ID:</span>
    <span className="ml-1 bg-slate-100 px-2 py-1 rounded text-slate-700">{propertyId}</span>
    </div>
    </div>
    <Button
    variant="ghost"
    size="icon"
    onClick={onClose}
    className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    >
    <X className="h-5 w-5" />
    </Button>
    </div>
    </DialogHeader>

    <div className="flex-1 flex flex-col md:flex-row min-h-0">
    {/* Sidebar */}
    <div className="w-full md:w-64 flex-shrink-0 border-b md:border-r border-slate-200 bg-white">
    <div className="p-4">
    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Document Type</h3>
    <div className="space-y-1">
    <button
    onClick={() => setActiveTab("contract")}
    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
      activeTab === "contract"
      ? "bg-blue-50 text-blue-700 border border-blue-200"
      : "text-slate-700 hover:bg-slate-50"
    }`}
    >
    <FileText className="h-4 w-4 mr-3" />
    <span>Contract</span>
    {activeTab === "contract" && <ChevronRight className="h-4 w-4 ml-auto" />}
    </button>
    <button
    onClick={() => setActiveTab("legal")}
    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
      activeTab === "legal"
      ? "bg-blue-50 text-blue-700 border border-blue-200"
      : "text-slate-700 hover:bg-slate-50"
    }`}
    >
    <Scale className="h-4 w-4 mr-3" />
    <span>Legal Analysis</span>
    {activeTab === "legal" && <ChevronRight className="h-4 w-4 ml-auto" />}
    </button>
    </div>

    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Lease Details</h3>
    <div className="space-y-2 text-sm">
    <div className="flex justify-between">
    <span className="text-slate-500">Start Date:</span>
    <span className="font-medium text-slate-800">{leaseData.start_date}</span>
    </div>
    <div className="flex justify-between">
    <span className="text-slate-500">End Date:</span>
    <span className="font-medium text-slate-800">{leaseData.end_date}</span>
    </div>
    <div className="flex justify-between">
    <span className="text-slate-500">Monthly Rent:</span>
    <span className="font-medium text-slate-800">${typeof leaseData.monthly_rent === 'number' ? leaseData.monthly_rent.toFixed(2) : leaseData.monthly_rent}</span>
    </div>
    <div className="flex justify-between">
    <span className="text-slate-500">Deposit:</span>
    <span className="font-medium text-slate-800">${typeof leaseData.securityDeposit === 'number' ? leaseData.securityDeposit.toFixed(2) : leaseData.securityDeposit}</span>
    </div>
    </div>
    </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-h-0">
    {/* Tab content */}
    <div className={`flex-1 overflow-auto min-h-0 ${activeTab === "contract" ? "block" : "hidden"}`}>
    <div
    ref={contractRef}
    className="p-6 md:p-8 bg-white overflow-y-auto min-h-full print-section"
    dangerouslySetInnerHTML={{ __html: leaseHtml }}
    />
    </div>

    <div className={`flex-1 overflow-auto min-h-0 ${activeTab === "legal" ? "block" : "hidden"}`}>
    <div
    ref={legalRef}
    className="p-6 md:p-8 bg-white overflow-y-auto min-h-full print-section"
    >
    <div className="prose prose-blue max-w-none">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
    <h3 className="text-2xl font-bold text-slate-800">
    Legal Analysis
    </h3>
    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
    Generated
    </span>
    </div>
    <div
    className="bg-white p-4 rounded-lg border border-slate-100"
    dangerouslySetInnerHTML={{ __html: parsedLegalInfo }}
    />
    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <div className="flex items-center">
    <div className="bg-blue-100 p-2 rounded-lg mr-3">
    <Scale className="h-6 w-6 text-blue-600" />
    </div>
    <div>
    <h4 className="font-bold text-blue-800">Important Notes</h4>
    <p className="mt-1 text-sm text-blue-700">
    This legal review is generated automatically. For complex agreements,
    we recommend consulting with a qualified attorney.
    </p>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 border-t border-slate-200 bg-white gap-4">
    <div className="flex flex-wrap gap-2">
    <Button
    variant="outline"
    onClick={downloadDOCX}
    disabled={isDownloading}
    className="flex items-center bg-white hover:bg-slate-50 border-slate-300"
    >
    {isDownloading ? (
      <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating DOCX...</span>
      </>
    ) : (
      <>
      <Download className="h-4 w-4 mr-2" />
      <span>Download DOCX</span>
      </>
    )}
    </Button>
    </div>

    <div className="flex flex-wrap gap-2">
    <Button
    variant="outline"
    onClick={onClose}
    className="border-slate-300 hover:bg-slate-50"
    >
    Cancel
    </Button>
    <Button
    onClick={handleSaveLease}
    disabled={isSaving}
    className="bg-blue-600 hover:bg-blue-700"
    >
    {isSaving ? (
      <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Saving Agreement...</span>
      </>
    ) : (
      <>
      <Save className="h-4 w-4 mr-2" />
      <span>Save Lease Agreement</span>
      </>
    )}
    </Button>
    </div>
    </div>
    </DialogContent>
    </Dialog>
  );
}
