"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, X, Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePropertyContext } from "@/context/property-context"
import { useLandlord } from '@/context/user-context'
import { useToast } from "@/hooks/use-toast"
import CustomSelect from "@/components/ui/select-trigger"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import HelpTooltip from "@/components/ui/helptooltip"
import axios from 'axios';

import dynamic from 'next/dynamic'
const ContractModal = dynamic(
  () => import('@/components/lease-modal'),
  { ssr: false }
)

import { generateLeaseHTML } from "./lease-generator"


const evictionClause = `
Eviction for Noncompliance or Nonpayment
If the Tenant fails to pay rent when due or materially violates any terms of this Lease, the Landlord may begin eviction proceedings as permitted under applicable state law. This includes, but is not limited to, failure to:
• Pay rent within the statutory notice period after written notice,
• Comply with material lease obligations within the cure period defined by state law,
• Cease illegal activity or serious nuisance behavior after written notice.

If such a default occurs, the Landlord may terminate the Lease in accordance with state law and file for possession through the appropriate court. Any legal costs and attorney’s fees incurred in the eviction process shall be recoverable from the Tenant, to the extent permitted by law.
`;

const defaultClauses = [
  evictionClause
];

// Tipos mejorados para cubrir todos los nuevos campos
type LeaseData = {

  includedItems?: string[];
  customItems: string[];  
  
  // Problemas existentes
  existingIssues?: string[];
  issueDescriptions: string[];  

  // Información de la propiedad
  propertyType: string;
  propertyLocation: string;
  propertyState: string;
  propertyBuiltYear: string;
  propertyId: string;

  // Información del propietario
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;
  landlordAgentName: string;

  // Información del inquilino
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantEmergencyContact: string;
  tenantEmergencyPhone: string;
  additionalOccupants: string;

  // Términos del contrato
  leaseType: string;
  leaseTerm: string;
  leaseTermDetails: string;
  earlyPossession: boolean;
  agreementDate: string;
  leaseStart: string;
  leaseEnd: string;
  renewalOption: boolean;
  renewalTerms: string;

  // Términos de pago
  monthlyRent: string;
  rentPaymentFrequency: string;
  rentDueDay: string;
  paymentMethodsAllowed: string[];
  latePaymentFee: string;
  latePaymentGracePeriod: string;
  nsfFee: string;

  // Depósitos y cargos
  securityDeposit: string;
  securityDepositRefund: string;
  securityDepositReturnDays: string;
  petDeposit: string;
  petFee: string;

  // Políticas
  smokingAllowed: boolean;
  vapingAllowed: boolean;
  petsAllowed: boolean;
  allowedPets: string;
  petTerms: string;
  petDepositReturnDays: string;
  parkingAllowed: boolean;
  parkingExclusive: boolean;
  parkingDescription: string;
  childrenAllowed: boolean;
  alterationsAllowed: boolean;
  subleasingAllowed: boolean;

  // Responsabilidades
  utilities: Record<string, 'tenant' | 'landlord'>;
  maintenanceResponsibilities: string;
  insuranceResponsibilities: string;

  // Notificaciones
  entryNoticeHours: string;
  terminationNoticeDays: string;
  noticesAddress: string;

  // Opción de compra
  optionToPurchase: boolean;
  purchasePriceType: string;
  purchasePrice: string;
  optionFee: string;
  optionDeposit: string;
  optionExpiry: string;
  purchaseDays: string;

  // Materiales peligrosos
  leadPaint: boolean;
  leadPaintDescription: string;
  leadPaintReports: string;
  asbestos: boolean;
  asbestosDescription: string;
  asbestosReports: string;

  // Resolución de disputas
  disputeResolution: string;
  disputeCostPaidBy: string;

  // Terminación anticipada
  earlyTerminationFee: string;

  // Inspección
  inspectionReport: boolean;

  // Cláusulas
  terminationConditions: string;
  predefinedClauses: string[];
  customClauses: string[];
  additionalTerms: string;

  // Firma
  signingDate: string;
}

const PROPERTY_TYPES = [
  "House", "Apartment", "Suite", "Basement", "Condo",
  "Duplex", "Mobile Home", "Room", "Townhouse", "Other"
];

const LEASE_TYPES = [
  "Standard agreement (Most popular)",
  "Comprehensive agreement"
];

const LEASE_TERMS = [
  "Fixed Term",
  "Month-to-Month",
  "Year-to-Year"
];

const PAYMENT_FREQUENCIES = [
  "Weekly", "Every 2 weeks", "Monthly", "Quarterly", "Annually"
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit_card", label: "Credit Card" },
  { value: "online_payment", label: "Online Payment" },
  { value: "direct_debit", label: "Direct Debit" },
  { value: "venmo", label: "Venmo" }
];

const UTILITIES_OPTIONS = [
  "Water/Sewer", "Electricity", "Gas", "Internet",
  "Cable", "Telephone", "Garbage Collection",
  "Alarm/Security System", "Heating Oil/Propane", "Other"
];

const INSURANCE_TYPES = [
  "Landlord's contents",
  "Damage to rental property",
  "Personal injury on property"
];

const DISPUTE_RESOLUTIONS = [
  "Do not include in the contract",
  "Mediation",
  "Arbitration",
  "Mediation then arbitration"
];

