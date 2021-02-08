import { PartyId } from "api/parties"
import { onDoneEditing, onEditParty, useIsEditing } from "../state"

export const Edit: React.FC<{ partyId: PartyId; isEditing: boolean }> = ({
  partyId,
  isEditing,
}) => {
  const isVisible = useIsEditing()
  const onClick = isEditing ? onDoneEditing : () => onEditParty(partyId)

  return (
    <button
      className={`w-6 mx-2 ${isVisible ? "" : "hidden"}`}
      onClick={onClick}
    >
      {isEditing ? <Check /> : <Pencil />}
    </button>
  )
}

const Pencil = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
)

const Check = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
)
