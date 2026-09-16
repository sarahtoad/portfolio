"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Certificate, Quest, JourneyChapter, Message, Stats, AboutContent, ArtForm, ArtProject } from "@/lib/types";

type Tab = "projects" | "experience" | "about" | "creative" | "artprojects" | "messages" | "stats";

type PanelStats = Stats & { last14: { day: string; visits: number; unique: number; pageViews: number }[] };

type BreakdownItem = [string, number];

const skillGroupTiers = ["EXPERT", "ADEPT", "APPRENTICE"];

type SkillGroupType = { tier: "EXPERT" | "ADEPT" | "APPRENTICE"; title: string; skills: string[] };

const inputCls =
  "w-full bg-[#0a0c10] border border-nordic-silver/20 text-nordic-snow px-3 py-2 text-sm focus:outline-none focus:border-nordic-gold/60 transition-colors";
const labelCls = "block font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-1";
const btnPrimary =
  "font-mono text-[11px] tracking-[0.2em] uppercase text-nordic-charcoal bg-nordic-gold px-4 py-2 hover:bg-[#ddb860] transition-colors";
const btnGhost =
  "font-mono text-[11px] tracking-[0.2em] uppercase text-nordic-gold border border-nordic-gold/40 px-4 py-2 hover:bg-nordic-gold/10 transition-colors";

async function jsonFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data;
}

type UploadFolder = "certs" | "projects" | "art";

