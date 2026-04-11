import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { getMonumentById } from '../services/monumentsService'
import type { Monuments } from '../types/Monuments'
import MonumentPageHeader from '../components/layout/Monumentpageheader'

type ReaderLevel = 'simplified' | 'advanced'

export default function MonumentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [monument, setMonument] = useState<Monuments | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [readerLevel, setReaderLevel] = useState<ReaderLevel>('simplified')
  const [showReaderDropdown, setShowReaderDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!id) return
    getMonumentById(id)
      .then(setMonument)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowReaderDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  function triggerToast() {
    setShowToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setShowToast(false), 3000)
  }

  async function handleSaveToggle() {
    const user = auth.currentUser
    if (!monument) return

    if (!saved) {
      setSaved(true)
      triggerToast()
      if (user) {
        await setDoc(doc(db, 'saved_landmarks', `${user.uid}_${monument.id}`), {
          user_uid: user.uid,
          landmark_id: monument.id,
          save_time: serverTimestamp(),
        })
      }
    } else {
      setSaved(false)
      setShowToast(false)
      if (user) {
        await deleteDoc(doc(db, 'saved_landmarks', `${user.uid}_${monument.id}`))
      }
    }
  }

  if (loading) {
    return (
      <>
        <MonumentPageHeader />
        <div className="min-h-screen bg-bg-seashell flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </>
    )
  }

  if (!monument) {
    return (
      <>
        <MonumentPageHeader />
        <div className="min-h-screen bg-bg-seashell flex items-center justify-center">
          <p className="text-gray-500">Monument not found.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <MonumentPageHeader />

      <div className="min-h-screen bg-bg-seashell">

        {/* Clears the fixed header */}
        <div className="h-16" />

        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* ── Action buttons row ── */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Monument</p>

            <div className="flex items-center gap-2 relative">
              {showToast && (
                <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  Added to &quot;Saved Articles&quot;
                </span>
              )}

              {/* Bookmark */}
              <button
                onClick={handleSaveToggle}
                aria-label={saved ? 'Remove from Saved Articles' : 'Save to Saved Articles'}
                className="p-1.5 rounded-lg hover:bg-white transition-colors"
              >
                {saved ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                    className="w-6 h-6 text-accent-bordeaux">
                    <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="w-6 h-6 text-gray-500">
                    <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
                  </svg>
                )}
              </button>

              {/* Reader level */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowReaderDropdown((v) => !v)}
                  aria-label="Change reader level"
                  className="p-1.5 rounded-lg hover:bg-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                    className="w-6 h-6 text-gray-500">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695z" clipRule="evenodd" />
                  </svg>
                </button>

                {showReaderDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2">
                    <p className="px-4 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Reader Level
                    </p>
                    {(['simplified', 'advanced'] as ReaderLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => { setReaderLevel(level); setShowReaderDropdown(false) }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors
                          ${readerLevel === level
                            ? 'text-accent-bordeaux font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Monument name ── */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
            {monument.name}
          </h1>

          {/* ── Meta pills ── */}
          <div className="flex flex-wrap gap-2 mb-8">
            {monument.period && (
              <span className="text-xs bg-white border border-gray-200 text-accent-brown px-3 py-1 rounded-full">
                {monument.period}
              </span>
            )}
            {monument.architect && (
              <span className="text-xs bg-white border border-gray-200 text-accent-brown px-3 py-1 rounded-full">
                {monument.architect}
              </span>
            )}
            {monument.location && (
              <span className="text-xs bg-white border border-gray-200 text-accent-brown px-3 py-1 rounded-full">
                {monument.location}
              </span>
            )}
            {monument.style && (
              <span className="text-xs bg-white border border-gray-200 text-accent-brown px-3 py-1 rounded-full">
                {monument.style}
              </span>
            )}
          </div>

          {/* ── Images ── */}
          {monument.imageUrl && monument.imageUrl.length > 0 && (
            <div
              className="flex gap-3 overflow-x-auto mb-10 -mx-6 px-6"
              style={{ scrollbarWidth: 'none' }}
            >
              {monument.imageUrl.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${monument.name} ${i + 1}`}
                  className="h-64 w-auto flex-shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {/* ── Article body ── */}
          <div className="bg-white rounded-2xl px-8 py-8">
            {monument.description ? (
              <p className="text-gray-700 text-base leading-relaxed">
                {monument.description}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">No description available.</p>
            )}
          </div>

        </div>
      </div>
    </>
  )
}