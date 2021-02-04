import { bind } from "@react-rxjs/core"
import { Observable } from "rxjs"
import { map, pluck } from "rxjs/operators"
import { recordEntries } from "../utils/record-utils"
import { PartyId } from "./parties"
import { Provinces } from "./provinces"

export interface Votes {
  nil: number
  white: number
  parties: Record<PartyId, number>
}

export const votesByProvince$ = new Observable<Record<Provinces, Votes>>()

const mergeVotes = (votes: Votes[]) =>
  votes.reduce(
    (acc, current) => {
      acc.nil += current.nil
      acc.white += current.white
      recordEntries(current.parties).forEach(([party, votes]) => {
        acc.parties[party] = (acc.parties[party] || 0) + votes
      })
      return acc
    },
    { nil: 0, white: 0, parties: {} } as Votes,
  )

export const [useCatVotes] = bind(
  votesByProvince$.pipe(map((votes) => mergeVotes(Object.values(votes)))),
)

export const [
  useProvinceVotes,
  getProvinceVotes$,
] = bind((province: Provinces) => votesByProvince$.pipe(pluck(province)))
