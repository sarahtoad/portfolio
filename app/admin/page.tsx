"use client";

import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("@/components/admin/AdminDashboard"), { ssr: false, loading: () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <p className="font-mono text-sm tracking-[0.3em] text-nordic-gold/70">Summoning the vault…</p>
  </div>
) });

export default function AdminPage() {
  return <AdminDashboard />;
}
