import { map } from "rxjs/operators"
import { mapRecord, recordEntries } from "utils/record-utils"
import { Party, PartyId } from "api/parties"
import { Provinces, sitsByProvince } from "api/provinces"
import { Votes, votes$ } from "api/votes"
import { dhondt } from "utils/dhondt"
import { shareLatest } from "@react-rxjs/core"
import { add } from "utils/add"

export interface PartyResults {
  party: Party
  votes: number
  percent: number
  sits: number
}

export interface Results extends Omit<Votes, "parties"> {
  parties: Record<PartyId, PartyResults>
}

const getProvinceResults = (votes: Votes, province: Provinces): Results => {
  const validVotes = votes.white + votes.partyVotes

  const nSits = sitsByProvince[province]
  const threshold = Math.round(validVotes * 0.03)

  const parties = mapRecord(votes.parties, (x) => ({ ...x, sits: 0 }))
  dhondt(parties, nSits, threshold).forEach(([party]) => {
    parties[party as PartyId].sits++
  })

  return {
    ...votes,
    parties,
  }
}

export const mergeResults = (results: Record<Provinces, Results>) => {
  const result = Object.values(results).reduce(
    (acc, current) => {
      acc.nil += current.nil
      acc.white += current.white
      recordEntries(current.parties).forEach(
        ([partyId, { party, votes, sits }]) => {
          if (!acc.parties[partyId]) {
            acc.parties[partyId] = { party, votes, sits, percent: 0 }
          } else {
            acc.parties[partyId].sits += sits
            acc.parties[partyId].votes += votes
          }
        },
      )
      return acc
    },
    { nil: 0, white: 0, parties: {} } as Results,
  )

  const validVotes =
    result.white +
    Object.values(result.parties)
      .map((party) => party.votes)
      .reduce(add)

  Object.values(result.parties).forEach((party) => {
    party.percent = party.votes / validVotes
  })

  return result
}

const results$ = votes$.pipe(
  map((votes) => mapRecord(votes, getProvinceResults)),
  shareLatest(),
)
results$.subscribe()

const catResults$ = results$.pipe(map(mergeResults), shareLatest())
catResults$.subscribe()

export const getResultsByProvince = (province: Provinces | null) =>
  province ? results$.pipe(map((res) => res[province])) : catResults$
