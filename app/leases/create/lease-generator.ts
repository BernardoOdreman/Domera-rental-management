// lease-generator.ts
interface LeaseData {
  propertyLocation: string;
  agreementDate: string;
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  additionalOccupants?: string;
  propertyType: string;
  propertyBuiltYear: string | number;
  leaseStart: string;
  leaseEnd: string;
  renewalOption?: boolean;
  leaseTerm?: string;
  terminationNoticeDays?: string | number;
  monthlyRent: string | number;
  rentDueDay: string | number;
  paymentMethodsAllowed: string[];
  latePaymentFee: string | number;
  latePaymentFeePercentage?: string | number;
  latePaymentGracePeriod: string | number;
  nsfFee: string | number;
  securityDeposit: string | number;
  securityDepositReturnDays: string | number;
  utilities?: Record<string, 'tenant' | 'landlord'>;
  maintenanceResponsibilities?: string;
  entryNoticeHours: string | number;
  petsAllowed?: boolean;
  allowedPets?: string;
  petDeposit?: string | number;
  petFee?: string | number;
  petDepositReturnDays?: string | number;
  petTerms?: string;
  smokingAllowed?: boolean;
  vapingAllowed?: boolean;
  predefinedClauses?: string[];
  customClauses?: string[];
  leadPaint?: boolean;
  leadPaintDescription?: string;
  signingDate: string;
  propertyId: string;
  // Nuevos campos
  includedItems: string[];
  customItems: string[];
  existingIssues: string[];
  issueDescriptions: string[];
}

