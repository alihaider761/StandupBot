"use client";

import { useState, useTransition } from "react";
import type { TeamMember } from "@/app/dashboard/team/page";

// ── Role badge ────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN:   "bg-indigo-100 text-indigo-700 border-indigo-200",
    MANAGER: "bg-violet-100 text-violet-700 border-violet-200",
    MEMBER:  "bg-slate-100  text-slate-600  border-slate-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold
                      border uppercase tracking-wide ${map[role] ?? map.MEMBER}`}>
      {role}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────
function Avatar({ name, active }: { name: string | null; active: boolean }) {
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center
                     text-white text-xs font-bold shrink-0 transition-all
                     ${active ? "bg-indigo-600 shadow-sm" : "bg-slate-300"}`}>
      {initials}
    </div>
  );
}

// ── Add member form ───────────────────────────────────────────────────
function AddMemberForm({ onAdded }: { onAdded: (m: TeamMember) => void }) {
  const [open, setOpen]       = useState(false);
  const [slackId, setSlackId] = useState("");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [role, setRole]       = useState("MEMBER");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slackUserId: slackId.trim(), name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add member."); return; }
      onAdded(data.member);
      setSlackId(""); setName(""); setEmail(""); setRole("MEMBER");
      setOpen(false);
    } catch { setError("Unexpected error."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                           text-white font-semibold text-sm px-4 py-2.5 rounded-xl
                           shadow-sm transition-all focus:outline-none focus:ring-2
                           focus:ring-indigo-500 focus:ring-offset-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Add Member
        </button>
      ) : (
        <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">Add team member</h3>
            <button onClick={() => { setOpen(false); setError(null); }}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1
                               rounded-lg hover:bg-slate-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                            rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {error}
            </div>
          )}

          {/* How to find Slack ID */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs text-amber-800">
            <p className="font-semibold mb-1">📍 How to find a Slack User ID</p>
            <p>In Slack → click the person&apos;s name → click <strong>⋯ More</strong> → <strong>Copy member ID</strong></p>
            <p className="mt-1 font-mono text-amber-700">Looks like: U08ABC123XY</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Slack User ID <span className="text-red-500">*</span>
              </label>
              <input value={slackId} onChange={e => setSlackId(e.target.value)}
                     required placeholder="e.g. U08ABC123XY"
                     className="w-full rounded-xl bg-slate-50 border border-slate-200
                                text-slate-900 placeholder-slate-400 px-3.5 py-2.5 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-500
                                focus:border-transparent font-mono"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input value={name} onChange={e => setName(e.target.value)}
                       placeholder="Jane Smith"
                       className="w-full rounded-xl bg-slate-50 border border-slate-200
                                  text-slate-900 placeholder-slate-400 px-3.5 py-2.5 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                                  focus:border-transparent"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="jane@company.com"
                       className="w-full rounded-xl bg-slate-50 border border-slate-200
                                  text-slate-900 placeholder-slate-400 px-3.5 py-2.5 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                                  focus:border-transparent"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200
                                 text-slate-900 px-3.5 py-2.5 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="MEMBER">Member — receives standup prompts</option>
                <option value="MANAGER">Manager — can view dashboard</option>
                <option value="ADMIN">Admin — full access</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300
                                 text-white font-semibold py-2.5 rounded-xl text-sm transition
                                 flex items-center justify-center gap-2">
                {loading
                  ? <><Spinner/> Adding…</>
                  : "Add to team"}
              </button>
              <button type="button" onClick={() => { setOpen(false); setError(null); }}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600
                                 bg-slate-100 hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Member row ────────────────────────────────────────────────────────
function MemberRow({
  member,
  onToggle,
  onRemove,
  isSelf,
}: {
  member: TeamMember;
  onToggle: (id: string, active: boolean) => void;
  onRemove: (id: string) => void;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                     ${member.isActive
                       ? "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                       : "bg-slate-50 border-slate-200 opacity-60"}`}>

      <Avatar name={member.name} active={member.isActive}/>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {member.name ?? "Unnamed"}
          </p>
          <RoleBadge role={member.role}/>
          {isSelf && (
            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50
                             border border-indigo-200 px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
          {!member.isActive && (
            <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200
                             px-1.5 py-0.5 rounded-full font-medium">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {member.email && (
            <p className="text-xs text-slate-400 truncate">{member.email}</p>
          )}
          <p className="text-xs text-slate-300 font-mono shrink-0">{member.slackUserId}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle active */}
        <button
          disabled={pending || isSelf}
          onClick={() => startTransition(() => onToggle(member.id, !member.isActive))}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full
                      border-2 border-transparent transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${member.isActive ? "bg-indigo-600" : "bg-slate-300"}`}
          role="switch"
          aria-checked={member.isActive}
          aria-label={member.isActive ? "Deactivate member" : "Activate member"}
          title={isSelf ? "You cannot deactivate yourself" : member.isActive ? "Deactivate" : "Activate"}
        >
          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full
                            bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${member.isActive ? "translate-x-4" : "translate-x-0"}`}/>
        </button>

        {/* Delete */}
        {!isSelf && (
          confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Sure?</span>
              <button onClick={() => { setConfirmDelete(false); onRemove(member.id); }}
                      className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100
                                 border border-red-200 px-2 py-1 rounded-lg transition">
                Yes
              </button>
              <button onClick={() => setConfirmDelete(false)}
                      className="text-xs font-medium text-slate-500 bg-slate-100
                                 hover:bg-slate-200 px-2 py-1 rounded-lg transition">
                No
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500
                               hover:bg-red-50 transition-colors"
                    aria-label="Remove member" title="Remove from team">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
                     01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
                     00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Main TeamClient component ─────────────────────────────────────────
export function TeamClient({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [toast, setToast]     = useState<{ msg: string; type: "ok"|"err" } | null>(null);

  function showToast(msg: string, type: "ok"|"err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleAdded(m: TeamMember) {
    setMembers(prev => [...prev, m]);
    showToast(`${m.name ?? m.slackUserId} added to the team ✅`);
  }

  async function handleToggle(id: string, active: boolean) {
    const res = await fetch(`/api/team/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, isActive: active } : m));
      showToast(active ? "Member activated" : "Member deactivated");
    } else {
      showToast("Failed to update member.", "err");
    }
  }

  async function handleRemove(id: string) {
    const member = members.find(m => m.id === id);
    const res = await fetch(`/api/team/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers(prev => prev.filter(m => m.id !== id));
      showToast(`${member?.name ?? "Member"} removed from team`);
    } else {
      const data = await res.json();
      showToast(data.error ?? "Failed to remove member.", "err");
    }
  }

  const active   = members.filter(m => m.isActive);
  const inactive = members.filter(m => !m.isActive);

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5
                         px-4 py-3 rounded-2xl shadow-lg text-sm font-medium
                         transition-all duration-300 border
                         ${toast.type === "ok"
                           ? "bg-white text-emerald-700 border-emerald-200"
                           : "bg-white text-red-700 border-red-200"}`}
             role="status">
          <span>{toast.type === "ok" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Members",   value: members.length,  color: "text-slate-800" },
          { label: "Active",          value: active.length,   color: "text-emerald-700" },
          { label: "Inactive",        value: inactive.length, color: "text-slate-400" },
        ].map(s => (
          <div key={s.label}
               className="bg-white border border-slate-200 rounded-2xl
                          shadow-sm px-5 py-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add member form */}
      <AddMemberForm onAdded={handleAdded}/>

      {/* How it works info box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-indigo-800 mb-2">💡 How it works</p>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Active members get a Slack DM every weekday at 9 AM</li>
          <li>• They reply with yesterday, today, and blockers</li>
          <li>• Reports appear on the dashboard instantly</li>
          <li>• Toggle the switch to pause a member without deleting them</li>
        </ul>
      </div>

      {/* Active members */}
      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">
            Active · {active.length}
          </h2>
          <div className="space-y-2">
            {active.map(m => (
              <MemberRow key={m.id} member={m}
                         onToggle={handleToggle} onRemove={handleRemove}
                         isSelf={false}/>
            ))}
          </div>
        </section>
      )}

      {/* Inactive members */}
      {inactive.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
            Inactive · {inactive.length}
          </h2>
          <div className="space-y-2">
            {inactive.map(m => (
              <MemberRow key={m.id} member={m}
                         onToggle={handleToggle} onRemove={handleRemove}
                         isSelf={false}/>
            ))}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm
                        text-center py-16">
          <p className="text-3xl mb-3" aria-hidden="true">👥</p>
          <p className="text-sm font-medium text-slate-500">No team members yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;Add Member&quot; above to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}
