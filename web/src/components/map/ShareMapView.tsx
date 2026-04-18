import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Monument {
  id: string
  name: string
  coordinates: { latitude: number; longitude: number }
}

interface Props {
  coordinates: { latitude: number; longitude: number }
  name: string
  allMonuments?: Monument[]
  travelMode?: string
}

const MODE_COLORS: Record<string, string> = {
  'foot-walking': '#4A90D9',
  'driving-car': '#E8341C',
  'cycling-regular': '#3DAE6E',
}

export default function ShareMapView({ coordinates, name, allMonuments, travelMode }: Props) {
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

    if (allMonuments && allMonuments.length > 1) {
      // Route mode — numbered markers for each stop
      allMonuments.forEach((m, i) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:#4A90D9;color:white;
            width:28px;height:28px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3)
          ">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
        L.marker([m.coordinates.latitude, m.coordinates.longitude], { icon })
          .addTo(map)
          .bindPopup(`<strong>${i + 1}. ${m.name}</strong>`)
      })

      // Fit map to show all markers
      const bounds = L.latLngBounds(
        allMonuments.map((m) => [m.coordinates.latitude, m.coordinates.longitude])
      )
      map.fitBounds(bounds, { padding: [40, 40] })
    } else {
      // Single monument mode — original behaviour
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
    }

    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [coordinates, name, allMonuments, travelMode])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}