export type Agent = {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
};

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch('/api/oi/agents');
  if (!res.ok) throw new Error('Error al obtener agentes');
  const data = await res.json();
  // Se asume que la respuesta es un array de agentes
  return data as Agent[];
} 