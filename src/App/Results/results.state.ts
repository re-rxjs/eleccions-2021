import { map, pluck, shareReplay } from "rxjs/operators"
import { recordEntries, recordFromEntries } from "utils/record-utils"
import { getParties, Party, PartyId } from "api/parties"
import { Provinces, sitsByProvince } from "api/provinces"
import { Votes, votes$ } from "api/votes"
import { dhondt } from "utils/dhondt"
import { bind } from "@react-rxjs/core"

export interface PartyResults {
  party: Party
  votes: number
  percent: number
  sits: number
}

export interface Results extends Omit<Votes, "parties"> {
  parties: Record<PartyId, PartyResults>
}

const add = (a: number, b: number) => a + b

const getProvinceResults = (votes: Votes, province: Provinces): Results => {
  console.log(province, votes.white)
  const validVotes = votes.white + Object.values(votes.parties).reduce(add)
  const parties: Record<string, PartyResults> = {}
  const partiesData = getParties()
  recordEntries(votes.parties).forEach(([party, votes]) => {
    parties[party] = {
      party: partiesData[party],
      votes,
      percent: Math.round((votes / validVotes) * 10000) / 100,
      sits: 0,
    }
  })

  const nSits = sitsByProvince[province]
  const threshold = Math.round(validVotes * 0.03)
  dhondt(votes.parties, nSits, threshold).forEach(([party]) => {
    parties[party].sits++
  })

  return {
    ...votes,
    parties,
  }
}

const results$ = votes$.pipe(
  map((votes) =>
    recordFromEntries(
      Object.values(Provinces).map((province) => [
        province,
        getProvinceResults(votes[province], province),
      ]),
    ),
  ),
  shareReplay(1),
)

const mergeResults = (results: Record<Provinces, Results>) => {
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
    party.percent = Math.round((party.votes / validVotes) * 10000) / 100
  })

  return result
}

const catResults$ = results$.pipe(map(mergeResults), shareReplay(1))

export const [useResults, getResults$] = bind((province?: Provinces) =>
  province ? results$.pipe(pluck(province)) : catResults$,
)