function uploadFile(file: File, folder: UploadFolder) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, data: String(reader.result), folder }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Upload failed");
        resolve(json.url as string);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("experience");
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [journey, setJourney] = useState<JourneyChapter[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [arts, setArts] = useState<ArtForm[]>([]);
  const [artProjects, setArtProjects] = useState<ArtProject[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<PanelStats>({ totalVisits: 0, uniqueVisitors: 0, totalPageViews: 0, days: {}, pageViewsByPath: {}, referrers: {}, browsers: {}, devices: {}, last14: [] });
  const [compartment, setCompartment] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKind, setEditingKind] = useState<"journey" | "cert">("journey");
  const [flash, setFlash] = useState("");
  const [busy, setBusy] = useState(false);

  const show = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(""), 4000);
  };

  const load = useCallback(async () => {
    try {
      const [c, q, j, m, s, a, ar, ap] = await Promise.all([
        jsonFetch("/api/admin/certificates"),
        jsonFetch("/api/admin/projects"),
        jsonFetch("/api/admin/experience"),
        jsonFetch("/api/admin/messages"),
        jsonFetch("/api/admin/stats"),
        jsonFetch("/api/admin/about"),
        jsonFetch("/api/admin/creative"),
        jsonFetch("/api/admin/artprojects"),
      ]);
      setCerts(c as Certificate[]);
      setQuests(q as Quest[]);
      setJourney(j as JourneyChapter[]);
      setMessages(m as Message[]);
      setStats(s as PanelStats);
      setAboutContent(a as AboutContent);
      setArts(ar as ArtForm[]);
      setArtProjects(ap as ArtProject[]);
    } catch { /* handled by session check */ }
  }, []);

  useEffect(() => {
    fetch("/api/admin/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => setAuthed(false));
  }, []);

  if (authed === null) return <Shell message="Summoning the vault…" />;
  if (!authed) return <Login onLogin={() => { setAuthed(true); load(); }} onMessage={show} />;

  const handleDelete = async (type: Tab | "certificates", id: string) => {
    if (!window.confirm("Destroy this entry forever?")) return;
    setBusy(true);
    try {
      await jsonFetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
      if (type === "certificates") setCerts((l) => l.filter((c) => c.id !== id));
      else if (type === "projects") setQuests((l) => l.filter((q) => q.id !== id));
      else if (type === "experience") setJourney((l) => l.filter((ch) => ch.id !== id));
      else if (type === "creative") setArts((l) => l.filter((a) => a.id !== id));
      else if (type === "artprojects") setArtProjects((l) => l.filter((p) => p.id !== id));
      else if (type === "messages") setMessages((l) => l.filter((m) => m.id !== id));
      show("Entry destroyed.");
    } catch (e) { show(e instanceof Error ? e.message : "Delete failed"); } finally { setBusy(false); }
  };

  const startNew = (kind?: "journey" | "cert") => { setEditingId(null); setEditingKind(kind ?? "journey"); setCompartment("form"); };

  const onSaved = (type: Tab | "certificates", item: Certificate | Quest | JourneyChapter | ArtForm | ArtProject) => {
    if (type === "certificates") { const it = item as Certificate; setCerts((l) => { const exists = l.some((c) => c.id === it.id); return exists ? l.map((c) => (c.id === it.id ? it : c)) : [...l, it]; }); show("Certificate sealed into the vault."); }
    else if (type === "projects") { const it = item as Quest; setQuests((l) => { const exists = l.some((q) => q.id === it.id); return exists ? l.map((q) => (q.id === it.id ? it : q)) : [...l, it]; }); show("Quest recorded."); }
    else if (type === "experience") { const it = item as JourneyChapter; setJourney((l) => { const exists = l.some((ch) => ch.id === it.id); return exists ? l.map((ch) => (ch.id === it.id ? it : ch)) : [...l, it]; }); show("Chapter etched into the path."); }
    else if (type === "creative") { const it = item as ArtForm; setArts((l) => { const exists = l.some((a) => a.id === it.id); return exists ? l.map((a) => (a.id === it.id ? it : a)) : [...l, it]; }); show("Art form framed into the gallery."); }
    else if (type === "artprojects") { const it = item as ArtProject; setArtProjects((l) => { const exists = l.some((p) => p.id === it.id); return exists ? l.map((p) => (p.id === it.id ? it : p)) : [...l, it]; }); show("Work hung in the gallery."); }
    setCompartment("list");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-nordic-snow">
      <div className="max-w-5xl mx-auto px-5 py-8 md:py-12">
        <header className="flex items-center justify-between border-b border-nordic-gold/20 pb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-nordic-gold/70">◆ The Keeper&rsquo;s Sanctum ◆</div>
            <h1 className="mt-1 font-cinzel text-2xl md:text-3xl tracking-[0.15em]">THE VAULT</h1>
          </div>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); }} className={btnGhost}>Logout</button>
        </header>

        {flash && <div className="mt-4 border border-nordic-gold/30 bg-nordic-gold/10 px-4 py-2 font-mono text-xs text-nordic-gold">{flash}</div>}

        <nav className="mt-6 flex flex-wrap gap-3">
          {([["projects", "Projects"], ["experience", "Experience"], ["about", "About"], ["creative", "Creative"], ["messages", "Messages"], ["stats", "Statistics"]] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setCompartment("list"); }} className={tab === key ? btnPrimary : `font-mono text-[11px] tracking-[0.2em] uppercase border border-nordic-silver/20 text-nordic-silver px-4 py-2 hover:text-nordic-gold hover:border-nordic-gold/40 transition-colors`}>{label}</button>
          ))}
          <div className="flex-1" />
          {compartment === "list" && tab === "projects" && <button onClick={() => startNew()} disabled={busy} className={btnGhost}>+ Add New</button>}
        </nav>

        <div className="mt-6">
          {tab === "projects" ? (
            compartment === "form"
              ? <QuestForm existing={quests.find((q) => q.id === editingId)} onCancel={() => setCompartment("list")} onSave={(item) => onSaved("projects", item)} />
              : <QuestList quests={quests} onEdit={(q) => { setEditingId(q.id); setCompartment("form"); }} onDelete={(id) => handleDelete("projects", id)} busy={busy} />
          ) : tab === "experience" ? (
            <div className="space-y-12">
              <div>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-nordic-gold/20 pb-3">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-nordic-gold/70">⚔ The Expedition</div>
                    <h3 className="mt-1 font-cinzel text-xl tracking-[0.15em]">JOURNEY CHAPTERS</h3>
                  </div>
                  <button onClick={() => startNew("journey")} disabled={compartment === "form" || busy} className={btnGhost}>+ Add Chapter</button>
                </div>
                {compartment === "form" && editingKind === "journey" ? (
                  <JourneyForm existing={journey.find((ch) => ch.id === editingId)} onCancel={() => setCompartment("list")} onSave={(item) => onSaved("experience", item)} />
                ) : (
                  <JourneyList journey={journey} onEdit={(ch) => { setEditingId(ch.id); setEditingKind("journey"); setCompartment("form"); }} onDelete={(id) => handleDelete("experience", id)} busy={busy} />
                )}
              </div>
              <div>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-nordic-gold/20 pb-3">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-nordic-gold/70">🏅 Seals &amp; Scrolls</div>
                    <h3 className="mt-1 font-cinzel text-xl tracking-[0.15em]">CERTIFICATES</h3>
                  </div>
                  <button onClick={() => startNew("cert")} disabled={compartment === "form" || busy} className={btnGhost}>+ Add Certificate</button>
                </div>
                {compartment === "form" && editingKind === "cert" ? (
                  <CertForm existing={certs.find((c) => c.id === editingId)} onCancel={() => setCompartment("list")} onSave={(item) => onSaved("certificates", item)} />
                ) : (
                  <CertList certs={certs} onEdit={(c) => { setEditingId(c.id); setEditingKind("cert"); setCompartment("form"); }} onDelete={(id) => handleDelete("certificates", id)} busy={busy} />
                )}
              </div>
            </div>
          ) : tab === "about" ? <AboutEditor content={aboutContent} busy={busy} onSaved={(c) => { setAboutContent(c); show("The chronicle of the realm has been rewritten."); }} />
          : tab === "creative" ? <CreativeEditor arts={arts} artProjects={artProjects} busy={busy} onSaveArt={(item) => onSaved("creative", item)} onDeleteArt={(id) => handleDelete("creative", id)} onSaveProject={(item) => onSaved("artprojects", item)} onDeleteProject={(id) => handleDelete("artprojects", id)} />
          : tab === "messages" ? <MessagesPanel messages={messages} busy={busy} onToggle={async (id, status) => { setBusy(true); try { const updated = (await jsonFetch(`/api/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })) as Message; setMessages((l) => l.map((m) => (m.id === id ? updated : m))); show(status === "published" ? "Voice published to the realm." : "Voice withdrawn."); } catch (e) { show(e instanceof Error ? e.message : "Failed"); } finally { setBusy(false); } }} onDelete={(id) => handleDelete("messages", id)} />
          : <StatsPanel stats={stats} busy={busy} onReset={async () => { if (!window.confirm("Erase all visit statistics?")) return; setBusy(true); try { await jsonFetch("/api/admin/stats", { method: "DELETE" }); setStats({ totalVisits: 0, uniqueVisitors: 0, totalPageViews: 0, days: {}, pageViewsByPath: {}, referrers: {}, browsers: {}, devices: {}, last14: [] }); show("The slate is clean."); } catch (e) { show(e instanceof Error ? e.message : "Reset failed"); } finally { setBusy(false); } }} />
          }
        </div>
      </div>
    </div>
  );
}

function Shell({ message }: { message: string }) {
  return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><p className="font-mono text-sm tracking-[0.3em] text-nordic-gold/70">{message}</p></div>;
}

function Login({ onLogin, onMessage }: { onLogin: () => void; onMessage: (m: string) => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await jsonFetch("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) }); onLogin(); }
    catch { onMessage("The password is wrong, traveler."); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-nordic-gold/30 bg-[#0a0c10] p-8 shadow-[0_0_60px_rgba(201,168,76,0.1)]">
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-nordic-gold/70">◆ The Vault ◆</div>
          <h2 className="mt-2 font-cinzel text-xl tracking-[0.2em]">STATE YOUR OATH</h2>
          <p className="mt-2 font-mono text-xs text-nordic-silver/60">This realm is closed to outsiders.</p>
        </div>
        <label className={`${labelCls} mt-6`}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoFocus />
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={busy} className={`${btnPrimary} flex-1`}>{busy ? "…" : "Enter"}</button>
          <Link href="/" className={`${btnGhost} text-center`}>Flee</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

const STANDARD_RATIOS: { label: string; ratio: number; tolerance: number }[] = [
  { label: "1:1", ratio: 1, tolerance: 0.02 },
  { label: "4:3", ratio: 4 / 3, tolerance: 0.02 },
  { label: "3:4", ratio: 3 / 4, tolerance: 0.02 },
  { label: "3:2", ratio: 3 / 2, tolerance: 0.02 },
  { label: "2:3", ratio: 2 / 3, tolerance: 0.02 },
  { label: "16:9", ratio: 16 / 9, tolerance: 0.02 },
  { label: "9:16", ratio: 9 / 16, tolerance: 0.02 },
  { label: "21:9", ratio: 21 / 9, tolerance: 0.02 },
];

function detectRatio(w: number, h: number) {
  const r = w / h;
  for (const std of STANDARD_RATIOS) { if (Math.abs(r - std.ratio) < std.tolerance) return std.label; }
  return null;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ImageField({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder: UploadFolder }) {
  const [busy, setBusy] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number; size: number; name: string } | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const readDims = (file: File) => {
    setLastFile(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setDims({ w: img.naturalWidth, h: img.naturalHeight, size: file.size, name: file.name }); URL.revokeObjectURL(url); };
    img.onerror = () => { setDims({ w: 0, h: 0, size: file.size, name: file.name }); URL.revokeObjectURL(url); };
    img.src = url;
  };

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    readDims(file); setBusy(true);
    try { const url = await uploadFile(file, folder); onChange(url); }
    catch (err) { window.alert(err instanceof Error ? err.message : "Upload failed"); }
    finally { setBusy(false); e.target.value = ""; }
  };

  const ratio = dims && dims.w && dims.h ? detectRatio(dims.w, dims.h) : null;
  const needsCrop = dims && dims.w && dims.h && !ratio;

  return (
    <div>
      <Field label="Image URL"><input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder="/uploads/certs/…" /></Field>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-block cursor-pointer"><span className={btnGhost}>{busy ? "Uploading…" : "Upload Image"}</span><input type="file" accept="image/*" className="hidden" onChange={pick} /></label>
        {needsCrop && value && <button type="button" onClick={() => setCropOpen(true)} className={btnGhost}>✂ Crop Image</button>}
      </div>
      {dims && dims.w > 0 && (
        <div className="mt-3 border border-nordic-silver/15 bg-[#0a0c10] p-4 space-y-2">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70">Image Details</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><div className="font-mono text-[9px] text-nordic-silver/50">WIDTH</div><div className="font-mono text-sm text-nordic-snow">{dims.w} px</div></div>
            <div><div className="font-mono text-[9px] text-nordic-silver/50">HEIGHT</div><div className="font-mono text-sm text-nordic-snow">{dims.h} px</div></div>
            <div><div className="font-mono text-[9px] text-nordic-silver/50">SIZE</div><div className="font-mono text-sm text-nordic-snow">{formatSize(dims.size)}</div></div>
            <div><div className="font-mono text-[9px] text-nordic-silver/50">RATIO</div><div className="font-mono text-sm text-nordic-snow">{ratio ? <span className="text-emerald-400">{ratio} ✓</span> : <span className="text-amber-400">Non-standard</span>}</div></div>
          </div>
          {needsCrop && <div className="mt-2 border border-amber-400/30 bg-amber-400/5 p-3"><div className="flex items-start gap-2"><span className="text-amber-400 text-sm mt-0.5">⚠</span><div><p className="font-mono text-xs text-amber-400 tracking-wide">Non-standard aspect ratio ({dims.w}×{dims.h})</p><p className="mt-1 font-mono text-[11px] text-nordic-silver/70">Recommended ratios: 1:1, 4:3, 3:2, 16:9. Click &quot;Crop Image&quot; to fix it.</p></div></div></div>}
          {ratio && <div className="mt-2 border border-emerald-400/20 bg-emerald-400/5 p-2"><p className="font-mono text-[11px] text-emerald-400/80">✓ Standard ratio {ratio} — image will display well across all devices.</p></div>}
          {dims.size > 5 * 1024 * 1024 && <div className="mt-2 border border-amber-400/30 bg-amber-400/5 p-2"><p className="font-mono text-[11px] text-amber-400/80">⚠ Large file ({formatSize(dims.size)}). Consider compressing for faster loading.</p></div>}
        </div>
      )}
      {cropOpen && value && <CropModal src={value} folder={folder} onCropped={async (blob) => { setCropOpen(false); setBusy(true); try { const fileName = dims?.name ?? "cropped.png"; const croppedFile = new File([blob], fileName, { type: blob.type }); readDims(croppedFile); const url = await uploadFile(croppedFile, folder); onChange(url); } catch (err) { window.alert(err instanceof Error ? err.message : "Crop upload failed"); } finally { setBusy(false); } }} onClose={() => setCropOpen(false)} />}
    </div>
  );
}

type CropRatio = { label: string; value: number | null };
const CROP_RATIOS: CropRatio[] = [{ label: "Free", value: null }, { label: "1:1", value: 1 }, { label: "4:3", value: 4 / 3 }, { label: "3:2", value: 3 / 2 }, { label: "16:9", value: 16 / 9 }, { label: "9:16", value: 9 / 16 }];

function CropModal({ src, folder, onCropped, onClose }: { src: string; folder: UploadFolder; onCropped: (blob: Blob) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetRatio, setTargetRatio] = useState<number | null>(4 / 3);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img; const container = containerRef.current; if (!container) return;
      const maxW = container.clientWidth; const maxH = 400;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const dispW = img.naturalWidth * scale; const dispH = img.naturalHeight * scale;
      const canvas = canvasRef.current; if (!canvas) return;
      canvas.width = dispW; canvas.height = dispH;
      const initCrop = computeCrop(dispW, dispH, targetRatio);
      cropRef.current = initCrop; setCrop(initCrop);
      drawCanvas(img, canvas, dispW, dispH, initCrop); setReady(true);
    }; img.src = src;
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current; const img = imgRef.current;
    const initCrop = computeCrop(canvas.width, canvas.height, targetRatio);
    cropRef.current = initCrop; setCrop(initCrop);
    drawCanvas(img, canvas, canvas.width, canvas.height, initCrop);
  }, [targetRatio, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  function computeCrop(dispW: number, dispH: number, ratio: number | null) {
    if (!ratio) return { x: 0, y: 0, w: dispW, h: dispH };
    let cw: number, ch: number;
    if (ratio >= 1) { cw = dispW; ch = dispW / ratio; if (ch > dispH) { ch = dispH; cw = dispH * ratio; } }
    else { ch = dispH; cw = dispH * ratio; if (cw > dispW) { cw = dispW; ch = dispW / ratio; } }
    return { x: (dispW - cw) / 2, y: (dispH - ch) / 2, w: cw, h: ch };
  }

  function drawCanvas(img: HTMLImageElement, canvas: HTMLCanvasElement, dW: number, dH: number, c: { x: number; y: number; w: number; h: number }) {
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, dW, dH); ctx.drawImage(img, 0, 0, dW, dH);
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, dW, dH);
    ctx.drawImage(img, c.x, c.y, c.w, c.h, c.x, c.y, c.w, c.h);
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.w, c.h);
    const step = 3; ctx.strokeStyle = "rgba(201,168,76,0.25)"; ctx.lineWidth = 1;
    for (let i = 1; i < step; i++) { ctx.beginPath(); ctx.moveTo(c.x + (c.w * i) / step, c.y); ctx.lineTo(c.x + (c.w * i) / step, c.y + c.h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(c.x, c.y + (c.h * i) / step); ctx.lineTo(c.x + c.w, c.y + (c.h * i) / step); ctx.stroke(); }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect(); const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
    const c = cropRef.current;
    if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) { setDragging(true); dragStart.current = { x: mx - c.x, y: my - c.y }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect(); const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
    const canvas = canvasRef.current; let nx = mx - dragStart.current.x; let ny = my - dragStart.current.y;
    const c = cropRef.current; nx = Math.max(0, Math.min(nx, canvas.width - c.w)); ny = Math.max(0, Math.min(ny, canvas.height - c.h));
    cropRef.current = { ...c, x: nx, y: ny }; setCrop({ ...cropRef.current });
    if (imgRef.current) drawCanvas(imgRef.current, canvas, canvas.width, canvas.height, cropRef.current);
  };

  const onPointerUp = () => setDragging(false);

  const doCrop = async () => {
    const img = imgRef.current; const c = cropRef.current; if (!img) return;
    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / (canvasRef.current?.width ?? 1); const scaleY = img.naturalHeight / (canvasRef.current?.height ?? 1);
    const realCrop = { x: c.x * scaleX, y: c.y * scaleY, w: c.w * scaleX, h: c.h * scaleY };
    const maxOut = 2048; let outW = Math.round(realCrop.w); let outH = Math.round(realCrop.h);
    if (outW > maxOut || outH > maxOut) { const s = maxOut / Math.max(outW, outH); outW = Math.round(outW * s); outH = Math.round(outH * s); }
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(img, realCrop.x, realCrop.y, realCrop.w, realCrop.h, 0, 0, outW, outH);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png", 0.95));
    onCropped(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl border border-nordic-gold/30 bg-[#0c0e14] shadow-[0_0_60px_rgba(201,168,76,0.1)] p-6">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-nordic-gold/60" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-nordic-gold/60" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-nordic-gold/60" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-nordic-gold/60" />
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-nordic-gold/70">✂ Crop Image</div>
          <button onClick={onClose} className="text-nordic-silver/50 hover:text-nordic-gold text-xl" aria-label="Close">&#10005;</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {CROP_RATIOS.map((r) => (<button key={r.label} onClick={() => setTargetRatio(r.value)} className={`font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${targetRatio === r.value ? "border-nordic-gold text-nordic-gold bg-nordic-gold/10" : "border-nordic-silver/20 text-nordic-silver/60 hover:text-nordic-gold hover:border-nordic-gold/40"}`}>{r.label}</button>))}
        </div>
        <div ref={containerRef} className="flex justify-center overflow-hidden bg-black/40 border border-nordic-silver/10">
          <canvas ref={canvasRef} className="max-w-full cursor-move" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
        </div>
        <p className="mt-3 font-mono text-[11px] text-nordic-silver/50 text-center">Drag the crop box to reposition. The highlighted area will be kept.</p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button onClick={doCrop} className={btnPrimary}>Apply Crop</button>
        </div>
      </div>
    </div>
  );
}

function FocalPointPicker({ src, focalX, focalY, onChange }: { src: string; focalX: number; focalY: number; onChange: (x: number, y: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  return (
    <div>
      <Field label="Focal Point (click to choose what part shows)">
        <div ref={containerRef} onClick={handleClick} className="relative cursor-crosshair border border-nordic-silver/20 overflow-hidden bg-black/40 max-h-56">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="Focal preview" className="w-full h-56 object-cover" style={{ objectPosition: `${focalX}% ${focalY}%` }} />
          ) : (
            <div className="h-56 flex items-center justify-center text-nordic-silver/40 font-mono text-xs">Upload an image first</div>
          )}
          <div className="absolute w-5 h-5 -ml-2.5 -mt-2.5 border-2 border-nordic-gold rounded-full pointer-events-none shadow-[0_0_10px_rgba(201,168,76,0.6)]" style={{ left: `${focalX}%`, top: `${focalY}%` }} />
          <div className="absolute w-px h-5 pointer-events-none" style={{ left: `${focalX}%`, top: `${focalY}%`, marginTop: "-10px", background: "rgba(201,168,76,0.4)" }} />
          <div className="absolute w-px h-5 pointer-events-none" style={{ left: `${focalX}%`, top: `${focalY}%`, marginTop: "10px", background: "rgba(201,168,76,0.4)" }} />
          <div className="absolute h-px w-5 pointer-events-none" style={{ left: `${focalX}%`, top: `${focalY}%`, marginLeft: "-10px", background: "rgba(201,168,76,0.4)" }} />
          <div className="absolute h-px w-5 pointer-events-none" style={{ left: `${focalX}%`, top: `${focalY}%`, marginLeft: "10px", background: "rgba(201,168,76,0.4)" }} />
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-mono text-[10px] text-nordic-silver/50">Position: {focalX}% x {focalY}%</span>
          <button type="button" onClick={() => onChange(50, 50)} className="font-mono text-[10px] text-nordic-gold/70 hover:text-nordic-gold">Reset to center</button>
        </div>
      </Field>
    </div>
  );
}

function CertList({ certs, onEdit, onDelete, busy }: { certs: Certificate[]; onEdit: (c: Certificate) => void; onDelete: (id: string) => void; busy: boolean }) {
  return (
    <div className="space-y-3">
      {certs.length === 0 && <p className="font-mono text-xs text-nordic-silver/50">The vault is empty.</p>}
      {certs.map((c) => (
        <div key={c.id} className="flex items-center justify-between border border-nordic-silver/10 bg-[#0a0c10] p-4">
          <div className="min-w-0"><div className="font-cinzel text-nordic-snow">{c.title}</div><div className="mt-0.5 font-mono text-xs text-nordic-silver/60">{c.issuer || "—"} · {c.year || "—"}</div></div>
          <div className="flex gap-2 shrink-0"><button onClick={() => onEdit(c)} className={btnGhost} disabled={busy}>Edit</button><button onClick={() => onDelete(c.id)} className={`${btnGhost} text-red-400 border-red-400/40 hover:bg-red-400/10`} disabled={busy}>Delete</button></div>
        </div>
      ))}
    </div>
  );
}

function QuestList({ quests, onEdit, onDelete, busy }: { quests: Quest[]; onEdit: (q: Quest) => void; onDelete: (id: string) => void; busy: boolean }) {
  return (
    <div className="space-y-3">
      {quests.length === 0 && <p className="font-mono text-xs text-nordic-silver/50">No quests recorded.</p>}
      {quests.map((q) => (
        <div key={q.id} className="flex items-center justify-between border border-nordic-silver/10 bg-[#0a0c10] p-4">
          <div className="min-w-0"><div className="font-cinzel text-nordic-snow">{q.name}</div><div className="mt-0.5 font-mono text-xs text-nordic-silver/60">{q.status} · {q.difficulty}</div></div>
          <div className="flex gap-2 shrink-0"><button onClick={() => onEdit(q)} className={btnGhost} disabled={busy}>Edit</button><button onClick={() => onDelete(q.id)} className={`${btnGhost} text-red-400 border-red-400/40 hover:bg-red-400/10`} disabled={busy}>Delete</button></div>
        </div>
      ))}
    </div>
  );
}

function CertForm({ existing, onCancel, onSave }: { existing?: Certificate; onCancel: () => void; onSave: (c: Certificate) => void }) {
  const [form, setForm] = useState({ title: existing?.title ?? "", issuer: existing?.issuer ?? "", year: existing?.year ?? "", description: existing?.description ?? "", seal: existing?.seal ?? "ᚨ", verifyUrl: existing?.verifyUrl ?? "", image: existing?.image ?? "" });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { const url = existing ? `/api/admin/certificates/${existing.id}` : "/api/admin/certificates"; const method = existing ? "PATCH" : "POST"; const saved = (await jsonFetch(url, { method, body: JSON.stringify(form) })) as Certificate; onSave(saved); } catch (err) { window.alert(err instanceof Error ? err.message : "Save failed"); } finally { setBusy(false); } };
  return (
    <form onSubmit={submit} className="space-y-4 border border-nordic-gold/20 bg-[#0a0c10] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="Title *"><input value={form.title} onChange={set("title")} className={inputCls} required /></Field><Field label="Issuer"><input value={form.issuer} onChange={set("issuer")} className={inputCls} /></Field><Field label="Year"><input value={form.year} onChange={set("year")} className={inputCls} /></Field><Field label="Seal glyph"><input value={form.seal} onChange={set("seal")} className={inputCls} maxLength={2} /></Field></div>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} /></Field>
      <Field label="Verify URL"><input value={form.verifyUrl} onChange={set("verifyUrl")} className={inputCls} placeholder="https://…" /></Field>
      <ImageField value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} folder="certs" />
      <div className="pt-2 flex gap-3"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : existing ? "Save Changes" : "Seal Certificate"}</button><button type="button" onClick={onCancel} className={btnGhost}>Cancel</button></div>
    </form>
  );
}

function JourneyList({ journey, onEdit, onDelete, busy }: { journey: JourneyChapter[]; onEdit: (c: JourneyChapter) => void; onDelete: (id: string) => void; busy: boolean }) {
  return (
    <div className="space-y-3">
      {journey.length === 0 && <p className="font-mono text-xs text-nordic-silver/50">The path has no chapters yet.</p>}
      {journey.map((ch) => (
        <div key={ch.id} className="flex items-center justify-between border border-nordic-silver/10 bg-[#0a0c10] p-4">
          <div className="min-w-0"><div className="font-cinzel text-nordic-snow">{ch.title}</div><div className="mt-0.5 font-mono text-xs text-nordic-silver/60">{ch.chapter} · {ch.institution || "—"} · {ch.period || "—"}</div></div>
          <div className="flex gap-2 shrink-0"><button onClick={() => onEdit(ch)} className={btnGhost} disabled={busy}>Edit</button><button onClick={() => onDelete(ch.id)} className={`${btnGhost} text-red-400 border-red-400/40 hover:bg-red-400/10`} disabled={busy}>Delete</button></div>
        </div>
      ))}
    </div>
  );
}

function JourneyForm({ existing, onCancel, onSave }: { existing?: JourneyChapter; onCancel: () => void; onSave: (c: JourneyChapter) => void }) {
  const [form, setForm] = useState({ chapter: existing?.chapter ?? "", title: existing?.title ?? "", institution: existing?.institution ?? "", period: existing?.period ?? "", description: existing?.description ?? "", highlights: existing?.highlights.join(", ") ?? "", runeSymbol: existing?.runeSymbol ?? "" });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { const url = existing ? `/api/admin/experience/${existing.id}` : "/api/admin/experience"; const method = existing ? "PATCH" : "POST"; const saved = (await jsonFetch(url, { method, body: JSON.stringify(form) })) as JourneyChapter; onSave(saved); } catch (err) { window.alert(err instanceof Error ? err.message : "Save failed"); } finally { setBusy(false); } };
  return (
    <form onSubmit={submit} className="space-y-4 border border-nordic-gold/20 bg-[#0a0c10] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="Title *"><input value={form.title} onChange={set("title")} className={inputCls} required /></Field><Field label="Chapter"><input value={form.chapter} onChange={set("chapter")} className={inputCls} /></Field><Field label="Institution"><input value={form.institution} onChange={set("institution")} className={inputCls} /></Field><Field label="Period"><input value={form.period} onChange={set("period")} className={inputCls} placeholder="2026–2027" /></Field><Field label="Rune symbol"><input value={form.runeSymbol} onChange={set("runeSymbol")} className={inputCls} maxLength={3} /></Field></div>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} /></Field>
      <Field label="Highlights (comma separated)"><textarea value={form.highlights} onChange={set("highlights")} rows={2} className={inputCls} /></Field>
      <div className="pt-2 flex gap-3"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : existing ? "Save Changes" : "Etch Chapter"}</button><button type="button" onClick={onCancel} className={btnGhost}>Cancel</button></div>
    </form>
  );
}

function MessagesPanel({ messages, onToggle, onDelete, busy }: { messages: Message[]; onToggle: (id: string, status: "pending" | "published") => void; onDelete: (id: string) => void; busy: boolean }) {
  return (
    <div className="space-y-3">
      {messages.length === 0 && <p className="font-mono text-xs text-nordic-silver/50">No ravens have landed yet.</p>}
      {messages.map((m) => (
        <div key={m.id} className="border border-nordic-silver/10 bg-[#0a0c10] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-cinzel text-nordic-snow">{m.name}</span><span className={`font-mono text-[9px] tracking-widest px-2 py-0.5 border ${m.status === "published" ? "text-emerald-400 border-emerald-400/40" : "text-nordic-silver/60 border-nordic-silver/25"}`}>{m.status.toUpperCase()}</span><span className="font-mono text-[10px] text-nordic-silver/50">{new Date(m.createdAt).toLocaleString()}</span></div><p className="mt-2 text-sm text-nordic-silver/85 whitespace-pre-wrap">{m.message}</p></div>
          </div>
          <div className="mt-3 flex gap-2"><button onClick={() => onToggle(m.id, m.status === "published" ? "pending" : "published")} className={btnGhost} disabled={busy}>{m.status === "published" ? "Unpublish" : "Publish"}</button><button onClick={() => onDelete(m.id)} className={`${btnGhost} text-red-400 border-red-400/40 hover:bg-red-400/10`} disabled={busy}>Delete</button></div>
        </div>
      ))}
    </div>
  );
}

function StatsPanel({ stats, onReset, busy }: { stats: PanelStats; onReset: () => void; busy: boolean }) {
  const today = stats.last14[stats.last14.length - 1];
  const maxVisits = Math.max(1, ...stats.last14.map((x) => x.visits));
  const maxPageViews = Math.max(1, ...stats.last14.map((x) => x.pageViews));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Visits" value={stats.totalVisits} />
        <StatCard label="Unique Visitors" value={stats.uniqueVisitors} />
        <StatCard label="Total Page Views" value={stats.totalPageViews} />
        <StatCard label="Today" value={`${today.visits} visits · ${today.pageViews} views`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-nordic-silver/10 bg-[#0a0c10] p-4">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-3">Visits (last 14 days)</div>
          <div className="flex items-end gap-1 h-28">{stats.last14.map((d) => { const h = Math.round((d.visits / maxVisits) * 100); return (<div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group"><span className="font-mono text-[9px] text-nordic-gold/70 opacity-0 group-hover:opacity-100 transition-opacity">{d.visits}</span><div className="w-full bg-gradient-to-t from-nordic-gold/80 to-nordic-gold/20" style={{ height: `${Math.max(h, d.visits > 0 ? 8 : 2)}%` }} title={`${d.day}: ${d.visits} visits`} /><span className="font-mono text-[8px] text-nordic-silver/40">{d.day.slice(8)}</span></div>); })}</div>
        </div>
        <div className="border border-nordic-silver/10 bg-[#0a0c10] p-4">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-3">Page Views (last 14 days)</div>
          <div className="flex items-end gap-1 h-28">{stats.last14.map((d) => { const h = Math.round((d.pageViews / maxPageViews) * 100); return (<div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group"><span className="font-mono text-[9px] text-nordic-frost/70 opacity-0 group-hover:opacity-100 transition-opacity">{d.pageViews}</span><div className="w-full bg-gradient-to-t from-nordic-frost/80 to-nordic-frost/20" style={{ height: `${Math.max(h, d.pageViews > 0 ? 8 : 2)}%` }} title={`${d.day}: ${d.pageViews} views`} /><span className="font-mono text-[8px] text-nordic-silver/40">{d.day.slice(8)}</span></div>); })}</div>
        </div>
      </div>
      <div className="border border-nordic-silver/10 bg-[#0a0c10] p-4">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-2">Daily Breakdown</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left"><thead><tr className="border-b border-nordic-silver/10"><th className="font-mono text-[9px] text-nordic-silver/50 pb-2 pr-4">DATE</th><th className="font-mono text-[9px] text-nordic-silver/50 pb-2 pr-4">VISITS</th><th className="font-mono text-[9px] text-nordic-silver/50 pb-2 pr-4">UNIQUE</th><th className="font-mono text-[9px] text-nordic-silver/50 pb-2">PAGE VIEWS</th></tr></thead>
          <tbody>{[...stats.last14].reverse().map((d) => (<tr key={d.day} className="border-b border-nordic-silver/5"><td className="font-mono text-xs text-nordic-snow py-1.5 pr-4">{d.day}</td><td className="font-mono text-xs text-nordic-gold py-1.5 pr-4">{d.visits}</td><td className="font-mono text-xs text-nordic-frost py-1.5 pr-4">{d.unique}</td><td className="font-mono text-xs text-nordic-silver/80 py-1.5">{d.pageViews}</td></tr>))}</tbody></table>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard title="Most Visited Pages" items={Object.entries(stats.pageViewsByPath).sort((a, b) => b[1] - a[1]).slice(0, 8)} />
        <BreakdownCard title="Referrers" items={Object.entries(stats.referrers).sort((a, b) => b[1] - a[1]).slice(0, 8)} accent="nordic-frost" />
        <BreakdownCard title="Browsers" items={Object.entries(stats.browsers).sort((a, b) => b[1] - a[1])} accent="nordic-frost" />
        <BreakdownCard title="Devices" items={Object.entries(stats.devices).sort((a, b) => b[1] - a[1])} accent="nordic-frost" />
      </div>
      <button onClick={onReset} className={`${btnGhost} text-red-400 border-red-400/40 hover:bg-red-400/10`} disabled={busy}>Reset Statistics</button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return <div className="border border-nordic-gold/20 bg-[#0a0c10] p-5"><div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-silver/60">{label}</div><div className="mt-2 font-cinzel text-3xl text-nordic-gold">{value}</div></div>;
}

function BreakdownCard({ title, items, accent = "nordic-gold" }: { title: string; items: BreakdownItem[]; accent?: string }) {
  const max = Math.max(1, ...items.map(([, v]) => v));
  return (
    <div className="border border-nordic-silver/10 bg-[#0a0c10] p-4">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-3">{title}</div>
      {items.length === 0 ? (
        <div className="font-mono text-xs text-nordic-silver/40 italic">Nothing recorded yet.</div>
      ) : (
        <div className="space-y-1.5">{items.map(([label, count]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="font-mono text-xs text-nordic-snow/90 truncate flex-1">{label === "direct" ? "Direct visit" : label}</span>
            <div className="w-2/5 bg-nordic-silver/10 h-3"><div className={`bg-gradient-to-r ${accent === "nordic-frost" ? "from-nordic-frost/80 to-nordic-frost/20" : "from-nordic-gold/80 to-nordic-gold/20"} h-full`} style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
            <span className="font-mono text-xs text-nordic-gold w-8 text-right">{count}</span>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function QuestForm({ existing, onCancel, onSave }: { existing?: Quest; onCancel: () => void; onSave: (q: Quest) => void }) {
  const [form, setForm] = useState({ name: existing?.name ?? "", tagline: existing?.tagline ?? "", status: existing?.status ?? "COMPLETED", difficulty: existing?.difficulty ?? "APPRENTICE", objective: existing?.objective ?? "", description: existing?.description ?? "", technologies: existing?.technologies.join(", ") ?? "", achievements: existing?.achievements.join(", ") ?? "", lessons: existing?.lessons.join(", ") ?? "", image: existing?.image ?? "", demoUrl: existing?.demoUrl ?? "", repoUrl: existing?.repoUrl ?? "" });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { const url = existing ? `/api/admin/projects/${existing.id}` : "/api/admin/projects"; const method = existing ? "PATCH" : "POST"; const saved = (await jsonFetch(url, { method, body: JSON.stringify(form) })) as Quest; onSave(saved); } catch (err) { window.alert(err instanceof Error ? err.message : "Save failed"); } finally { setBusy(false); } };
  return (
    <form onSubmit={submit} className="space-y-4 border border-nordic-gold/20 bg-[#0a0c10] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="Name *"><input value={form.name} onChange={set("name")} className={inputCls} required /></Field><Field label="Tagline"><input value={form.tagline} onChange={set("tagline")} className={inputCls} /></Field><Field label="Status"><select value={form.status} onChange={set("status")} className={inputCls}><option value="COMPLETED">COMPLETED</option><option value="IN PROGRESS">IN PROGRESS</option></select></Field><Field label="Difficulty"><select value={form.difficulty} onChange={set("difficulty")} className={inputCls}><option value="APPRENTICE">APPRENTICE</option><option value="JOURNEYMAN">JOURNEYMAN</option><option value="EXPERT">EXPERT</option><option value="MASTER">MASTER</option></select></Field></div>
      <Field label="Objective"><textarea value={form.objective} onChange={set("objective")} rows={2} className={inputCls} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Field label="Technologies (comma)"><input value={form.technologies} onChange={set("technologies")} className={inputCls} /></Field><Field label="Achievements (comma)"><input value={form.achievements} onChange={set("achievements")} className={inputCls} /></Field><Field label="Lessons (comma)"><input value={form.lessons} onChange={set("lessons")} className={inputCls} /></Field></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="Demo URL"><input value={form.demoUrl} onChange={set("demoUrl")} className={inputCls} placeholder="https://…" /></Field><Field label="Repo URL"><input value={form.repoUrl} onChange={set("repoUrl")} className={inputCls} placeholder="https://…" /></Field></div>
      <ImageField value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} folder="projects" />
      <div className="pt-2 flex gap-3"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : existing ? "Save Changes" : "Record Quest"}</button><button type="button" onClick={onCancel} className={btnGhost}>Cancel</button></div>
    </form>
  );
}

const ICON_OPTIONS = ["camera", "music", "box", "pen-tool", "film", "sparkles"];

type AboutForm = { heroTagline: string; bio: string; interests: AboutContent["interests"]; skillBars: AboutContent["skillBars"]; skillGroups: AboutContent["skillGroups"]; education: AboutContent["education"] };
const EMPTY_FORM: AboutForm = { heroTagline: "", bio: "", interests: [], skillBars: [], skillGroups: [], education: [] };
function makeInitialForm(content: AboutContent | null): AboutForm { if (!content) return EMPTY_FORM; return { heroTagline: content.heroTagline, bio: content.bio, interests: content.interests ?? [], skillBars: content.skillBars ?? [], skillGroups: content.skillGroups ?? [], education: content.education ?? [] }; }

function AboutEditor({ content, busy, onSaved }: { content: AboutContent | null; busy: boolean; onSaved: (c: AboutContent) => void }) {
  const [form, setForm] = useState<AboutForm>(() => makeInitialForm(content));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const formRef = useRef(form); const firstRender = useRef(true); const writing = useRef(false); const dirty = useRef(false); const timer = useRef<number | null>(null);
  useEffect(() => { formRef.current = form; }, [form]);
  const write = async () => {
    if (writing.current) { dirty.current = true; return; }
    writing.current = true; setSaveState("saving");
    try { const target = formRef.current; const payload = { ...target, skillBars: target.skillBars.map((b) => ({ ...b, level: Number(b.level) || 0 })) }; const saved = (await jsonFetch("/api/admin/about", { method: "POST", body: JSON.stringify(payload) })) as AboutContent; onSaved(saved); setSaveState("saved"); }
    catch (e) { setSaveState("error"); window.alert(e instanceof Error ? e.message : "Save failed"); }
    finally { writing.current = false; if (dirty.current) { dirty.current = false; void write(); } }
  };
  const writeRef = useRef(write); useEffect(() => { writeRef.current = write; });
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } if (timer.current !== null) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { timer.current = null; void writeRef.current(); }, 700); return () => { if (timer.current !== null) window.clearTimeout(timer.current); }; }, [form]);
  const saveNow = () => { if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; } void write(); };
  const setField = (key: "heroTagline" | "bio") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="space-y-6">
      <div className="border border-nordic-gold/20 bg-[#0a0c10] p-6 space-y-4">
        <Field label="Hero tagline"><input value={form.heroTagline} onChange={setField("heroTagline")} className={inputCls} /></Field>
        <Field label="Bio"><textarea value={form.bio} onChange={setField("bio")} rows={4} className={inputCls} /></Field>
      </div>
      <SubList title="Interests" items={form.interests} onAdd={(item) => setForm((f) => ({ ...f, interests: [...f.interests, item] }))} onUpdate={(i, item) => setForm((f) => ({ ...f, interests: f.interests.map((x, j) => (j === i ? item : x)) }))} onRemove={(i) => setForm((f) => ({ ...f, interests: f.interests.filter((_, j) => j !== i) }))} fields={[{ key: "glyph", label: "Glyph", width: "w-16", placeholder: "💻" }, { key: "name", label: "Name", width: "flex-1" }, { key: "description", label: "Description", width: "flex-1" }]} />
      <SubList title="Skill bars" items={form.skillBars} onAdd={(item) => setForm((f) => ({ ...f, skillBars: [...f.skillBars, item] }))} onUpdate={(i, item) => setForm((f) => ({ ...f, skillBars: f.skillBars.map((x, j) => (j === i ? item : x)) }))} onRemove={(i) => setForm((f) => ({ ...f, skillBars: f.skillBars.filter((_, j) => j !== i) }))} fields={[{ key: "name", label: "Name", width: "flex-1" }, { key: "level", label: "Level", width: "w-20", type: "number" }, { key: "color", label: "Color", width: "w-16", type: "color" }]} />
      <SubList title="Skill groups" items={form.skillGroups} onAdd={(item) => setForm((f) => ({ ...f, skillGroups: [...f.skillGroups, item] }))} onUpdate={(i, item) => setForm((f) => ({ ...f, skillGroups: f.skillGroups.map((x, j) => (j === i ? item : x)) }))} onRemove={(i) => setForm((f) => ({ ...f, skillGroups: f.skillGroups.filter((_, j) => j !== i) }))} groupSummary={(g) => `${g.title} · ${g.tier} · ${g.skills.length} skills`} />
      <GroupList groups={form.skillGroups} onGroups={(g) => setForm((f) => ({ ...f, skillGroups: g }))} />
      <SubList title="Education" items={form.education} onAdd={(item) => setForm((f) => ({ ...f, education: [...f.education, item] }))} onUpdate={(i, item) => setForm((f) => ({ ...f, education: f.education.map((x, j) => (j === i ? item : x)) }))} onRemove={(i) => setForm((f) => ({ ...f, education: f.education.filter((_, j) => j !== i) }))} fields={[{ key: "kind", label: "Kind", width: "w-28", type: "select", options: ["current", "previous"] }, { key: "title", label: "Title", width: "flex-1" }, { key: "line", label: "Line", width: "flex-1" }]} />
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={saveNow} disabled={busy} className={btnPrimary}>{busy ? "Saving…" : saveState === "saving" ? "Saving…" : "Save Now"}</button>
        <span className={`font-mono text-[11px] tracking-wider ${saveState === "saved" ? "text-emerald-400" : saveState === "error" ? "text-red-400" : saveState === "saving" ? "text-nordic-gold" : "text-nordic-silver/50"}`}>{saveState === "idle" ? "✎ Changes are saved automatically" : saveState === "saving" ? "… saving" : saveState === "saved" ? "✓ Saved" : "✕ Failed"}</span>
      </div>
    </div>
  );
}

function SubList<T extends object>({ title, items, onAdd, onUpdate, onRemove, fields, groupSummary }: { title: string; items: T[]; onAdd: (item: T) => void; onUpdate: (i: number, item: T) => void; onRemove: (i: number) => void; fields?: { key: string; label: string; width: string; placeholder?: string; type?: string; options?: string[] }[]; groupSummary?: (item: T) => string }) {
  const toRecord = (item: T) => item as Record<string, unknown>;
  return (
    <div className="border border-nordic-silver/15 bg-[#0a0c10] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70">{title}</div>
        {fields && <button onClick={() => { const blank: Record<string, unknown> = {}; for (const f of fields) blank[f.key] = f.type === "select" ? f.options?.[0] ?? "" : ""; onAdd(blank as T); }} className={btnGhost}>+ Add</button>}
        {groupSummary && <button onClick={() => onAdd({ title: "", tier: "EXPERT", skills: [] } as T)} className={btnGhost}>+ Add Group</button>}
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="font-mono text-xs text-nordic-silver/50">Nothing here yet.</p>}
        {items.map((item, i) => { const rec = toRecord(item); return fields ? (
          <div key={i} className="flex flex-wrap items-end gap-2 border border-nordic-silver/10 p-2">
            {fields.map((f) => f.type === "select" ? (<div key={f.key} className={f.width}><label className={labelCls}>{f.label}</label><select value={String(rec[f.key] ?? "")} onChange={(e) => onUpdate(i, { ...rec, [f.key]: e.target.value } as T)} className={inputCls}>{(f.options ?? []).map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>) : f.type === "color" ? (<div key={f.key} className={f.width}><label className={labelCls}>{f.label}</label><input type="color" value={String(rec[f.key] ?? "#c9a84c")} onChange={(e) => onUpdate(i, { ...rec, [f.key]: e.target.value } as T)} className="w-full h-9 bg-[#0a0c10] border border-nordic-silver/20 cursor-pointer" /></div>) : (<div key={f.key} className={f.width}><label className={labelCls}>{f.label}</label><input type={f.type ?? "text"} value={String(rec[f.key] ?? "")} onChange={(e) => onUpdate(i, { ...rec, [f.key]: e.target.value } as T)} placeholder={f.placeholder} className={inputCls} /></div>))}
            <button onClick={() => onRemove(i)} className={`${btnGhost} text-red-400 border-red-400/40 px-2`}>✕</button>
          </div>
        ) : groupSummary ? (<div key={i} className="flex items-center justify-between border border-nordic-silver/10 p-2"><span className="font-mono text-xs text-nordic-silver">{groupSummary(item)}</span><button onClick={() => onRemove(i)} className={`${btnGhost} text-red-400 border-red-400/40 px-2`}>✕</button></div>) : null; })}
      </div>
    </div>
  );
}

function GroupList({ groups, onGroups }: { groups: SkillGroupType[]; onGroups: (g: SkillGroupType[]) => void }) {
  return (
    <div className="border border-nordic-silver/15 bg-[#0a0c10] p-6 space-y-3">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70">Edit each group (title, tier, skills)</div>
      {groups.map((g, i) => (
        <div key={i} className="border border-nordic-silver/10 p-3 space-y-2">
          <div className="flex gap-2">
            <input value={g.title} onChange={(e) => onGroups(groups.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Title" className={inputCls} />
            <select value={g.tier} onChange={(e) => onGroups(groups.map((x, j) => (j === i ? { ...x, tier: e.target.value as SkillGroupType["tier"] } : x)))} className={`${inputCls} w-40`}>{skillGroupTiers.map((t) => (<option key={t} value={t}>{t}</option>))}</select>
          </div>
          <input value={g.skills.join(", ")} onChange={(e) => onGroups(groups.map((x, j) => (j === i ? { ...x, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x)))} placeholder="Skills (comma separated)" className={inputCls} />
        </div>
      ))}
    </div>
  );
}

function CreativeEditor({ arts, artProjects, busy, onSaveArt, onDeleteArt, onSaveProject, onDeleteProject }: { arts: ArtForm[]; artProjects: ArtProject[]; busy: boolean; onSaveArt: (a: ArtForm) => void; onDeleteArt: (id: string) => void; onSaveProject: (p: ArtProject) => void; onDeleteProject: (id: string) => void }) {
  const [artFormOpen, setArtFormOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<ArtForm | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ArtProject | null>(null);
  const [projectArtId, setProjectArtId] = useState<string>(() => arts[0]?.id ?? "");
  const filtered = artProjects.filter((p) => p.artId === projectArtId);
  return (
    <div className="space-y-6">
      <div className="border border-nordic-gold/20 bg-[#0a0c10] p-6">
        <div className="flex items-center justify-between mb-4"><div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70">Art Forms ({arts.length})</div><button onClick={() => { setEditingArt(null); setArtFormOpen(true); }} className={btnGhost}>+ Add Form</button></div>
        {artFormOpen && <ArtFormEditor existing={editingArt} busy={busy} onCancel={() => setArtFormOpen(false)} onSave={(a) => { onSaveArt(a); setArtFormOpen(false); if (!projectArtId) setProjectArtId(a.id); }} />}
        <div className="mt-3 space-y-2">{arts.map((a) => (<div key={a.id} className="flex items-center justify-between border border-nordic-silver/10 p-3"><div className="min-w-0"><div className="font-cinzel text-nordic-snow">{a.name}</div><div className="font-mono text-xs text-nordic-silver/60">{a.runeWord || "—"} · {a.icon}</div></div><div className="flex gap-2 shrink-0"><button onClick={() => { setEditingArt(a); setArtFormOpen(true); }} className={btnGhost}>Edit</button><button onClick={() => onDeleteArt(a.id)} className={`${btnGhost} text-red-400 border-red-400/40`}>Delete</button></div></div>))}</div>
      </div>
      <div className="border border-nordic-gold/20 bg-[#0a0c10] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70">Works in the gallery</div><div className="flex gap-2"><select value={projectArtId} onChange={(e) => setProjectArtId(e.target.value)} className={`${inputCls} w-auto`}>{arts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select><button onClick={() => { setEditingProject(null); setProjectOpen(true); }} className={btnGhost} disabled={!projectArtId}>+ Add Work</button></div></div>
        {projectOpen && <ArtProjectForm existing={editingProject} artId={projectArtId} busy={busy} onCancel={() => setProjectOpen(false)} onSave={(p) => { onSaveProject(p); setProjectOpen(false); if (p.artId !== projectArtId) setProjectArtId(p.artId); }} />}
        <div className="mt-3 space-y-2">
          {filtered.length === 0 && <p className="font-mono text-xs text-nordic-silver/50">No works in this gallery yet.</p>}
          {filtered.map((p) => (<div key={p.id} className="flex items-center justify-between border border-nordic-silver/10 p-3"><div className="min-w-0"><div className="font-cinzel text-nordic-snow">{p.title}</div><div className="font-mono text-xs text-nordic-silver/60">{p.year || "—"}{p.image ? " · image ✓" : ""}</div></div><div className="flex gap-2 shrink-0"><button onClick={() => { setEditingProject(p); setProjectArtId(p.artId); setProjectOpen(true); }} className={btnGhost}>Edit</button><button onClick={() => onDeleteProject(p.id)} className={`${btnGhost} text-red-400 border-red-400/40`}>Delete</button></div></div>))}
        </div>
      </div>
      <div className="flex justify-end"><Link href="/creative" target="_blank" className="font-mono text-[11px] tracking-wider text-nordic-frost hover:text-nordic-gold transition-colors">→ Open /creative</Link></div>
    </div>
  );
}

function ArtFormEditor({ existing, busy, onCancel, onSave }: { existing: ArtForm | null; busy: boolean; onCancel: () => void; onSave: (a: ArtForm) => void }) {
  const [form, setForm] = useState({ name: existing?.name ?? "", description: existing?.description ?? "", icon: existing?.icon ?? "sparkles", runeWord: existing?.runeWord ?? "" });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { const url = existing ? `/api/admin/creative/${existing.id}` : "/api/admin/creative"; const method = existing ? "PATCH" : "POST"; const saved = (await jsonFetch(url, { method, body: JSON.stringify(form) })) as ArtForm; onSave(saved); } catch (err) { window.alert(err instanceof Error ? err.message : "Save failed"); } };
  return (
    <form onSubmit={submit} className="space-y-3 border border-nordic-gold/20 p-4 mt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Field label="Name *"><input value={form.name} onChange={set("name")} className={inputCls} required /></Field><Field label="Rune word"><input value={form.runeWord} onChange={set("runeWord")} className={inputCls} /></Field><Field label="Icon"><select value={form.icon} onChange={set("icon")} className={inputCls}>{ICON_OPTIONS.map((ico) => (<option key={ico} value={ico}>{ico}</option>))}</select></Field></div>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} /></Field>
      <div className="flex gap-3"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : existing ? "Save Changes" : "Create Form"}</button><button type="button" onClick={onCancel} className={btnGhost}>Cancel</button></div>
    </form>
  );
}

function ArtProjectForm({ existing, artId, busy, onCancel, onSave }: { existing: ArtProject | null; artId: string; busy: boolean; onCancel: () => void; onSave: (p: ArtProject) => void }) {
  const [form, setForm] = useState({ title: existing?.title ?? "", description: existing?.description ?? "", year: existing?.year ?? "", image: existing?.image ?? "", url: existing?.url ?? "", focalX: existing?.focalX ?? 50, focalY: existing?.focalY ?? 50 });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { const url = existing ? `/api/admin/artprojects/${existing.id}` : "/api/admin/artprojects"; const method = existing ? "PATCH" : "POST"; const saved = (await jsonFetch(url, { method, body: JSON.stringify({ ...form, artId }) })) as ArtProject; onSave(saved); } catch (err) { window.alert(err instanceof Error ? err.message : "Save failed"); } };
  return (
    <form onSubmit={submit} className="space-y-3 border border-nordic-gold/20 p-4 mt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Field label="Title *"><input value={form.title} onChange={set("title")} className={inputCls} required /></Field><Field label="Year"><input value={form.year} onChange={set("year")} className={inputCls} placeholder="2026" /></Field></div>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Field label="External URL (optional)"><input value={form.url} onChange={set("url")} className={inputCls} placeholder="https://…" /></Field></div>
      <ImageField value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} folder="art" />
      {form.image && <FocalPointPicker src={form.image} focalX={form.focalX} focalY={form.focalY} onChange={(x, y) => setForm((f) => ({ ...f, focalX: x, focalY: y }))} />}
      <div className="flex gap-3"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : existing ? "Save Changes" : "Hang Work"}</button><button type="button" onClick={onCancel} className={btnGhost}>Cancel</button></div>
    </form>
  );
}
