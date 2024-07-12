import { CircleCheck, CircleDashed } from 'lucide-react'
import { api } from '../../lib/axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface activityProps {
  date: string
  activities: {
    id: string
    title: string
    occurs_at: string
    trip_id: string
    is_was_done: boolean
  }[]
}

export function Activities() {
  const { tripId } = useParams()
  const [activities, setActivities] = useState<activityProps[]>([])

  useEffect(() => {
    api.get(`/trips/${tripId}/activities`).then(response => {
      setActivities(response.data.activities)
    })
  }, [tripId])

  return (
    <div className="space-y-8">
      {activities.map(category => {
        return (
          <div key={category.date} className="space-y-2.5">
            <div className="flex gap-2 items-baseline">
              <span className="text-xl text-zinc-300 font-semibold">
                Dia {format(category.date, 'd', { locale: ptBR })}
              </span>
              <span className="text-xs text-zinc-500">
                {format(category.date, 'EEEE', { locale: ptBR })}
              </span>
            </div>
            {category.activities.length > 0 ? (
              <div>
                {category.activities.map(activity => {
                  return (
                    <div key={activity.id} className="space-y-2.5">
                      <div className="px-4 py-2.5 mt-3 bg-zinc-900 rounded-xl shadow-shape flex items-center gap-3">
                        {activity.is_was_done ? (
                          <CircleCheck className="size-5 text-lime-300" />
                        ) : (
                          <CircleDashed className="text-zinc-400 size-5 shrink-0" />
                        )}
                        <span className="text-zinc-100">{activity.title}</span>
                        <span className="text-zinc-400 text-sm ml-auto">
                          {format(activity.occurs_at, 'HH:mm', {
                            locale: ptBR
                          })}
                          h
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">
                Nenhuma atividade cadastrada nessa data.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
