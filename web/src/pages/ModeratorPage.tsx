import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  getPendingContributions,
  updateContributionStatus,
  getPendingMonumentSubmissions,
  updateMonumentSubmissionStatus,
  getMonumentPhotos,
} from "../services/contributionsService"
import { getMonumentById } from "../services/monumentsService"
import type { Contribution, ContributionStatus } from "../types/Contribution"
import type { Monuments } from "../types/Monuments"
import type { Photo } from "../types/Photo"

type Tab = "contributions" | "monuments"

export default function ModeratorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("contributions")

  // ── Contributions tab state ──────────────────────────────────────────────
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [contribLoading, setContribLoading] = useState(true)
  const [contribError, setContribError] = useState<string | null>(null)
  const [monumentNames, setMonumentNames] = useState<Map<string, string>>(new Map())
  const [contribProcessingId, setContribProcessingId] = useState<string | null>(null)
  const [contribActionError, setContribActionError] = useState<string | null>(null)

  // ── New Entries tab state ────────────────────────────────────────────────
  const [pendingMonuments, setPendingMonuments] = useState<Monuments[]>([])
  const [monumentsLoading, setMonumentsLoading] = useState(true)
  const [monumentsError, setMonumentsError] = useState<string | null>(null)
  const [monumentPhotos, setMonumentPhotos] = useState<Map<string, Photo[]>>(new Map())
  const [monumentProcessingId, setMonumentProcessingId] = useState<string | null>(null)
  const [monumentActionError, setMonumentActionError] = useState<string | null>(null)

  useEffect(() => {
    // Load contributions tab
    setContribLoading(true)
    getPendingContributions()
      .then(async (data) => {
        setContributions(data)
        const uniqueIds = [...new Set(data.map((c) => c.monument_id))]
        const entries = await Promise.all(
          uniqueIds.map(async (id) => {
            const m = await getMonumentById(id)
            return [id, m?.name ?? id] as [string, string]
          })
        )
        setMonumentNames(new Map(entries))
      })
      .catch(() => setContribError("Failed to load contributions. Refresh to try again."))
      .finally(() => setContribLoading(false))

    // Load new entries tab
    setMonumentsLoading(true)
    getPendingMonumentSubmissions()
      .then(async (data) => {
        setPendingMonuments(data)
        const photoEntries = await Promise.all(
          data.map(async (m) => {
            const photos = await getMonumentPhotos(m.id)
            return [m.id, photos] as [string, Photo[]]
          })
        )
        setMonumentPhotos(new Map(photoEntries))
      })
      .catch(() => setMonumentsError("Failed to load new entries. Refresh to try again."))
      .finally(() => setMonumentsLoading(false))
  }, [])

  async function handleContribDecision(contribution: Contribution, status: ContributionStatus) {
    if (contribProcessingId) return
    setContribActionError(null)
    setContributions((prev) => prev.filter((c) => c.id !== contribution.id))
    setContribProcessingId(contribution.id)
    try {
      await updateContributionStatus(contribution.monument_id, contribution.id, status)
    } catch {
      setContributions((prev) => [contribution, ...prev])
      setContribActionError("Action failed. Please try again.")
    } finally {
      setContribProcessingId(null)
    }
  }

  async function handleMonumentDecision(monument: Monuments, status: "approved" | "rejected") {
    if (monumentProcessingId) return
    setMonumentActionError(null)
    setPendingMonuments((prev) => prev.filter((m) => m.id !== monument.id))
    setMonumentProcessingId(monument.id)
    try {
      await updateMonumentSubmissionStatus(monument.id, status)
    } catch {
      setPendingMonuments((prev) => [monument, ...prev])
      setMonumentActionError("Action failed. Please try again.")
    } finally {
      setMonumentProcessingId(null)
    }
  }

  const tabBtn = (tab: Tab) =>
    `text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
      activeTab === tab
        ? "bg-accent-bordeaux text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`

  return (
    <div className="min-h-screen bg-bg-seashell p-6 md:p-10">
      <div className="w-full max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
          <Link to="/dashboard" className="text-sm text-accent-bordeaux hover:underline">
            ← Dashboard
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Review pending contributions and new monument submissions.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          <button className={tabBtn("contributions")} onClick={() => setActiveTab("contributions")}>
            Contributions
          </button>
          <button className={tabBtn("monuments")} onClick={() => setActiveTab("monuments")}>
            New Entries
          </button>
        </div>

        {/* ── Contributions tab ─────────────────────────────────────────── */}
        {activeTab === "contributions" && (
          <>
            {contribActionError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {contribActionError}
              </p>
            )}
            {contribLoading && <p className="text-sm text-gray-400">Loading…</p>}
            {contribError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {contribError}
              </p>
            )}
            {!contribLoading && !contribError && contributions.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <p className="text-gray-500 text-sm font-medium">No pending contributions.</p>
                <p className="text-gray-400 text-xs mt-1">All submissions have been reviewed.</p>
              </div>
            )}
            {contributions.map((c) => (
              <div key={c.id} className="bg-white rounded-xl p-5 mb-3 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <Link
                      to={`/monument/${c.monument_id}`}
                      className="text-xs font-semibold text-accent-bordeaux hover:underline uppercase tracking-wide"
                    >
                      {monumentNames.get(c.monument_id) ?? c.monument_id}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>By {c.author_uid.slice(0, 8)}…</span>
                      <span>·</span>
                      <span>{c.submitted_at?.toDate().toLocaleDateString() ?? "Just now"}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs bg-bg-seashell text-accent-brown px-3 py-1 rounded-full">
                    pending
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                  {c.information}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleContribDecision(c, "rejected")}
                    disabled={contribProcessingId === c.id}
                    className="text-sm px-4 py-1.5 rounded-lg border border-red-200 text-red-600
                               hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleContribDecision(c, "approved")}
                    disabled={contribProcessingId === c.id}
                    className="text-sm px-4 py-1.5 rounded-lg bg-accent-bordeaux text-white
                               hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── New Entries tab ───────────────────────────────────────────── */}
        {activeTab === "monuments" && (
          <>
            {monumentActionError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {monumentActionError}
              </p>
            )}
            {monumentsLoading && <p className="text-sm text-gray-400">Loading…</p>}
            {monumentsError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {monumentsError}
              </p>
            )}
            {!monumentsLoading && !monumentsError && pendingMonuments.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <p className="text-gray-500 text-sm font-medium">No pending monument submissions.</p>
                <p className="text-gray-400 text-xs mt-1">All entries have been reviewed.</p>
              </div>
            )}
            {pendingMonuments.map((m) => {
              const photos = monumentPhotos.get(m.id) ?? []
              return (
                <div key={m.id} className="bg-white rounded-xl p-5 mb-3 shadow-sm">
                  {/* Photo thumbnail */}
                  {photos[0] && (
                    <img
                      src={photos[0].image_url}
                      alt={m.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-base font-semibold text-gray-900">{m.name}</p>
                    <span className="flex-shrink-0 text-xs bg-bg-seashell text-accent-brown px-3 py-1 rounded-full">
                      pending
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {m.architect && (
                      <span className="text-xs bg-bg-seashell text-accent-brown px-2.5 py-0.5 rounded-full">
                        {m.architect}
                      </span>
                    )}
                    {m.period && (
                      <span className="text-xs bg-bg-seashell text-accent-brown px-2.5 py-0.5 rounded-full">
                        {m.period}
                      </span>
                    )}
                    {m.style && (
                      <span className="text-xs bg-bg-seashell text-accent-brown px-2.5 py-0.5 rounded-full">
                        {m.style}
                      </span>
                    )}
                    {m.location && (
                      <span className="text-xs text-gray-400">{m.location}</span>
                    )}
                  </div>

                  {m.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">
                      {m.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mb-4">
                    By {m.author_uid?.slice(0, 8) ?? "unknown"}…
                    {photos.length > 1 && ` · ${photos.length} photos`}
                  </p>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleMonumentDecision(m, "rejected")}
                      disabled={monumentProcessingId === m.id}
                      className="text-sm px-4 py-1.5 rounded-lg border border-red-200 text-red-600
                                 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleMonumentDecision(m, "approved")}
                      disabled={monumentProcessingId === m.id}
                      className="text-sm px-4 py-1.5 rounded-lg bg-accent-bordeaux text-white
                                 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

      </div>
    </div>
  )
}
