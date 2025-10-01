// Formulario para crear citas
"use client";
import React, { useState } from "react";
import { apiFetch } from "../lib/api";

type CitaInput = {
  cliente: string;
  telefono: string;
  email?: string;
  servicio: string;
  fecha: string;
  duracion: number;
  estado: string;
  notas?: string;
};

interface Props {
  slug: string;
  onCreated: () => void;
}

export default function CitaForm({ slug, onCreated }: Props) {
  const [form, setForm] = useState<CitaInput>({
    cliente: "",
    telefono: "",
    email: "",
    servicio: "",
    fecha: "",
    duracion: 30,
    estado: "PENDIENTE",
    notas: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch<CitaInput>(`/admin/${slug}/citas`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Cliente"
        value={form.cliente}
        onChange={(e) => setForm({ ...form, cliente: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Servicio"
        value={form.servicio}
        onChange={(e) => setForm({ ...form, servicio: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <input
        type="datetime-local"
        value={form.fecha}
        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Crear cita
      </button>
    </form>
  );
}