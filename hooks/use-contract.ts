// hooks/useContractGenerator.ts
import { useState } from 'react';
import { ContractService } from '../services/contractService';

interface ContractParams {
    propertyId: string;
    tenantId: string;
    leaseStart: string;
    leaseEnd: string;
    rentAmount: number;
    securityDeposit: number;
    lateFee: number;
    petDeposit?: number;
    petsAllowed?: boolean;
    maxPets?: number;
    parkingIncluded?: boolean;
    parkingFee?: number;
    utilities?: string[];
    additionalTerms?: string;
    customTerms?: string;
}

interface ContractResponse {
    contractId: string;
    generatedDate: string;
    contractContent: string;
    analysis: {
        included: Array<{ field: string; value: string }>;
        missing: string[];
    };
    warnings: number;
    error?: string;
    loading: boolean;
}

export const useContractGenerator = () => {
    const [state, setState] = useState<ContractResponse>({
        contractId: '',
        generatedDate: '',
        contractContent: '',
        analysis: { included: [], missing: [] },
        warnings: 0,
        loading: false
    });

    const generateContract = async (params: ContractParams) => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            // Validar fechas
            const startDate = new Date(params.leaseStart);
            const endDate = new Date(params.leaseEnd);
            if (startDate >= endDate) {
                throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }

            const contractService = new ContractService();

            // Construir el prompt
            const prompt = `Generar contrato con:
            - Propiedad: ${params.propertyId}
            - Inquilino: ${params.tenantId}
            - Término: ${params.leaseStart} a ${params.leaseEnd}
            - Renta: $${params.rentAmount}/mes
            - Depósito: $${params.securityDeposit}
            - Cargo por retraso: $${params.lateFee}
            - Mascotas: ${params.petsAllowed ? 'Permitidas' : 'No permitidas'}
            ${params.petDeposit ? `(Depósito: $${params.petDeposit})` : ''}
            - Estacionamiento: ${params.parkingIncluded ? 'Incluido' : 'No incluido'}
            - Servicios: ${params.utilities?.join(', ') || 'Ninguno'}
            - Términos adicionales: ${params.additionalTerms || 'Ninguno'}
            ${params.customTerms ? `\nTérminos personalizados:\n${params.customTerms}` : ''}`;

            // Generar el contrato
            const { contract, analysis } = await contractService.generateInitialContract(prompt, {
                temperature: 0.2,
                topK: 8
            });

            setState({
                contractId: crypto.randomUUID(),
                     generatedDate: new Date().toISOString(),
                     contractContent: contract,
                     analysis,
                     warnings: analysis.missing.length,
                     loading: false
            });

        } catch (error) {
            setState({
                contractId: '',
                generatedDate: '',
                contractContent: '',
                analysis: { included: [], missing: [] },
                warnings: 0,
                error: error instanceof Error ? error.message : 'Error desconocido',
                loading: false
            });
        }
    };

    return { ...state, generateContract };
};