const PREDEFINED_CLAUSES = [
  "Smoking is strictly prohibited inside the premises.",
  "Tenant is responsible for maintaining the lawn and yard areas.",
  "Tenant must obtain renters insurance with minimum $100,000 liability coverage.",
  "Quiet hours are from 10 PM to 7 AM daily.",
  "Tenant must notify landlord of any extended absences (over 7 days).",
  "No modifications to the property without written landlord consent.",
  "Tenant is responsible for changing HVAC filters monthly.",
  "Garbage must be properly contained and placed in designated areas.",
  "No subletting without landlord's written permission.",
  "Tenant must report any maintenance issues within 48 hours of discovery.",
  "No waterbeds or aquariums over 20 gallons allowed.",
  "Tenant is responsible for pest control if infestation is caused by tenant behavior.",
  "No window air conditioning units allowed without approval.",
  "Tenant must provide copy of pet vaccination records if pets are allowed."
];

export default function CreateLeasePage() {
  const [leaseModalinfoLegal, setLeaseModalinfoLegal] = useState('');
  const [leaseModal, setLeaseModal] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { properties, tenants } = usePropertyContext();
  const { landlord } = useLandlord();

  const extractState = (address: string): string => {
    const states = [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
      "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming"
    ];

    return states.find(state =>
      address.toLowerCase().includes(state.toLowerCase())
    ) || "";
  };

  const occupiedProperties = properties.filter((p) => p.status === "occupied");

  const [formData, setFormData] = useState<LeaseData>({

     
 // Artículos incluidos
    includedItems: [],
    customItems: [],
    
    // Problemas existentes
    existingIssues: [],
    issueDescriptions: [],

    // Información de la propiedad
    propertyType: "",
    propertyLocation: "",
    propertyState: "",
    propertyBuiltYear: "",
    propertyId: "",

    // Información del propietario
    landlordName: landlord.name || "",
    landlordAddress: landlord.ubication|| "",
    landlordPhone: landlord.phone || "",
    landlordEmail: landlord.email || "",
    landlordAgentName: "",

    // Información del inquilino
    tenantName: "",
    tenantPhone: "",
    tenantEmail: "",
    tenantEmergencyContact: "",
    tenantEmergencyPhone: "",
    additionalOccupants: "",

    // Términos del contrato
    leaseType: "Standard agreement (Most popular)",
    leaseTerm: "Fixed Term",
    leaseTermDetails: "",
    earlyPossession: false,
    agreementDate: new Date().toISOString().split("T")[0],
    leaseStart: new Date().toISOString().split("T")[0],
    leaseEnd: "",
    renewalOption: false,
    renewalTerms: "",

    // Términos de pago
    monthlyRent: "",
    rentPaymentFrequency: "Monthly",
    rentDueDay: "1",
    paymentMethodsAllowed: ["check", "bank_transfer"],
    latePaymentFee: "",
    latePaymentGracePeriod: "5",
    nsfFee: "",

    // Depósitos y cargos
    securityDeposit: "",
    securityDepositRefund: "Refundable after property inspection minus any damages",
    securityDepositReturnDays: "30",
    petDeposit: "0",
    petFee: "0",

    // Políticas
    smokingAllowed: false,
    vapingAllowed: false,
    petsAllowed: false,
    allowedPets: "",
    petTerms: "",
    petDepositReturnDays: "30",
    parkingAllowed: false,
    parkingExclusive: false,
    parkingDescription: "",
    childrenAllowed: true,
    alterationsAllowed: false,
    subleasingAllowed: false,

    // Responsabilidades
    utilities: {
      "Water/Sewer": "tenant",
      "Electricity": "tenant",
      "Gas": "tenant",
      "Garbage Collection": "landlord",
    },
    maintenanceResponsibilities: "Maintain property in good condition and notify landlord of any damages",
    insuranceResponsibilities: "",
    
    // Notificaciones
    entryNoticeHours: "24",
    terminationNoticeDays: "30",
    noticesAddress: landlord.ubication|| "",

    // Opción de compra
    optionToPurchase: false,
    purchasePriceType: "",
    purchasePrice: "",
    optionFee: "",
    optionDeposit: "",
    optionExpiry: "",
    purchaseDays: "30",

    // Materiales peligrosos
    leadPaint: false,
    leadPaintDescription: "",
    leadPaintReports: "",
    asbestos: false,
    asbestosDescription: "",
    asbestosReports: "",

    // Resolución de disputas
    disputeResolution: "Do not include in the contract",
    disputeCostPaidBy: "Both equally",

    // Terminación anticipada
    earlyTerminationFee: "",

    // Inspección
    inspectionReport: true,

    // Cláusulas
    terminationConditions: "30 days written notice required",
    predefinedClauses: [],
    customClauses: [evictionClause],
    additionalTerms: "",

    // Firma
    signingDate: new Date().toISOString().split("T")[0]
  });

  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [isClauseDialogOpen, setIsClauseDialogOpen] = useState(false);
  const [newCustomClause, setNewCustomClause] = useState('');
  const [editingClauseIndex, setEditingClauseIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); // Nuevo estado para controlar la generación

  const [newCustomItem, setNewCustomItem] = useState('');
  const [newIssueDescription, setNewIssueDescription] = useState('');

  // Funciones para agregar nuevos items
  const addCustomItem = () => {
    if (newCustomItem.trim()) {
      setFormData(prev => ({
        ...prev,
        customItems: [...prev.customItems, newCustomItem.trim()]
      }));
      setNewCustomItem('');
    }
  };

  const addIssueDescription = () => {
    if (newIssueDescription.trim()) {
      setFormData(prev => ({
        ...prev,
        issueDescriptions: [...prev.issueDescriptions, newIssueDescription.trim()]
      }));
      setNewIssueDescription('');
    }
  };

  useEffect(() => {
    if (formData.propertyId) {
      const property = properties.find(p => p.id === formData.propertyId);
      if (property) {
        const state = extractState(property.address);
        const propertyTenants = tenants.filter(t => t.propertyId === formData.propertyId);

        setFormData(prev => ({
          ...prev,
          propertyLocation: property.address,
          propertyState: state,
          tenantName: propertyTenants[0]?.name || "",
          tenantPhone: propertyTenants[0]?.phone || "",
          tenantEmail: propertyTenants[0]?.email || ""
        }));
      }
    }

    // Actualizar información del propietario
    setFormData(prev => ({
      ...prev,
      landlordName: landlord.name || "",
      landlordAddress: landlord.ubication|| "",
      landlordPhone: landlord.phone || "",
      landlordEmail: landlord.email || "",
      noticesAddress: landlord.ubication|| ""
    }));
  }, [formData.propertyId, properties, tenants, landlord]);

  // Manejadores genéricos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleUtilityChange = (utility: string, responsible: 'tenant' | 'landlord') => {
    setFormData(prev => ({
      ...prev,
      utilities: {
        ...prev.utilities,
        [utility]: responsible
      }
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => {
      const newMethods = prev.paymentMethodsAllowed.includes(method)
        ? prev.paymentMethodsAllowed.filter(m => m !== method)
        : [...prev.paymentMethodsAllowed, method];

      return { ...prev, paymentMethodsAllowed: newMethods };
    });
  };

  // Funciones para manejar cláusulas
  const handleAddPredefinedClauses = () => {
    setFormData(prev => ({
      ...prev,
      predefinedClauses: [...prev.predefinedClauses, ...selectedClauses]
    }));
    setSelectedClauses([]);
    setIsClauseDialogOpen(false);
  };

  const handleClauseSelect = (clause: string) => {
    setSelectedClauses(prev =>
      prev.includes(clause)
        ? prev.filter(c => c !== clause)
        : [...prev, clause]
    );
  };

  const handleAddCustomClause = () => {
    if (newCustomClause.trim()) {
      if (editingClauseIndex !== null) {
        const updatedClauses = [...formData.customClauses];
        updatedClauses[editingClauseIndex] = newCustomClause;
        setFormData(prev => ({ ...prev, customClauses: updatedClauses }));
        setEditingClauseIndex(null);
      } else {
        setFormData(prev => ({
          ...prev,
          customClauses: [...prev.customClauses, newCustomClause]
        }));
      }
      setNewCustomClause('');
    }
  };

  // Validación y envío (similar al original, pero adaptado a nuevos campos)
  const validateForm = () => {
    const requiredFields = [
      'propertyId', 'leaseStart', 'leaseEnd', 'monthlyRent',
      'securityDeposit', 'tenantEmergencyContact', 'tenantEmergencyPhone'
    ];

    return requiredFields.every(field => {
      if (!formData[field as keyof LeaseData]) {
        toast({
          variant: "destructive",
          title: "Missing required fields",
          description: `Field ${field} is required`,
        });
        return false;
      }
      return true;
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const allClauses = [...formData.predefinedClauses, ...formData.customClauses];
    setIsGenerating(true); // Activar estado de carga

    if (allClauses.length === 0) {
      toast({
        variant: "destructive",
        title: "Clauses required",
        description: "At least one clause is required to generate the lease",
      });
   setIsGenerating(false); // Desactivar estado de carga

      return;
    }

    const payload = {
      state: formData.propertyState,
      clauses: allClauses,
      leaseDetails: formData
    };

    try {
      const response = await axios.post("/api/lease", payload);
      const { legalAnalysis, rewrittenClauses } = response.data;

      // Crear una copia actualizada de los datos con las cláusulas reescritas
      const updatedLeaseData = {
        ...formData,
        customClauses: rewrittenClauses
      };

      // Generar el HTML del contrato con los datos actualizados
      const htmlContract = generateLeaseHTML(updatedLeaseData);
      //console.log(htmlContract )

      // Actualizar los estados para mostrar el modal
      setLeaseModal(htmlContract);
      setLeaseModalinfoLegal(legalAnalysis);
      setIsOpen(true);

      toast({
        title: "Lease generated successfully",
        description: "Your lease agreement is ready for review",
      });
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Unknown error occurred";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Generation error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Lease Agreement</h1>
        <p className="text-muted-foreground">Generate a new lease agreement for your tenant</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Lease Agreement Builder</CardTitle>
            <CardDescription>
              Complete all sections to create your custom lease agreement
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Sección 1: Información de la Propiedad */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Property Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <CustomSelect
                    id="propertyType"
                    value={formData.propertyType}
                    options={PROPERTY_TYPES.map(type => ({ value: type, label: type }))}
                    onChange={(value) => handleSelectChange("propertyType", value)}
                    placeholder="Select property type"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyState">State</Label>
                  <Input
                    id="propertyState"
                    name="propertyState"
                    value={formData.propertyState}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property</Label>
                  <CustomSelect
                    id="propertyId"
                    value={formData.propertyId}
                    options={occupiedProperties.map((p) => ({
                      value: p.id,
                      label: p.address
                    }))}
                    onChange={(value) => handleSelectChange("propertyId", value)}
                    required
                    placeholder="Select property"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyLocation">Address</Label>
                  <Input
                    id="propertyLocation"
                    name="propertyLocation"
                    value={formData.propertyLocation}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyBuiltYear">When was the property built?</Label>
                <CustomSelect
                  id="propertyBuiltYear"
                  value={formData.propertyBuiltYear}
                  options={[
                    { value: "1978 or before", label: "1978 or before" },
                    { value: "1979 or 1980", label: "1979 or 1980" },
                    { value: "1981 or later", label: "1981 or later" }
                  ]}
                  onChange={(value) => handleSelectChange("propertyBuiltYear", value)}
                  placeholder="Select year"
                />
              </div>
            </div>

            {/* Sección 2: Información del Propietario */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Landlord Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landlordName">Full Name</Label>
                  <Input
                    id="landlordName"
                    name="landlordName"
                    value={formData.landlordName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landlordAddress">Address</Label>
                  <Input
                    id="landlordAddress"
                    name="landlordAddress"
                    value={formData.landlordAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landlordPhone">Phone</Label>
                  <Input
                    id="landlordPhone"
                    name="landlordPhone"
                    value={formData.landlordPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landlordEmail">Email</Label>
                  <Input
                    id="landlordEmail"
                    name="landlordEmail"
                    type="email"
                    value={formData.landlordEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landlordAgentName">Agent Name (if applicable)</Label>
                <Input
                  id="landlordAgentName"
                  name="landlordAgentName"
                  value={formData.landlordAgentName}
                  onChange={handleChange}
                  placeholder="Agent's full name"
                />
              </div>
            </div>

            {/* Sección 3: Información del Inquilino */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Tenant Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Full Name</Label>
                  <Input
                    id="tenantName"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenantPhone">Phone</Label>
                  <Input
                    id="tenantPhone"
                    name="tenantPhone"
                    value={formData.tenantPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantEmail">Email</Label>
                  <Input
                    id="tenantEmail"
                    name="tenantEmail"
                    type="email"
                    value={formData.tenantEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenantEmergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="tenantEmergencyContact"
                    name="tenantEmergencyContact"
                    value={formData.tenantEmergencyContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantEmergencyPhone">Emergency Contact Number</Label>
                  <Input
                    id="tenantEmergencyPhone"
                    name="tenantEmergencyPhone"
                    value={formData.tenantEmergencyPhone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalOccupants">Additional Occupants</Label>
                  <Input
                    id="additionalOccupants"
                    name="additionalOccupants"
                    value={formData.additionalOccupants}
                    onChange={handleChange}
                    placeholder="Names separated by commas"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Términos del Contrato */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Lease Terms</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">



                <div className="space-y-2">
                  <Label htmlFor="leaseTerm">Lease Term</Label>
                  <CustomSelect
                    id="leaseTerm"
                    value={formData.leaseTerm}
                    options={LEASE_TERMS.map(term => ({ value: term, label: term }))}
                    onChange={(value) => handleSelectChange("leaseTerm", value)}
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="earlyPossession"
                      checked={formData.earlyPossession}
                      onCheckedChange={(checked) => handleCheckboxChange("earlyPossession", Boolean(checked))}
                    />
                    <Label htmlFor="earlyPossession">Allow early possession</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agreementDate">Agreement Date</Label>
                  <Input
                    id="agreementDate"
                    name="agreementDate"
                    type="date"
                    value={formData.agreementDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaseStart">Lease Start Date</Label>
                  <Input
                    id="leaseStart"
                    name="leaseStart"
                    type="date"
                    value={formData.leaseStart}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseEnd">Lease End Date</Label>
                  <Input
                    id="leaseEnd"
                    name="leaseEnd"
                    type="date"
                    value={formData.leaseEnd}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="renewalOption"
                      checked={formData.renewalOption}
                      onCheckedChange={(checked) => handleCheckboxChange("renewalOption", Boolean(checked))}
                    />
                    <Label htmlFor="renewalOption">Renewal Option</Label>
                  </div>

                  {formData.renewalOption && (
                    <Textarea
                      id="renewalTerms"
                      name="renewalTerms"
                      value={formData.renewalTerms}
                      onChange={handleChange}
                      placeholder="Renewal terms and conditions"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Sección 5: Términos de Pago */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Payment Terms</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentPaymentFrequency">Payment Frequency</Label>
                  <CustomSelect
                    id="rentPaymentFrequency"
                    value={formData.rentPaymentFrequency}
                    options={PAYMENT_FREQUENCIES.map(freq => ({ value: freq, label: freq }))}
                    onChange={(value) => handleSelectChange("rentPaymentFrequency", value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Rent Amount ($)</Label>
                  <Input
                    id="monthlyRent"
                    name="monthlyRent"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentDueDay">Due Day</Label>
                  <Input
                    id="rentDueDay"
                    name="rentDueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.rentDueDay}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed Payment Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <Button
                      key={method.value}
                      type="button"
                      variant={
                        formData.paymentMethodsAllowed.includes(method.value)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handlePaymentMethodToggle(method.value)}
                    >
                      {method.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latePaymentGracePeriod">Late Payment Grace Period (days)</Label>
                  <Input
                    id="latePaymentGracePeriod"
                    name="latePaymentGracePeriod"
                    type="number"
                    min="0"
                    value={formData.latePaymentGracePeriod}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latePaymentFee">Late Payment Fee ($)</Label>
                  <Input
                    id="latePaymentFee"
                    name="latePaymentFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.latePaymentFee}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nsfFee">NSF Check Fee ($)</Label>
                <Input
                  id="nsfFee"
                  name="nsfFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.nsfFee}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sección 6: Depósitos y Garantías */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Deposits & Fees</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                  <Input
                    id="securityDeposit"
                    name="securityDeposit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityDepositReturnDays">Days to Return Deposit</Label>
                  <Input
                    id="securityDepositReturnDays"
                    name="securityDepositReturnDays"
                    type="number"
                    min="0"
                    value={formData.securityDepositReturnDays}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityDepositRefund">Security Deposit Refund Conditions</Label>
                <Textarea
                  id="securityDepositRefund"
                  name="securityDepositRefund"
                  value={formData.securityDepositRefund}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sección 7: Políticas */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Property Policies</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smokingAllowed"
                      checked={formData.smokingAllowed}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        handleCheckboxChange("smokingAllowed", isChecked);

                        // Añadir cláusula automáticamente si se desmarca
                        if (!isChecked && !formData.predefinedClauses.includes("Smoking is strictly prohibited inside the premises.")) {
                          setFormData(prev => ({
                            ...prev,
                            predefinedClauses: [
                              ...prev.predefinedClauses,
                              "Smoking is strictly prohibited inside the premises."
                            ]
                          }));
                        }
                      }}
                    />
                    <Label htmlFor="smokingAllowed">Smoking Allowed</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vapingAllowed"
                      checked={formData.vapingAllowed}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        handleCheckboxChange("vapingAllowed", isChecked);

                        // Añadir cláusula automáticamente si se desmarca
                        if (!isChecked && !formData.predefinedClauses.includes("Vaping is strictly prohibited inside the premises.")) {
                          setFormData(prev => ({
                            ...prev,
                            predefinedClauses: [
                              ...prev.predefinedClauses,
                              "Vaping is strictly prohibited inside the premises."
                            ]
                          }));
                        }
                      }}
                    />
                    <Label htmlFor="vapingAllowed">Vaping Allowed</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="childrenAllowed"
                      checked={formData.childrenAllowed}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        handleCheckboxChange("childrenAllowed", isChecked);

                        // Añadir cláusula automáticamente si se desmarca
                        if (!isChecked && !formData.predefinedClauses.includes("This property is legally designated as a 55+ senior community.")) {
                          setFormData(prev => ({
                            ...prev,
                            predefinedClauses: [
                              ...prev.predefinedClauses,
                              "This property is legally designated as a 55+ senior community."
                            ]
                          }));
                        }
                      }}
                    />
                    <Label htmlFor="childrenAllowed">
                      Family-Friendly Property
                      <HelpTooltip
                        message="Note: Under the Fair Housing Act, it is generally illegal to prohibit children except in qualified senior housing (55+ communities). Unchecking this will automatically add a clause stating this property is legally designated senior housing."
                        className="ml-1"
                      />
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="alterationsAllowed"
                      checked={formData.alterationsAllowed}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        handleCheckboxChange("alterationsAllowed", isChecked);

                        // Añadir cláusula automáticamente si se desmarca
                        if (!isChecked && !formData.predefinedClauses.includes("No modifications to the property without written landlord consent.")) {
                          setFormData(prev => ({
                            ...prev,
                            predefinedClauses: [
                              ...prev.predefinedClauses,
                              "No modifications to the property without written landlord consent."
                            ]
                          }));
                        }
                      }}
                    />
                    <Label htmlFor="alterationsAllowed">Alterations Allowed</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parkingAllowed"
                    checked={formData.parkingAllowed}
                    onCheckedChange={(checked) => {
                      const isChecked = Boolean(checked);
                      handleCheckboxChange("parkingAllowed", isChecked);

                      // Añadir cláusula automáticamente si se marca
                      if (isChecked && !formData.predefinedClauses.includes("Tenant will have access to designated parking areas.")) {
                        setFormData(prev => ({
                          ...prev,
                          predefinedClauses: [
                            ...prev.predefinedClauses,
                            "Tenant will have access to designated parking areas."
                          ]
                        }));
                      }
                    }}
                  />
                  <Label htmlFor="parkingAllowed">Parking Allowed</Label>
                </div>

                {formData.parkingAllowed && (
                  <>
                    <div className="flex items-center space-x-2 ml-6">
                      <Checkbox
                        id="parkingExclusive"
                        checked={formData.parkingExclusive}
                        onCheckedChange={(checked) => {
                          const isChecked = Boolean(checked);
                          handleCheckboxChange("parkingExclusive", isChecked);

                          // Actualizar cláusula existente o añadir nueva
                          const parkingClauseIndex = formData.predefinedClauses.findIndex(
                            c => c.includes("parking")
                          );

                          const newClause = "Tenant will have exclusive access to designated parking areas.";

                          if (parkingClauseIndex !== -1) {
                            const updatedClauses = [...formData.predefinedClauses];
                            updatedClauses[parkingClauseIndex] = newClause;

                            setFormData(prev => ({
                              ...prev,
                              predefinedClauses: updatedClauses
                            }));
                          } else if (isChecked) {
                            setFormData(prev => ({
                              ...prev,
                              predefinedClauses: [
                                ...prev.predefinedClauses,
                                newClause
                              ]
                            }));
                          }
                        }}
                      />
                      <Label htmlFor="parkingExclusive">Exclusive Parking</Label>
                    </div>

                    {formData.parkingExclusive && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="parkingDescription">Parking Description</Label>
                        <Input
                          id="parkingDescription"
                          name="parkingDescription"
                          value={formData.parkingDescription}
                          onChange={handleChange}
                          placeholder="Describe parking spaces"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subleasingAllowed"
                    checked={formData.subleasingAllowed}
                    onCheckedChange={(checked) => {
                      const isChecked = Boolean(checked);
                      handleCheckboxChange("subleasingAllowed", isChecked);

                      // Añadir cláusula automáticamente si se desmarca
                      if (!isChecked && !formData.predefinedClauses.includes("No subletting without landlord's written permission.")) {
                        setFormData(prev => ({
                          ...prev,
                          predefinedClauses: [
                            ...prev.predefinedClauses,
                            "No subletting without landlord's written permission."
                          ]
                        }));
                      }
                    }}
                  />
                  <Label htmlFor="subleasingAllowed">Subleasing Allowed</Label>
                </div>
              </div>
            </div>

            {/* Sección 8: Mascotas */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Pet Policy</h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petsAllowed"
                    checked={formData.petsAllowed}
                    onCheckedChange={(checked) => handleCheckboxChange("petsAllowed", Boolean(checked))}
                  />
                  <Label htmlFor="petsAllowed">Pets Allowed</Label>
                  {!formData.petsAllowed && (
                    <HelpTooltip
                      message="Note: Emotional support animals may be permitted under federal law"
                      className="ml-1"
                    />
                  )}
                </div>

                {formData.petsAllowed && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="petDeposit">Pet Deposit ($)</Label>
                        <Input
                          id="petDeposit"
                          name="petDeposit"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.petDeposit}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="petFee">Pet Fee (Non-refundable, $)</Label>
                        <Input
                          id="petFee"
                          name="petFee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.petFee}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="allowedPets">Allowed Pets</Label>
                        <Input
                          id="allowedPets"
                          name="allowedPets"
                          value={formData.allowedPets}
                          onChange={handleChange}
                          placeholder="e.g., Dogs, Cats (max 2)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="petDepositReturnDays">Days to Return Pet Deposit</Label>
                        <Input
                          id="petDepositReturnDays"
                          name="petDepositReturnDays"
                          type="number"
                          min="0"
                          value={formData.petDepositReturnDays}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="petTerms">Pet Terms & Conditions</Label>
                      <Textarea
                        id="petTerms"
                        name="petTerms"
                        value={formData.petTerms}
                        onChange={handleChange}
                        placeholder="Specific terms for pets"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sección 9: Responsabilidades de Servicios */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Utility Responsibilities</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utility</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landlord</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {UTILITIES_OPTIONS.map(utility => (
                      <tr key={utility}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{utility}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name={`utility-${utility}`}
                            checked={formData.utilities[utility] === 'tenant'}
                            onChange={() => handleUtilityChange(utility, 'tenant')}
                            className="h-4 w-4 text-blue-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name={`utility-${utility}`}
                            checked={formData.utilities[utility] === 'landlord'}
                            onChange={() => handleUtilityChange(utility, 'landlord')}
                            className="h-4 w-4 text-blue-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección 10: Mantenimiento y Seguros */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Maintenance & Insurance</h3>

              <div className="space-y-2">
                <Label htmlFor="maintenanceResponsibilities">Maintenance Responsibilities</Label>
                <Textarea
                  id="maintenanceResponsibilities"
                  name="maintenanceResponsibilities"
                  value={formData.maintenanceResponsibilities}
                  onChange={handleChange}
                  placeholder="Describe tenant maintenance responsibilities"
                />
              </div>

              <div className="space-y-2">
                <Label>Insurance Responsibilities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INSURANCE_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox id={`insurance-${type}`} />
                      <Label htmlFor={`insurance-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sección 11: Notificaciones y Entrada */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Notices & Entry</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryNoticeHours">Non-Emergency Entry Notice (hours)</Label>
                  <Input
                    id="entryNoticeHours"
                    name="entryNoticeHours"
                    type="number"
                    min="0"
                    value={formData.entryNoticeHours}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminationNoticeDays">Termination Notice (days)</Label>
                  <Input
                    id="terminationNoticeDays"
                    name="terminationNoticeDays"
                    type="number"
                    min="0"
                    value={formData.terminationNoticeDays}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticesAddress">Notices Address</Label>
                <Input
                  id="noticesAddress"
                  name="noticesAddress"
                  value={formData.noticesAddress}
                  onChange={handleChange}
                  placeholder="Street, City, State ZIP Code"
                />
              </div>
            </div>

            {/* Sección 12: Opción de Compra */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Option to Purchase</h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optionToPurchase"
                    checked={formData.optionToPurchase}
                    onCheckedChange={(checked) => handleCheckboxChange("optionToPurchase", Boolean(checked))}
                  />
                  <Label htmlFor="optionToPurchase">Option to Purchase Included</Label>
                </div>

                {formData.optionToPurchase && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="purchasePriceType">Purchase Price Determination</Label>
                        <CustomSelect
                          id="purchasePriceType"
                          value={formData.purchasePriceType}
                          options={[
                            { value: "specific", label: "Specific amount" },
                            { value: "appraisal", label: "Average of market appraisals" }
                          ]}
                          onChange={(value) => handleSelectChange("purchasePriceType", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                        <Input
                          id="purchasePrice"
                          name="purchasePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.purchasePrice}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="optionFee">Option Fee ($)</Label>
                        <Input
                          id="optionFee"
                          name="optionFee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.optionFee}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="optionDeposit">Option Deposit ($)</Label>
                        <Input
                          id="optionDeposit"
                          name="optionDeposit"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.optionDeposit}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="optionExpiry">Option Expiry Date</Label>
                        <Input
                          id="optionExpiry"
                          name="optionExpiry"
                          type="date"
                          value={formData.optionExpiry}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="ml-6 space-y-2">
                      <Label htmlFor="purchaseDays">Days to Complete Purchase</Label>
                      <Input
                        id="purchaseDays"
                        name="purchaseDays"
                        type="number"
                        min="0"
                        value={formData.purchaseDays}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sección 13: Materiales Peligrosos */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Hazardous Materials</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="leadPaint"
                      checked={formData.leadPaint}
                      onCheckedChange={(checked) => handleCheckboxChange("leadPaint", Boolean(checked))}
                    />
                    <Label htmlFor="leadPaint">Lead-Based Paint Present</Label>
                  </div>

                  {formData.leadPaint && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="leadPaintDescription">Description</Label>
                      <Textarea
                        id="leadPaintDescription"
                        name="leadPaintDescription"
                        value={formData.leadPaintDescription}
                        onChange={handleChange}
                      />

                      <Label htmlFor="leadPaintReports">Reports and Records</Label>
                      <Textarea
                        id="leadPaintReports"
                        name="leadPaintReports"
                        value={formData.leadPaintReports}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="asbestos"
                      checked={formData.asbestos}
                      onCheckedChange={(checked) => handleCheckboxChange("asbestos", Boolean(checked))}
                    />
                    <Label htmlFor="asbestos">Asbestos Present</Label>
                  </div>

                  {formData.asbestos && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="asbestosDescription">Description</Label>
                      <Textarea
                        id="asbestosDescription"
                        name="asbestosDescription"
                        value={formData.asbestosDescription}
                        onChange={handleChange}
                      />

                      <Label htmlFor="asbestosReports">Reports and Records</Label>
                      <Textarea
                        id="asbestosReports"
                        name="asbestosReports"
                        value={formData.asbestosReports}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 14: Resolución de Disputas */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Dispute Resolution</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disputeResolution">Dispute Resolution Method</Label>
                  <CustomSelect
                    id="disputeResolution"
                    value={formData.disputeResolution}
                    options={DISPUTE_RESOLUTIONS.map(method => ({ value: method, label: method }))}
                    onChange={(value) => handleSelectChange("disputeResolution", value)}
                  />
                </div>

                {formData.disputeResolution !== "Do not include in the contract" && (
                  <div className="space-y-2">
                    <Label>Dispute Costs Paid By</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="disputeBoth"
                          name="disputeCostPaidBy"
                          value="Both equally"
                          checked={formData.disputeCostPaidBy === "Both equally"}
                          onChange={() => handleSelectChange("disputeCostPaidBy", "Both equally")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="disputeBoth">Both Equally</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="disputeLandlord"
                          name="disputeCostPaidBy"
                          value="Landlord"
                          checked={formData.disputeCostPaidBy === "Landlord"}
                          onChange={() => handleSelectChange("disputeCostPaidBy", "Landlord")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="disputeLandlord">Landlord</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="disputeTenant"
                          name="disputeCostPaidBy"
                          value="Tenant"
                          checked={formData.disputeCostPaidBy === "Tenant"}
                          onChange={() => handleSelectChange("disputeCostPaidBy", "Tenant")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="disputeTenant">Tenant</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 15: Terminación Anticipada */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Early Termination</h3>

              <div className="space-y-2">
                <Label htmlFor="earlyTerminationFee">Early Termination Fee ($)</Label>
                <Input
                  id="earlyTerminationFee"
                  name="earlyTerminationFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.earlyTerminationFee}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sección 16: Inspección */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Inspection</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inspectionReport"
                  checked={formData.inspectionReport}
                  onCheckedChange={(checked) => handleCheckboxChange("inspectionReport", Boolean(checked))}
                />
                <Label htmlFor="inspectionReport">Inspection Report Required</Label>
              </div>
            </div>

           {/* Sección 10: Artículos Incluidos */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Items Included in Lease</h3>
              
              <div className="space-y-2">
                <Label>Furniture & Appliances</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "Refrigerator", "Stove/Oven", "Microwave", "Dishwasher", 
                    "Washer", "Dryer", "Dining Table", "Chairs", "Sofa", 
                    "Coffee Table", "Beds", "Mattresses", "Dressers", 
                    "Nightstands", "Desk", "Bookshelves", "TV", "Air Conditioner",
                    "Heater", "Ceiling Fans", "Light Fixtures", "Window Coverings",
                    "Outdoor Furniture", "Grill", "Garage Opener"
                  ].map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`item-${item}`}
                        checked={formData.includedItems?.includes(item)}
                        onCheckedChange={(checked) => {
                          const isChecked = Boolean(checked);
                          setFormData(prev => ({
                            ...prev,
                            includedItems: isChecked
                              ? [...(prev.includedItems || []), item]
                              : (prev.includedItems || []).filter(i => i !== item)
                          }));
                        }}
                      />
                      <Label htmlFor={`item-${item}`}>{item}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Custom Items</Label>
                <div className="space-y-2">
                  {formData.customItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <p className="text-sm">{item}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            customItems: prev.customItems.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCustomItem}
                    onChange={(e) => setNewCustomItem(e.target.value)}
                    placeholder="Add a custom item"
                  />
                  <Button
                    type="button"
                    onClick={addCustomItem}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Sección 11: Problemas Existentes */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Existing Damages/Issues</h3>
              
              <div className="space-y-2">
                <Label>Common Issues</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Water leaks", "Gas leaks", "Electrical issues", 
                    "Plumbing problems", "Wall cracks", "Floor damage",
                    "Window damage", "Door issues", "Roof leaks",
                    "Mold/moisture", "Pest infestation", "Appliance malfunctions",
                    "HVAC problems", "Structural issues"
                  ].map(issue => (
                    <div key={issue} className="flex items-center space-x-2">
                      <Checkbox
                        id={`issue-${issue}`}
                        checked={formData.existingIssues?.includes(issue)}
                        onCheckedChange={(checked) => {
                          const isChecked = Boolean(checked);
                          setFormData(prev => ({
                            ...prev,
                            existingIssues: isChecked
                              ? [...(prev.existingIssues || []), issue]
                              : (prev.existingIssues || []).filter(i => i !== issue)
                          }));
                        }}
                      />
                      <Label htmlFor={`issue-${issue}`}>{issue}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Issue Descriptions</Label>
                <div className="space-y-2">
                  {formData.issueDescriptions.map((desc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <p className="text-sm">{desc}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            issueDescriptions: prev.issueDescriptions.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newIssueDescription}
                    onChange={(e) => setNewIssueDescription(e.target.value)}
                    placeholder="Add an issue description"
                  />
                  <Button
                    type="button"
                    onClick={addIssueDescription}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Sección 17: Cláusulas */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Terms & Clauses</h3>

              <div className="space-y-2">
                <Label htmlFor="terminationConditions">Termination Conditions</Label>
                <Textarea
                  id="terminationConditions"
                  name="terminationConditions"
                  value={formData.terminationConditions}
                  onChange={handleChange}
                  placeholder="Conditions for lease termination"
                />
              </div>

              {/* Predefined Clauses */}
              <div className="space-y-4">
                <h4 className="font-medium">Predefined Clauses</h4>
                <div className="space-y-2">
                  {formData.predefinedClauses.map((clause, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <p className="text-sm">{clause}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            predefinedClauses: prev.predefinedClauses.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Dialog open={isClauseDialogOpen} onOpenChange={setIsClauseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Predefined Clauses
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Select Predefined Clauses</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {PREDEFINED_CLAUSES.map((clause, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Checkbox
                              id={`clause-${index}`}
                              checked={selectedClauses.includes(clause)}
                              onCheckedChange={() => handleClauseSelect(clause)}
                            />
                            <label htmlFor={`clause-${index}`} className="text-sm leading-none">
                              {clause}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsClauseDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPredefinedClauses}>
                          Add Selected Clauses
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Custom Clauses */}
              <div className="space-y-4">
                <h4 className="font-medium">Custom Clauses</h4>
                <div className="space-y-2">
                  {formData.customClauses.map((clause, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <p className="text-sm flex-1">{clause}</p>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setNewCustomClause(clause);
                            setEditingClauseIndex(index);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              customClauses: prev.customClauses.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={newCustomClause}
                    onChange={(e) => setNewCustomClause(e.target.value)}
                    placeholder="Write a new custom clause"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomClause}
                  >
                    {editingClauseIndex !== null ? 'Update' : 'Add'}
                  </Button>
                </div>
              </div>


            </div>




            {/* Sección 18: Firma */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Signing</h3>

              <div className="space-y-2">
                <Label htmlFor="signingDate">Signing Date</Label>
                <Input
                  id="signingDate"
                  name="signingDate"
                  type="date"
                  value={formData.signingDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">
              <FileText className="mr-2 h-4 w-4" />
              Generate Lease
            </Button>
          </CardFooter>
        </Card>
      </form>



      {isOpen && (
        <ContractModal
        leaseHtml={leaseModal}
        legalInfo={leaseModalinfoLegal}
        onClose={() => setIsOpen(false)}
        propertyId={formData.propertyId}
        leaseData={{
          ...formData,
          monthly_rent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : 0,
                  securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : 0,
                  // Agrega otras conversiones numéricas si es necesario
        }}
        />
      )}


    </div>
  );
}




