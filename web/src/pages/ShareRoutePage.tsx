import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import ShareMapView from '../components/map/ShareMapView'

export default function ShareRoutePage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [monuments, setMonuments] = useState<any[]>([])
  const [travelMode, setTravelMode] = useState<string>('foot-walking')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!shareId) return
    ;(async () => {
      try {
        const shareSnap = await getDoc(doc(db, 'shares_route', shareId))
        if (!shareSnap.exists()) { setError('Route not found.'); return }
        const { monumentIds, travelMode: mode } = shareSnap.data()
        setTravelMode(mode)

        const monumentDocs = await Promise.all(
          monumentIds.map((id: string) => getDoc(doc(db, 'monuments', id)))
        )
        const loaded = monumentDocs
          .filter((d) => d.exists())
          .map((d) => ({ id: d.id, ...d.data() }))
        setMonuments(loaded)
      } catch {
        setError('Failed to load route.')
      } finally {
        setLoading(false)
      }
    })()
  }, [shareId])

  if (loading) return <div style={center}>Loading…</div>
  if (error)   return <div style={center}>{error}</div>
  if (!monuments.length) return null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={panel}>
        <h1 style={title}>{monuments.map((m) => m.name).join(' → ')}</h1>
        <span style={badge}>
          {travelMode === 'foot-walking' ? '🚶 Walking'
            : travelMode === 'driving-car' ? '🚗 Driving'
            : '🚴 Cycling'}
          · {monuments.length} stops
        </span>
        <div style={stopList}>
          {monuments.map((m, i) => (
            <div key={m.id} style={stopItem}>
              <span style={stopNum}>{i + 1}</span>
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ShareMapView
          coordinates={monuments[0].coordinates}
          name={monuments[0].name}
          allMonuments={monuments}
          travelMode={travelMode}
        />
      </div>
    </div>
  )
}

const center: React.CSSProperties = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const panel: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #eee', maxHeight: '40vh', overflowY: 'auto' }
const title: React.CSSProperties = { margin: '0 0 8px', fontSize: 20, fontWeight: 700 }
const badge: React.CSSProperties = { background: '#FFF0E6', color: '#6E3606', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }
const stopList: React.CSSProperties = { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }
const stopItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }
const stopNum: React.CSSProperties = { background: '#4A90D9', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }