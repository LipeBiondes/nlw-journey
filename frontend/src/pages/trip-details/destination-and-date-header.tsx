import { MapPin, Calendar, Settings2 } from 'lucide-react'
import { Button } from '../components/button'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../lib/axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TripProps {
  id: string
  destination: string
  starts_at: string
  ends_at: string
  is_confirmed: boolean
}

export function DestinationAndDateHeader() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState<TripProps | undefined>({
    id: 'Carregando...',
    destination: 'Carregando...',
    starts_at: '2024-01-01T00:00:00Z',
    ends_at: '2024-01-01T00:00:00Z',
    is_confirmed: false
  })

  useEffect(() => {
    api.get(`/trips/${tripId}`).then(response => {
      setTrip(response.data.trip)
    })
  }, [tripId])

  const displaydDate = trip
    ? format(trip.starts_at, "d' de 'LLL", { locale: ptBR })
        .concat(' até ')
        .concat(format(trip.ends_at, "d' de 'LLL", { locale: ptBR }))
    : 'Carregando...'

  return (
    <div className="px-4 h-16 rounded-xl bg-zinc-900 shadow-shape flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-zinc-400" />
        <span className="text-zinc-100">{trip?.destination}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-zinc-400" />
          <span className="text-zinc-100">{displaydDate}</span>
        </div>
        <div className="w-px h-6 bg-zinc-800" />
        <Button variant="secondary">
          Alterar local/data
          <Settings2 className="size-5" />
        </Button>
      </div>
    </div>
  )
}
