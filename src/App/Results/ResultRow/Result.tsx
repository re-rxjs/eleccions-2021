import { PartyId } from "api/parties"
import { PartyResult } from "../PartyResult"
import { usePartyResult, getPartyResult$ } from "../state"

export const result$ = getPartyResult$
export const Result: React.FC<{ partyId: PartyId }> = ({ partyId }) => {
  const result = usePartyResult(partyId)
  return <PartyResult {...result} linkToParty />
}
