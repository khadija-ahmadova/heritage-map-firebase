import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { submitNewMonument } from "../services/contributionsService"

const MAX_FILE_SIZE_MB = 10

export default function SubmitMonumentPage() {
  const { user } = useAuth()

  const [name, setName] = useState("")
  const [architect, setArchitect] = useState("")
  const [location, setLocation] = useState("")
  const [period, setPeriod] = useState("")
  const [style, setStyle] = useState("")
  const [description, setDescription] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return

    const oversized = files
      ? Array.from(files).find((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      : null
    if (oversized) {
      setError(`"${oversized.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`)
      return
    }

    setSubmitting(true)
    const parsedLat = lat ? parseFloat(lat) : undefined
    const parsedLng = lng ? parseFloat(lng) : undefined

    if (
      (lat && isNaN(parsedLat!)) ||
      (lng && isNaN(parsedLng!)) ||
      (lat && (parsedLat! < -90 || parsedLat! > 90)) ||
      (lng && (parsedLng! < -180 || parsedLng! > 180))
    ) {
      setError("Invalid coordinates. Latitude must be −90 to 90, longitude −180 to 180.")
      return
    }

    setError(null)
    try {
      await submitNewMonument(
        {
          name: name.trim(),
          architect: architect.trim(),
          location: location.trim(),
          period: period.trim(),
          style: style.trim(),
          description: description.trim(),
          lat: parsedLat,
          lng: parsedLng,
        },
        user.uid,
        files ? Array.from(files) : undefined
      )
      setSuccess(true)
      setName("")
      setArchitect("")
      setLocation("")
      setPeriod("")
      setStyle("")
      setDescription("")
      setLat("")
      setLng("")
      setFiles(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      setError("Submission failed. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-bordeaux"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="min-h-screen bg-bg-seashell p-6 md:p-10">
      <div className="w-full max-w-lg mx-auto">

        <Link
          to="/my-contributions"
          className="inline-flex items-center gap-1 text-sm text-accent-bordeaux hover:underline mb-6"
        >
          ← My contributions
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit a new monument</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your entry will be reviewed by a moderator before it is published to the map.
        </p>

        {success ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-green-700 font-medium text-sm mb-1">Submitted successfully!</p>
            <p className="text-gray-500 text-sm mb-5">
              Your entry is now pending review by a moderator.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="text-sm px-4 py-2 bg-accent-bordeaux text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Submit another
              </button>
              <Link
                to="/my-contributions"
                className="text-sm px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View my contributions
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">

            <div>
              <label className={labelClass}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Government House"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Architect</label>
              <input
                type="text"
                value={architect}
                onChange={(e) => setArchitect(e.target.value)}
                placeholder="e.g. Józef Plośko"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Location / Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Neftchilar Avenue, Baku"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Latitude <span className="text-xs text-gray-400 font-normal">optional</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 40.4093"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Longitude <span className="text-xs text-gray-400 font-normal">optional</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. 49.8671"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Period / Era</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g. Soviet era"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Style</label>
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="e.g. Stalinist"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Historical background, construction details, current condition…"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Photos <span className="text-xs text-gray-400 font-normal">— optional, max {MAX_FILE_SIZE_MB} MB each</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-bg-seashell file:text-accent-bordeaux
                  hover:file:opacity-80 cursor-pointer"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full bg-accent-bordeaux text-white rounded-lg py-2 text-sm font-medium
                         hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>

          </form>
        )}

      </div>
    </div>
  )
}
