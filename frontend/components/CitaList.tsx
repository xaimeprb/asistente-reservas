// Listado de citas
"use client";
import React from "react";

type Cita = {
  id: string;
  cliente: string;
  servicio: string;
  fecha: string;
  estado: string;
  notas?: string;
};

interface Props {
  citas: Cita[];
}

export default function CitaList({ citas }: Props) {
  if (!citas || citas.length === 0) {
    return <p>No hay citas registradas.</p>;
  }

  return (
    <ul className="space-y-2">
      {citas.map((cita) => (
        <li
          key={cita.id}
          className="p-3 border rounded-md flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{cita.cliente}</p>
            <p className="text-sm text-gray-600">
              {cita.servicio} · {new Date(cita.fecha).toLocaleString()}
            </p>
          </div>
          <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
            {cita.estado}
          </span>
        </li>
      ))}
    </ul>
  );
}
