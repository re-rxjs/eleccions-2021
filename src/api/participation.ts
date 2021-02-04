import { bind } from "@react-rxjs/core"
import { Observable } from "rxjs"
import { map, pluck } from "rxjs/operators"
import { Provinces } from "./provinces"

export interface Participation {
  nVoters: number
  nNonVoters: number
}

export const participation$: Observable<
  Record<Provinces, Participation>
> = new Observable()

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
