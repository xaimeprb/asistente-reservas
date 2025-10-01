"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CitaForm from "@/components/CitaForm";
import CitaList from "@/components/CitaList";

export default function DashboardPage() {
  const router = useRouter();
  const slug = "clinica123"; // 🔹 lo podemos hacer dinámico más tarde
  const [refresh, setRefresh] = useState(0);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard - {slug}</h1>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <CitaForm slug={slug} onCreated={() => setRefresh(r => r + 1)} />
      <CitaList slug={slug} refresh={refresh} />
    </div>
  );
}
