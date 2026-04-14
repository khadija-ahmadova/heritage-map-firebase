import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import ShareMapView from '../components/map/ShareMapView'

export default function SharePage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [monument, setMonument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!shareId) return
    ;(async () => {
      try {
        const shareSnap = await getDoc(doc(db, 'shares', shareId))
        if (!shareSnap.exists()) { setError('Link not found.'); return }
        const { monumentId } = shareSnap.data()

        const monumentSnap = await getDoc(doc(db, 'monuments', monumentId))
        if (!monumentSnap.exists()) { setError('Monument not found.'); return }
        setMonument({ id: monumentSnap.id, ...monumentSnap.data() })
      } catch {
        setError('Failed to load.')
      } finally {
        setLoading(false)
      }
    })()
  }, [shareId])

  if (loading) return <div style={center}>Loading…</div>
  if (error)   return <div style={center}>{error}</div>
  if (!monument) return null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={panel}>
        <h1 style={title}>{monument.name}</h1>
        {monument.period    && <p style={meta}>{monument.period}</p>}
        {monument.architect && <p style={meta}>Architect: {monument.architect}</p>}
        {monument.location  && <p style={meta}>📍 {monument.location}</p>}
        {monument.description && <p style={desc}>{monument.description}</p>}
      </div>
      <div style={{ flex: 1 }}>
        <ShareMapView coordinates={monument.coordinates} name={monument.name} />
      </div>
    </div>
  )
}

const center: React.CSSProperties = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const panel: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #eee', maxHeight: '40vh', overflowY: 'auto' }
const title: React.CSSProperties = { margin: '0 0 8px', fontSize: 22, fontWeight: 700 }
const meta:  React.CSSProperties = { margin: '2px 0', fontSize: 13, color: '#888' }
const desc:  React.CSSProperties = { margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, color: '#333' }