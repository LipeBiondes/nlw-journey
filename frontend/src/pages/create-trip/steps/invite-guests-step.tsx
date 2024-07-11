import { ArrowRight, UserRoundPlus } from 'lucide-react'

interface InviteGuestsStepProps {
  openGuestsModal: () => void
  emailToInvite: string[]
  openConfirmTripModal: () => void
}

export function InviteGuestsStep({
  emailToInvite,
  openConfirmTripModal,
  openGuestsModal
}: InviteGuestsStepProps) {
  return (
    <div className="h-16 bg-zinc-900 px-4 rounded-xl flex items-center shadow-shape gap-3">
      <button
        type="button"
        onClick={openGuestsModal}
        className="flex items-center gap-2 flex-1"
      >
        <UserRoundPlus className="size-5 text-zinc-400" />
        {emailToInvite.length > 0 ? (
          <span className="text-zinc-100">
            {emailToInvite.length} pessoa(s) convidada(s)
          </span>
        ) : (
          <span className="text-zinc-400">Convidar amigos</span>
        )}
      </button>

      <button
        onClick={openConfirmTripModal}
        className="bg-lime-300 text-lime-900 rounded-lg px-5 py-2 font-medium flex items-center gap-2 hover:bg-lime-400"
      >
        Confirmar viagem
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}
