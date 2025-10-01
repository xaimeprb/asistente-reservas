import React, { useEffect, useState } from 'react';
import { fetchAgents, Agent } from '../lib/oi';

function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAgents = async () => {
      setLoading(true);
      try {
        const data = await fetchAgents();
        setAgents(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setAgents([]);
      }
      setLoading(false);
    };
    getAgents();
  }, []);

  return { agents, loading, error };
}

export default function AgentsTable() {
  const { agents, loading, error } = useAgents();

  if (loading) return <p>Cargando agentes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Nombre</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tipo</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {agents.map(agent => (
          <tr key={agent.id}>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{agent.id}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{agent.nombre}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{agent.tipo}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{agent.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 