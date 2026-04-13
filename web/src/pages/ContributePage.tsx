import { useState, useRef, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { getMonumentById } from "../services/monumentsService"
import { submitContribution, uploadMonumentPhoto } from "../services/contributionsService"
import type { Monuments } from "../types/Monuments"

const MAX_FILE_SIZE_MB = 10

export default function ContributePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [monument, setMonument] = useState<Monuments | null>(null)
  const [loadingMonument, setLoadingMonument] = useState(true)

  // Text contribution state
  const [information, setInformation] = useState("")
  const [submittingText, setSubmittingText] = useState(false)
  const [textSuccess, setTextSuccess] = useState(false)
  const [textError, setTextError] = useState<string | null>(null)

  // Photo upload state
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photoSuccess, setPhotoSuccess] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    getMonumentById(id)
      .then(setMonument)
      .finally(() => setLoadingMonument(false))
  }, [id])

  async function handleSubmitText() {
    if (!user || !id || !information.trim()) return
    setSubmittingText(true)
    setTextError(null)
    setTextSuccess(false)
    try {
      await submitContribution(id, user.uid, information.trim())
      setTextSuccess(true)
      setInformation("")
    } catch {
      setTextError("Failed to submit. Please try again.")
    } finally {
      setSubmittingText(false)
    }
  }

  async function handleUploadPhotos() {
    if (!user || !id || !files || files.length === 0) return
    setPhotoError(null)
    setPhotoSuccess(false)

    // Client-side size guard
    const oversized = Array.from(files).find(
      (f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024
    )
    if (oversized) {
      setPhotoError(`"${oversized.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`)
      return
    }

    setUploadingPhotos(true)
    try {
      await Promise.all(
        Array.from(files).map((f) => uploadMonumentPhoto(id, user.uid, f))
      )
      setPhotoSuccess(true)
      setFiles(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      setPhotoError("Upload failed. Check your connection and try again.")
    } finally {
      setUploadingPhotos(false)
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-bordeaux"
  const errorClass =
    "text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2"
  const successClass =
    "text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2"
  const primaryBtn =
    "bg-accent-bordeaux text-white rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"

  return (
    <div className="min-h-screen bg-bg-seashell p-6 md:p-10">
      <div className="w-full max-w-lg mx-auto">

        <Link
          to={id ? `/monument/${id}` : "/"}
          className="inline-flex items-center gap-1 text-sm text-accent-bordeaux hover:underline mb-6"
        >
          ← Back to monument
        </Link>

        {loadingMonument ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Contribute to:{" "}
              <span className="text-accent-bordeaux">{monument?.name ?? "Monument"}</span>
            </h1>
            {monument?.location && (
              <p className="text-sm text-gray-500 mb-6">{monument.location}</p>
            )}
          </>
        )}

        {/* Section 1: Historical information */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Add historical information
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Share historical details, architect notes, construction context, or other verified facts.
            Your submission will be reviewed by a moderator before being published.
          </p>
          <textarea
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            rows={6}
            placeholder="e.g. Designed by Józef Plośko in 1912, this building originally served as…"
            className={inputClass}
          />
          {textError && <p className={errorClass}>{textError}</p>}
          {textSuccess && (
            <p className={successClass}>Submitted — awaiting moderator review.</p>
          )}
          <button
            onClick={handleSubmitText}
            disabled={submittingText || !information.trim()}
            className={`mt-3 ${primaryBtn}`}
          >
            {submittingText ? "Submitting…" : "Submit contribution"}
          </button>
        </section>

        {/* Section 2: Photo upload */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Upload photos</h2>
          <p className="text-xs text-gray-400 mb-3">
            Upload historical or current photographs. Max {MAX_FILE_SIZE_MB} MB per file.
          </p>
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
          {photoError && <p className={errorClass}>{photoError}</p>}
          {photoSuccess && (
            <p className={successClass}>Photos uploaded successfully.</p>
          )}
          <button
            onClick={handleUploadPhotos}
            disabled={uploadingPhotos || !files?.length}
            className={`mt-3 ${primaryBtn}`}
          >
            {uploadingPhotos
              ? "Uploading…"
              : `Upload ${files?.length ?? 0} photo${files?.length === 1 ? "" : "s"}`}
          </button>
        </section>

      </div>
    </div>
  )
}
