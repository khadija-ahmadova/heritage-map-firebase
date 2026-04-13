import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { getMyMonumentSubmissions, getMyTextContributions } from "../services/contributionsService"
import { getMonumentById } from "../services/monumentsService"
import type { Monuments } from "../types/Monuments"
import type { Contribution } from "../types/Contribution"

type StatusKey = "pending" | "approved" | "rejected"

const statusBadge: Record<StatusKey, string> = {
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
}

function StatusBadge({ status }: { status: string }) {
  const cls = statusBadge[status as StatusKey] ?? "bg-gray-50 text-gray-500 border border-gray-200"
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default function MyContributionsPage() {
  const { user } = useAuth()

  const [submissions, setSubmissions] = useState<Monuments[]>([])
  const [textContribs, setTextContribs] = useState<Contribution[]>([])
  const [monumentNames, setMonumentNames] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    Promise.all([
      getMyMonumentSubmissions(user.uid),
      getMyTextContributions(user.uid),
    ])
      .then(async ([subs, contribs]) => {
        setSubmissions(subs)
        setTextContribs(contribs)

        // Batch-fetch monument names for text contributions
        const uniqueIds = [...new Set(contribs.map((c) => c.monument_id))]
        const entries = await Promise.all(
          uniqueIds.map(async (id) => {
            const m = await getMonumentById(id)
            return [id, m?.name ?? id] as [string, string]
          })
        )
        setMonumentNames(new Map(entries))
      })
      .catch(() => setError("Failed to load your contributions. Please refresh."))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen bg-bg-seashell p-6 md:p-10">
      <div className="w-full max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">My Contributions</h1>
          <Link
            to="/submit-monument"
            className="text-sm bg-accent-bordeaux text-white px-4 py-2 rounded-lg
                       hover:opacity-90 transition-opacity"
          >
            + Submit entry
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Track the status of your monument submissions and text contributions.
        </p>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Section A — Monument submissions */}
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Monument submissions
              </h2>

              {submissions.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-gray-400">No monument submissions yet.</p>
                  <Link
                    to="/submit-monument"
                    className="text-sm text-accent-bordeaux hover:underline mt-1 inline-block"
                  >
                    Submit your first entry →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {m.submission_status === "approved" ? (
                            <Link
                              to={`/monument/${m.id}`}
                              className="text-sm font-semibold text-accent-bordeaux hover:underline"
                            >
                              {m.name}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1.5">
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
                        </div>
                        <StatusBadge status={m.submission_status ?? "pending"} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section B — Text contributions */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Text contributions
              </h2>

              {textContribs.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-gray-400">No text contributions yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Visit any monument page to add historical information.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {textContribs.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <Link
                          to={`/monument/${c.monument_id}`}
                          className="text-xs font-semibold text-accent-bordeaux hover:underline uppercase tracking-wide"
                        >
                          {monumentNames.get(c.monument_id) ?? c.monument_id}
                        </Link>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {c.information.length > 120
                          ? c.information.slice(0, 120) + "…"
                          : c.information}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {c.submitted_at?.toDate().toLocaleDateString() ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  )
}
