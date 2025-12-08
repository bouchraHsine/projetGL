// src/DoctorDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDoctorById } from "./doctorService";
import { FiArrowLeft, FiMail, FiPhone, FiClock, FiUser, FiEdit } from "react-icons/fi";

const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function normalizeSchedule(raw) {
  if (!raw) return DAYS.map(d => ({ day: d, slots: [] }));
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { return DAYS.map(d => ({ day: d, slots: [] })); }
  }
  if (!Array.isArray(raw) && typeof raw === "object") {
    const keys = Object.keys(raw);
    const lowerDays = DAYS.map(d => d.toLowerCase());
    const isDayKey = keys.every(k => lowerDays.includes(k.toLowerCase()));
    if (isDayKey) {
      return DAYS.map(d => ({ day: d, slots: Array.isArray(raw[d.toLowerCase()]) ? raw[d.toLowerCase()] : (Array.isArray(raw[d]) ? raw[d] : []) }));
    }
    const arr = [];
    for (const k of keys.sort()) {
      const v = raw[k];
      if (v && v.day) arr.push({ day: v.day, slots: Array.isArray(v.slots) ? v.slots : [] });
    }
    if (arr.length) return DAYS.map((d,i) => arr[i] || { day: d, slots: [] });
    return DAYS.map(d => ({ day: d, slots: [] }));
  }
  if (Array.isArray(raw)) {
    return DAYS.map((d, i) => {
      const found = raw.find(r => (r.day || "").toLowerCase() === d.toLowerCase()) || raw[i];
      return found ? { day: found.day || d, slots: Array.isArray(found.slots) ? found.slots : [] } : { day: d, slots: [] };
    });
  }
  return DAYS.map(d => ({ day: d, slots: [] }));
}

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getDoctorById(id);
        if (!mounted) return;
        const schedule = normalizeSchedule(data.schedule);
        const absences = Array.isArray(data.absences) ? data.absences : (typeof data.absences === "string" ? (() => {
          try { return JSON.parse(data.absences); } catch { return []; }
        })() : []);
        setDoctor({ ...data, schedule, absences });
      } catch (err) {
        console.error("GET doctor:", err);
        if (mounted) setDoctor(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!doctor) return <div className="p-6">Médecin introuvable.</div>;

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  const nextOrOngoingAbsenceText = () => {
    if (!doctor.absences || doctor.absences.length === 0) return null;
    const now = new Date();
    const parsed = doctor.absences.map(a => ({ ...a, fromDate: new Date(a.from), toDate: new Date(a.to) }))
      .filter(a => a.fromDate && a.toDate)
      .sort((x,y) => x.fromDate - y.fromDate);
    const ongoing = parsed.find(p => p.fromDate <= now && p.toDate >= now);
    if (ongoing) return { label: "En congé", item: ongoing };
    const future = parsed.find(p => p.fromDate > now);
    if (future) return { label: "Prochain congé", item: future };
    const last = parsed[parsed.length - 1];
    if (last) return { label: "Dernier congé", item: last };
    return null;
  };

  const absenceInfo = nextOrOngoingAbsenceText();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate("/docteurs")} className="mb-4 text-indigo-600 flex items-center gap-2">
  <FiArrowLeft /> Retour à la liste
</button>


      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left: photo + contact */}
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {doctor.photo ? (
                <img src={(API_BASE) + doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <FiUser size={56} className="text-gray-400" />
              )}
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-800 text-center">{doctor.name}</h2>
            <div className="text-sm text-gray-500 mt-1 text-center">{doctor.specialty}</div>

            <div className="mt-4 w-full space-y-2">
              <a href={`mailto:${doctor.email}`} className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
                <FiMail /> <span className="truncate">{doctor.email}</span>
              </a>
              {doctor.phone && (
                <a href={`tel:${doctor.phone}`} className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
                  <FiPhone /> <span>{doctor.phone}</span>
                </a>
              )}

              <div className="flex gap-2 mt-3">
                <Link to={`/docteurs/${id}/edit`} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md bg-yellow-50 hover:bg-yellow-100">
                  <FiEdit /> Modifier
                </Link>
                <button onClick={() => alert('Fonction prise de rendez-vous à implémenter')} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md">
                  <FiClock /> Prendre RDV
                </button>
              </div>
            </div>
          </div>

          {/* Middle: main info */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Email • Téléphone</div>
                <div className="mt-2 text-gray-700">{doctor.email}{doctor.phone ? ` • ${doctor.phone}` : ""}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Statut</div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${doctor.status === "Disponible" ? "bg-green-100 text-green-800" :
                    doctor.status === "Absent" ? "bg-red-100 text-red-800" :
                    doctor.status === "En congé" ? "bg-amber-100 text-amber-800" :
                    "bg-gray-100 text-gray-800"}`}>
                    {doctor.status}
                  </span>
                </div>

                {absenceInfo && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="font-medium">{absenceInfo.label} :</div>
                    <div>{formatDate(absenceInfo.item.from)} → {formatDate(absenceInfo.item.to)}</div>
                    {absenceInfo.item.reason && <div className="text-sm text-gray-500 mt-1">Cause : {absenceInfo.item.reason}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FiClock /> Horaires hebdomadaires
              </h3>

              <div className="grid grid-cols-7 gap-2 text-sm">
                {/* Header days */}
                {DAYS.map((d) => (
                  <div key={d} className="text-center font-medium text-gray-600">{d.slice(0,3)}</div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
                {doctor.schedule.map((d, i) => (
                  <div key={d.day} className="text-center p-2 rounded-md border bg-gray-50 min-h-[56px]">
                    {(!d.slots || d.slots.length === 0) ? (
                      <div className="text-xs text-gray-400">—</div>
                    ) : (
                      d.slots.map((s, j) => (
                        <div key={j} className="text-xs text-gray-700">
                          {s.start} — {s.end}
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">À propos</h3>
              <div className="text-gray-700">{doctor.notes || "Aucune biographie disponible."}</div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Congés / Absences</h3>
              {(!doctor.absences || doctor.absences.length === 0) ? (
                <div className="text-gray-500">Aucun congé renseigné.</div>
              ) : (
                <div className="space-y-2">
                  {doctor.absences.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <div className="text-sm font-medium">{formatDate(ex.from)} → {formatDate(ex.to)}</div>
                        {ex.reason && <div className="text-sm text-gray-600">Cause: {ex.reason}</div>}
                      </div>
                      <div>
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded">Indisponible</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer small */}
        <div className="border-t px-6 py-3 text-sm text-gray-500 flex items-center justify-between">
          <div>Dernière mise à jour : {doctor.updatedAt ? new Date(doctor.updatedAt).toLocaleString() : "—"}</div>
          <div>Profil ID: <span className="font-mono text-xs text-gray-700">{doctor._id}</span></div>
        </div>
      </div>
    </div>
  );
}