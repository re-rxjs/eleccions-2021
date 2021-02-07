import { shareLatest } from "@react-rxjs/core"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { mapRecord } from "utils/record-utils"
import { Party, PartyId, getParties } from "./parties"
import { Provinces } from "./provinces"
import { result$ } from "./results"

export interface Votes {
  nil: number
  white: number
  partyVotes: number
  parties: Record<PartyId, { party: Party; votes: number; percent: number }>
}

export const votes$: Observable<Record<Provinces, Votes>> = result$.pipe(
  map(
    ({ detail, summary }) =>
      mapRecord(detail, (resultsByParty, province) => {
        let partyVotes: number = 0
        const partiesData = getParties()
        const parties = mapRecord(resultsByParty, (result, partyId) => {
          const votes = Number(result.Vots)
          partyVotes += votes
          return {
            party: partiesData[partyId],
            votes,
            percent: 0,
          }
        })

        const white = Number(summary[province].VotsBlancs)
        const validVotes = white + partyVotes
        Object.values(parties).forEach((v) => {
          v.percent = v.votes / validVotes
        })
        return {
          nil: Number(summary[province].VotsNuls),
          white,
          partyVotes,
          parties,
        }
      }),
    shareLatest(),
  ),
)
