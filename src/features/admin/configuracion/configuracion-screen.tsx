"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { RutinasPanel } from "@/features/admin/rutinas/rutinas-panel";
import { UsuarioPanel } from "./usuario-panel";
import type { UsuarioTabData } from "./types";
import type { AdminRutinasData } from "@/features/admin/rutinas/types";

type Tab = "usuario" | "rutinas";

export function ConfiguracionScreen({
  usuarioData,
  rutinasData,
}: {
  usuarioData: UsuarioTabData;
  rutinasData: AdminRutinasData;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("usuario");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pb-28 pt-8">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">Configuración</h1>

      <SegmentedTabs
        ariaLabel="Secciones de Configuración"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as Tab)}
        tabs={[
          { key: "usuario", label: "Usuario" },
          { key: "rutinas", label: "Rutinas" },
        ]}
      />

      {activeTab === "usuario" ? (
        <UsuarioPanel data={usuarioData} />
      ) : (
        <RutinasPanel data={rutinasData} />
      )}
    </div>
  );
}
