import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { getMonumentById } from '../services/monumentsService'
import type { Monuments } from '../types/Monuments'

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowReaderDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clean up toast timer on unmount
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
      <div className="min-h-screen bg-bg-seashell flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (!monument) {
    return (
      <div className="min-h-screen bg-bg-seashell flex items-center justify-center">
        <p className="text-gray-500">Monument not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-seashell flex items-start justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* Header row — name + action buttons */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight pr-4">
            {monument.name}
          </h1>

          <div className="flex items-center gap-2 flex-shrink-0 relative">
            {/* Toast notification */}
            {showToast && (
              <span className="absolute right-full mr-2 whitespace-nowrap bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                Added to &quot;Want to visit&quot; list
              </span>
            )}

            {/* Bookmark / save button */}
            <button
              onClick={handleSaveToggle}
              aria-label={saved ? 'Remove from Want to Visit' : 'Save to Want to Visit'}
              className="p-1 transition-colors"
            >
              {saved ? (
                // Filled bookmark
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  className="w-7 h-7 text-accent-bordeaux">
                  <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
                </svg>
              ) : (
                // Outlined bookmark
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-7 h-7 text-gray-700">
                  <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
                </svg>
              )}
            </button>

            {/* Reader level button + dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowReaderDropdown((v) => !v)}
                aria-label="Change reader level"
                className="p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  className="w-7 h-7 text-gray-700">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695z" clipRule="evenodd" />
                </svg>
              </button>

              {showReaderDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2">
                  <p className="px-4 pt-1 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Reader Level
                  </p>
                  {(['simplified', 'advanced'] as ReaderLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => { setReaderLevel(level); setShowReaderDropdown(false) }}
                      className={`w-full text-left px-4 py-2 text-sm capitalize transition-colors
                        ${readerLevel === level
                          ? 'text-accent-bordeaux font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
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

        {/* Photo */}
        <div className="w-full h-52 bg-gray-200 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No photo available</span>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5">
          {monument.description ? (
            <p className="text-gray-700 text-sm leading-relaxed">{monument.description}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">No description available.</p>
          )}
        </div>

        {/* Meta — period, architect, location */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {monument.period && (
            <span className="text-xs bg-bg-seashell text-accent-brown px-3 py-1 rounded-full">
              {monument.period}
            </span>
          )}
          {monument.architect && (
            <span className="text-xs bg-bg-seashell text-accent-brown px-3 py-1 rounded-full">
              {monument.architect}
            </span>
          )}
          {monument.location && (
            <span className="text-xs bg-bg-seashell text-accent-brown px-3 py-1 rounded-full">
              {monument.location}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
