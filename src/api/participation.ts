import { bind, shareLatest } from "@react-rxjs/core"
import { Observable } from "rxjs"
import { map, pluck } from "rxjs/operators"
import { recordEntries, recordFromEntries } from "utils/record-utils"
import { Provinces } from "./provinces"
import { result$ } from "./results"

export interface Participation {
  nVoters: number
  nNonVoters: number
}

export const participation$: Observable<
  Record<Provinces, Participation>
> = result$.pipe(
  map(({ summary }) =>
    recordFromEntries(
      recordEntries(summary).map(([province, result]): [
        Provinces,
        Participation,
      ] => [
        province,
        {
          nVoters: Number(result.Participacio) * 1.5, // TODO: remove this is for testing
          nNonVoters: Number(result.Abstencio) + Number(result.Participacio),
        },
      ]),
    ),
  ),
  shareLatest()
)

export const [useParticipation, getParticipation$] = bind(
  (province?: Provinces) =>
    participation$.pipe(
      province
        ? pluck(province)
        : map((data) =>
            Object.values(data).reduce(
              (acc, current) => {
                acc.nNonVoters += current.nNonVoters
                acc.nVoters += current.nVoters
                return acc
              },
              { nVoters: 0, nNonVoters: 0 },
            ),
          ),
    ),
)
