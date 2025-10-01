import React, { useRef, useState } from 'react';

export default function NewAgentPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf' || file.name.endsWith('.docx')
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type === 'application/pdf' || file.name.endsWith('.docx')
    );
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Subir archivos a /api/agents (que debe manejar la subida y procesamiento)
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('prompt', prompt);

      const res = await fetch('/api/agents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear el agente');
      }

      setSuccess(true);
      setFiles([]);
      setPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Crear nuevo agente</h2>
      <form onSubmit={handleSubmit}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: '2px dashed #aaa',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            marginBottom: 16,
            background: '#fafafa',
            cursor: 'pointer',
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <p>Arrastra y suelta archivos PDF o DOCX aquí, o haz clic para seleccionar</p>
        </div>
        {files.length > 0 && (
          <ul>
            {files.map((file, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {file.name}
                <button type="button" onClick={() => handleRemoveFile(idx)} style={{ marginLeft: 8 }}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
        <div style={{ margin: '16px 0' }}>
          <label htmlFor="prompt">Prompt para OpenAI:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            style={{ width: '100%', marginTop: 4 }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontWeight: 'bold' }}>
          {loading ? 'Creando agente...' : 'Crear agente'}
        </button>
        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: 8 }}>¡Agente creado correctamente!</p>}
      </form>
    </div>
  );
} 