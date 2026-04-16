import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Props {
  coordinates: { latitude: number; longitude: number }
  name: string
}

export default function ShareMapView({ coordinates, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

    const map = L.map(containerRef.current).setView(
      [coordinates.latitude, coordinates.longitude], 16
    )
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        background:#6E3606;color:white;
        width:32px;height:32px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3)
      ">●</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    L.marker([coordinates.latitude, coordinates.longitude], { icon })
      .addTo(map)
      .bindPopup(`<strong>${name}</strong>`)
      .openPopup()

    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [coordinates, name])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}