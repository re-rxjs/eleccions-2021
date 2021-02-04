import { Observable } from "rxjs"
import { PartyId } from "./parties"
import { Provinces } from "./provinces"

export interface Votes {
  nil: number
  white: number
  parties: Record<PartyId, number>
}

export const votes$ = new Observable<Record<Provinces, Votes>>()
