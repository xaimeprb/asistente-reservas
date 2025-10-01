"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import CitaForm from "@/components/CitaForm";
import CitaList from "@/components/CitaList";

export default function DashboardSlugPage() {
  const { slug } = useParams(); // 👈 obtenemos el tenant dinámico
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);

  if (!slug || typeof slug !== "string") {
    return <p>Error: tenant no válido</p>;
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard - {slug}</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <CitaForm slug={slug} onCreated={() => setRefresh((r) => r + 1)} />
      <CitaList slug={slug} refresh={refresh} />
    </div>
  );
}