export function generateLeaseHTML(leaseData: LeaseData): string {
  const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount?.toString() || '0'));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderConditionalSection = (condition: any, title: string, content: string): string => {
    if (!condition) return '';
    return `
      <div class="mb-6">
        <h2 class="text-xl font-bold border-b pb-2 mb-3">${title}</h2>
        ${content}
      </div>
    `;
  };

  const renderUtilitiesTable = (): string => {
    if (!leaseData.utilities || Object.keys(leaseData.utilities).length === 0) return '';
    
    const utilities = Object.entries(leaseData.utilities);
    return `
      <table class="min-w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-left">Utility</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Responsible Party</th>
          </tr>
        </thead>
        <tbody>
          ${utilities.map(([utility, responsible]) => `
            <tr>
              <td class="border border-gray-300 px-4 py-2">${utility}</td>
              <td class="border border-gray-300 px-4 py-2">${responsible === 'tenant' ? 'Tenant' : 'Landlord'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const renderClauses = (): string => {
    const allClauses = [
      ...(leaseData.predefinedClauses || []),
      ...(leaseData.customClauses || [])
    ];
    
    if (allClauses.length === 0) return '';
    
    return `
      <div class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Additional Clauses:</h3>
        <ol class="list-decimal pl-6 space-y-2">
          ${allClauses.map(clause => `<li>${clause}</li>`).join('')}
        </ol>
      </div>
    `;
  };

  const renderPetSection = (): string => {
    if (!leaseData.petsAllowed) return '';
    
    return `
      <div class="mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>Allowed Pets:</strong> ${leaseData.allowedPets || 'None specified'}</p>
          <p><strong>Pet Deposit:</strong> ${formatCurrency(leaseData.petDeposit || 0)}</p>
          <p><strong>Pet Fee:</strong> ${formatCurrency(leaseData.petFee || 0)}</p>
          <p><strong>Pet Deposit Return Days:</strong> ${leaseData.petDepositReturnDays || '30'} days</p>
        </div>
        ${leaseData.petTerms ? `
          <div class="mt-2">
            <p><strong>Pet Terms:</strong></p>
            <p>${leaseData.petTerms}</p>
          </div>
        ` : ''}
      </div>
    `;
  };

  const renderLeadPaintDisclosure = (): string => {
    if (!leaseData.leadPaint) return '';
    
    return `
      <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 class="font-bold text-lg mb-2">Lead-Based Paint Disclosure</h3>
        <p>Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly.</p>
        <p class="mt-2">Tenant acknowledges receiving the EPA pamphlet "Protect Your Family From Lead in Your Home."</p>
        ${leaseData.leadPaintDescription ? `
          <div class="mt-2">
            <p><strong>Additional Information:</strong></p>
            <p>${leaseData.leadPaintDescription}</p>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Función para renderizar artículos incluidos
  const renderIncludedItems = (): string => {
    const items = [
      ...(leaseData.includedItems || []),
      ...(leaseData.customItems || [])
    ];
    if (items.length === 0) return '';

    return `
      <div class="mb-8">
        <h2 class="section-title">INCLUDED ITEMS</h2>
        <p>The following items are included in the lease:</p>
        <ul class="list-disc pl-6 mt-2">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  // Función para renderizar problemas existentes
  const renderExistingIssues = (): string => {
    const issues = [
      ...(leaseData.existingIssues || []),
      ...(leaseData.issueDescriptions || [])
    ];
    if (issues.length === 0) return '';

    return `
      <div class="mb-8">
        <h2 class="section-title">EXISTING DAMAGES/ISSUES</h2>
        <p>The tenant acknowledges the following existing issues with the property:</p>
        <ul class="list-disc pl-6 mt-2">
          ${issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lease Agreement - ${leaseData.propertyLocation}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Roboto', sans-serif;
          line-height: 1.6;
        }
        .contract-header {
          border-bottom: 2px solid #333;
          padding-bottom: 1rem;
        }
        .section-title {
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .clause-item {
          margin-bottom: 0.5rem;
        }
        .signature-block {
          margin-top: 3rem;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 300px;
          margin-top: 2.5rem;
        }
        @media print {
          body {
            padding: 0;
            font-size: 12pt;
          }
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body class="bg-white text-gray-800">
      <div class="max-w-4xl mx-auto p-6">
        <!-- Header -->
        <div class="contract-header text-center mb-8">
          <h1 class="text-3xl font-bold">RESIDENTIAL LEASE AGREEMENT</h1>
          <p class="text-gray-600 mt-2">This Lease Agreement is made and entered into as of ${formatDate(leaseData.agreementDate)}</p>
        </div>

        <!-- Parties -->
        <div class="mb-8">
          <h2 class="section-title">1. PARTIES</h2>
          <p>This Lease is between:</p>
          <p class="mt-2"><strong>Landlord:</strong> ${leaseData.landlordName}, ${leaseData.landlordAddress}, Phone: ${leaseData.landlordPhone}</p>
          <p class="mt-2"><strong>Tenant:</strong> ${leaseData.tenantName}, Phone: ${leaseData.tenantPhone}, Email: ${leaseData.tenantEmail}</p>
          ${leaseData.additionalOccupants ? `
            <p class="mt-2"><strong>Additional Occupants:</strong> ${leaseData.additionalOccupants}</p>
          ` : ''}
        </div>

        <!-- Premises -->
        <div class="mb-8">
          <h2 class="section-title">2. PREMISES</h2>
          <p>Landlord rents to Tenant and Tenant rents from Landlord the premises located at:</p>
          <p class="font-semibold mt-2">${leaseData.propertyLocation}</p>
          <p class="mt-2">Property Type: ${leaseData.propertyType}</p>
          <p>Year Built: ${leaseData.propertyBuiltYear}</p>
        </div>

        <!-- Existing Issues -->
        ${renderExistingIssues()}

        <!-- Included Items -->
        ${renderIncludedItems()}

        <!-- Term -->
        <div class="mb-8">
          <h2 class="section-title">3. TERM</h2>
          <p>The initial term of this Lease begins on ${formatDate(leaseData.leaseStart)} and ends on ${formatDate(leaseData.leaseEnd)}.</p>
          ${leaseData.renewalOption ? `
            <p class="mt-2">This Lease shall automatically renew for successive ${leaseData.leaseTerm === 'Month-to-Month' ? 'monthly' : 'yearly'} 
            periods unless either party gives written notice of termination at least ${leaseData.terminationNoticeDays} days prior to the end of the term.</p>
          ` : ''}
        </div>

        <!-- Rent -->
        <div class="mb-8">
          <h2 class="section-title">4. RENT</h2>
          <p>Tenant shall pay as rent the sum of ${formatCurrency(leaseData.monthlyRent)} per month, payable in advance on the ${leaseData.rentDueDay} day of each month.</p>
          <p class="mt-2"><strong>Payment Methods:</strong> ${leaseData.paymentMethodsAllowed.join(', ')}</p>
          <p class="mt-2"><strong>Late Fee:</strong> ${formatCurrency(leaseData.latePaymentFee)} or ${leaseData.latePaymentFeePercentage || '5'}% (whichever is greater) 
          will be charged if rent is not received by the ${leaseData.latePaymentGracePeriod}th day of the month.</p>
          <p class="mt-2"><strong>NSF Fee:</strong> ${formatCurrency(leaseData.nsfFee)} for any returned checks.</p>
        </div>

        <!-- Security Deposit -->
        <div class="mb-8">
          <h2 class="section-title">5. SECURITY DEPOSIT</h2>
          <p>Tenant has deposited with Landlord the sum of ${formatCurrency(leaseData.securityDeposit)} as security for the performance of Tenant's obligations.</p>
          <p class="mt-2">The security deposit will be returned within ${leaseData.securityDepositReturnDays} days after:</p>
          <ul class="list-disc pl-6 mt-1">
            <li>Termination of the tenancy</li>
            <li>Delivery of possession by Tenant</li>
            <li>Deduction for damages beyond normal wear and tear</li>
          </ul>
        </div>

        <!-- Utilities -->
        <div class="mb-8">
          <h2 class="section-title">6. UTILITIES AND SERVICES</h2>
          ${renderUtilitiesTable()}
        </div>

        <!-- Use of Premises -->
        <div class="mb-8">
          <h2 class="section-title">7. USE OF PREMISES</h2>
          <p>The premises shall be used only as a private residence for Tenant and the occupants listed above. No business or professional activity may be conducted on the premises without Landlord's prior written consent.</p>
          <p class="mt-2">The following activities are expressly prohibited:</p>
          <ul class="list-disc pl-6">
            <li>Illegal activities of any kind</li>
            <li>Storing hazardous materials</li>
            <li>Nuisance activities or excessive noise</li>
            <li>Structural modifications without permission</li>
          </ul>
        </div>

        <!-- Maintenance -->
        <div class="mb-8">
          <h2 class="section-title">8. MAINTENANCE AND REPAIRS</h2>
          <p><strong>Tenant Responsibilities:</strong></p>
          <ul class="list-disc pl-6">
            <li>Keep premises clean and sanitary</li>
            <li>Notify Landlord promptly of needed repairs</li>
            <li>${leaseData.maintenanceResponsibilities || 'Perform basic maintenance like replacing light bulbs and air filters'}</li>
            <li>Tenant acknowledges existing issues noted in section 2.1</li>
          </ul>
          <p class="mt-2"><strong>Landlord Responsibilities:</strong></p>
          <ul class="list-disc pl-6">
            <li>Maintain structural elements of the building</li>
            <li>Ensure all systems (plumbing, electrical, HVAC) are in working order</li>
            <li>Comply with all building and housing codes</li>
          </ul>
        </div>

        <!-- Alterations -->
        <div class="mb-8">
          <h2 class="section-title">9. ALTERATIONS AND IMPROVEMENTS</h2>
          <p>Tenant shall not make any alterations or improvements to the premises without Landlord's prior written consent. All approved alterations become the property of Landlord unless otherwise agreed in writing.</p>
        </div>

        <!-- Entry -->
        <div class="mb-8">
          <h2 class="section-title">10. LANDLORD'S RIGHT OF ENTRY</h2>
          <p>Landlord may enter the premises under the following conditions:</p>
          <ul class="list-disc pl-6">
            <li>With at least ${leaseData.entryNoticeHours} hours notice for repairs, inspections or showings</li>
            <li>In case of emergency without notice</li>
            <li>During normal business hours (9am-5pm, Monday-Friday)</li>
          </ul>
        </div>

        <!-- Pets -->
        ${renderConditionalSection(
          leaseData.petsAllowed,
          "11. PET POLICY",
          renderPetSection()
        )}

        <!-- Smoking -->
        <div class="mb-8">
          <h2 class="section-title">${leaseData.petsAllowed ? '12' : '11'}. SMOKING POLICY</h2>
          <p>Smoking is ${leaseData.smokingAllowed ? 'permitted only in designated outdoor areas' : 'prohibited anywhere on the premises'}.</p>
          ${leaseData.vapingAllowed === false ? `
            <p class="mt-2">Vaping is also prohibited on the premises.</p>
          ` : ''}
        </div>

        <!-- Assignment -->
        <div class="mb-8">
          <h2 class="section-title">${leaseData.petsAllowed ? '13' : '12'}. ASSIGNMENT AND SUBLETTING</h2>
          <p>Tenant shall not assign this Lease or sublet any portion of the premises without Landlord's prior written consent. Any unauthorized subletting shall constitute a material breach of this Lease.</p>
        </div>

        <!-- Insurance -->
        <div class="mb-8">
          <h2 class="section-title">${leaseData.petsAllowed ? '14' : '13'}. INSURANCE</h2>
          <p>Tenant is strongly encouraged to maintain renter's insurance to protect against loss of personal property. Landlord's insurance does not cover Tenant's personal belongings.</p>
        </div>

        <!-- Default -->
        <div class="mb-8">
          <h2 class="section-title">${leaseData.petsAllowed ? '15' : '14'}. DEFAULT</h2>
          <p>If Tenant fails to pay rent when due or otherwise breaches this Lease, Landlord may terminate this Lease upon ${leaseData.terminationNoticeDays} days written notice. Tenant shall be liable for all costs of collection, including reasonable attorney's fees.</p>
        </div>

        <!-- Lead Paint -->
        ${renderLeadPaintDisclosure()}

        <!-- Additional Clauses -->
        <div class="mb-8">
          <h2 class="section-title">ADDITIONAL PROVISIONS</h2>
          ${renderClauses()}
        </div>

        <!-- Entire Agreement -->
        <div class="mb-8">
          <h2 class="section-title">ENTIRE AGREEMENT</h2>
          <p>This Lease contains the entire agreement between the parties and supersedes all prior negotiations, representations or agreements. This Lease may be modified only in writing signed by both parties.</p>
        </div>

        <!-- Signatures -->
        <div class="signature-block mt-12">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="font-bold">LANDLORD:</h3>
              <p>${leaseData.landlordName}</p>
              <div class="signature-line"></div>
              <p class="mt-2">Date: ${formatDate(leaseData.signingDate)}</p>
            </div>
            <div>
              <h3 class="font-bold">TENANT:</h3>
              <p>${leaseData.tenantName}</p>
              <div class="signature-line"></div>
              <p class="mt-2">Date: ${formatDate(leaseData.signingDate)}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          <p>Lease generated on ${new Date().toLocaleDateString()} | Property ID: ${leaseData.propertyId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}