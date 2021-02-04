import { bind } from "@react-rxjs/core"
import { Observable, of } from "rxjs"
import { map, pluck } from "rxjs/operators"
import { Provinces } from "./provinces"

export interface Participation {
  nVoters: number
  nNonVoters: number
}

export const participation$: Observable<Record<Provinces, Participation>> = of({
  [Provinces.BCN]: {
    nVoters: 3296800,
    nNonVoters: 859509,
  },
  [Provinces.GIR]: {
    nVoters: 409966,
    nNonVoters: 107919,
  },
  [Provinces.LLE]: {
    nVoters: 242057,
    nNonVoters: 71861,
  },
  [Provinces.TAR]: {
    nVoters: 444068,
    nNonVoters: 122275,
  },
})

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
