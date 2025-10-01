// panel-admin/services/api.ts
import { apiFetch } from "../lib/api";

export type Cita = {
  id: string;
  cliente: string;
  servicio: string;
  fecha: string;
  estado: string;
  notas?: string;
};

export async function getCitas(slug: string) {
  return apiFetch<Cita[]>(`/admin/${slug}/citas`);
}