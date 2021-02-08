import { PartyId } from "api/parties"
import { useEditingParty } from "../state"
import { Lock } from "./Lock"
import { Result, result$ } from "./Result"
import { Edit } from "./Edit"
import { Form } from "./Form"
import { Subscribe } from "@react-rxjs/core"

export const ResultRow: React.FC<{ partyId: PartyId }> = ({ partyId }) => {
  const isEditing = useEditingParty() === partyId
  return (
    <Subscribe source$={result$(partyId)}>
      <li className="flex flex-wrap items-center">
        <Result partyId={partyId} />
        <Edit partyId={partyId} isEditing={isEditing} />
        <Lock partyId={partyId} />
        {isEditing ? <Form /> : null}
      </li>
    </Subscribe>
  )
}
