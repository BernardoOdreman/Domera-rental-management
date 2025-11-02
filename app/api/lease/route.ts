import { NextResponse } from 'next/server';
import { ContractService } from '@/services/contractService';

const US_STATES = [
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

// Crear mapa de estados normalizados
const NORMALIZED_STATE_MAP: Record<string, string> = {};

US_STATES.forEach(state => {
  const normalizedKey = state.toLowerCase().trim().replace(/\s+/g, '-');
  NORMALIZED_STATE_MAP[normalizedKey] = state;
});

interface ClauseProcessingRequest {
  state: string;
  clauses: string[];
}

export async function POST(request: Request) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  try {
    const body: ClauseProcessingRequest = await request.json();
    console.log(body)
    // Normalizar el estado recibido
    const normalizedState = body.state
      .toLowerCase()    // Convertir a minúsculas
      .trim()           // Eliminar espacios al inicio y final
      .replace(/\s+/g, '-');  // Reemplazar espacios internos con guiones

    // Buscar el estado original usando la versión normalizada
    const originalState = NORMALIZED_STATE_MAP[normalizedState];

    // Verificar si el estado es válido
    if (!originalState) {
      return new NextResponse(
        JSON.stringify({ 
          error: `Invalid state: ${body.state}. Valid states are: ${US_STATES.join(', ')}`,
          normalizedState: normalizedState  // Para depuración
        }),
        { status: 400, headers }
      );
    }

    console.log(originalState)


    const contractService = new ContractService();
    
    // Filtrar cláusulas vacías
    const validClauses = body.clauses.filter(clause => clause.trim().length > 0);
    
    if (validClauses.length === 0) {
      console.log("At least one valid clause is required")
      return new NextResponse(
        JSON.stringify({ error: "At least one valid clause is required" }),
        { status: 400, headers }
      );
    }

    // Paso 1: Reescribir cláusulas
    const rewriteResponse = await contractService.generateClauses(validClauses.join('\n\n'));
      console.log(rewriteResponse)
    
    // Parsear respuesta
    const rewrittenClauses = rewriteResponse
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    // Paso 2: Análisis legal de las cláusulas reescritas
    const legalPrompt = `
      Analyze and see if is legal the following lease clauses for ${originalState}:
      ${rewrittenClauses.join('\n\n')}
    `;
    
    const legalAnalysis = await contractService.generateLegalReview(originalState.trim().toLowerCase().replace(/\s+/g, '-'), legalPrompt);

     console.log( legalAnalysis)

    return new NextResponse(JSON.stringify({
      rewrittenClauses,
      legalAnalysis,
    }), { status: 200, headers });

  } catch (error) {
    console.error('Clause processing error:', error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}