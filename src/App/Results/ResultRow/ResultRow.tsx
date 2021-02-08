import { lazy, Suspense } from "react"
import { Subscribe } from "@react-rxjs/core"
import { PartyId } from "api/parties"
import { useEditingParty } from "../state"
import { Lock } from "./Lock"
import { Result, result$ } from "./Result"
import { Edit } from "./Edit"
const Form = lazy(() => import("./Form"))

export const ResultRow: React.FC<{ partyId: PartyId }> = ({ partyId }) => {
  const isEditing = useEditingParty() === partyId
  let editingStyles = isEditing
    ? " border-gray-400 border-t-2 border-b-2 pb-4 bg-gray-100"
    : ""
  return (
    <Subscribe source$={result$(partyId)}>
      <li className={"flex flex-wrap items-center py-3" + editingStyles}>
        <Result partyId={partyId} />
        <Edit partyId={partyId} isEditing={isEditing} />
        <Lock partyId={partyId} />
        <Suspense fallback={null}>
          <Form partyId={partyId} />
        </Suspense>
      </li>
    </Subscribe>
  )
}
