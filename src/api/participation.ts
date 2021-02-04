import { Observable } from "rxjs"
import { Provinces } from "./provinces"

export interface Participation {
  nVoters: number
  nNonVoters: number
}

export const participation$: Observable<
  Record<Provinces, Participation>
> = new Observable()
