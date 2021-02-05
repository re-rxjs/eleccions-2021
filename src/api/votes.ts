import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { recordEntries, recordFromEntries } from "utils/record-utils"
import { PartyId } from "./parties"
import { Provinces } from "./provinces"
import { result$ } from "./results"

export interface Votes {
  nil: number
  white: number
  parties: Record<PartyId, number>
}

const defaultParties = recordFromEntries(
  Object.values(PartyId).map((id) => [id, 0]),
)

export const votes$: Observable<Record<Provinces, Votes>> = result$.pipe(
  map(({ detail, summary }) =>
    recordFromEntries(
      recordEntries(detail).map(([province, resultsByParty]): [
        Provinces,
        Votes,
      ] => [
        province,
        {
          nil: Number(summary[province].VotsNuls),
          white: Number(summary[province].VotsBlancs),
          parties: {
            ...defaultParties,
            ...recordFromEntries(
              recordEntries(resultsByParty).map(([party, result]) => [
                party,
                Number(result.Vots),
              ]),
            ),
          },
        },
      ]),
    ),
  ),
)
