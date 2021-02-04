import { Observable, of } from "rxjs"
import { recordFromEntries } from "utils/record-utils"
import { PartyId } from "./parties"
import { Provinces } from "./provinces"

export interface Votes {
  nil: number
  white: number
  parties: Record<PartyId, number>
}

const defaultParties = recordFromEntries(
  Object.values(PartyId).map((id) => [id, 0]),
)

export const votes$: Observable<Record<Provinces, Votes>> = of({
  [Provinces.BCN]: {
    nil: 10925,
    white: 14163,
    parties: {
      ...defaultParties,
      [PartyId.Cs]: 868365,
      [PartyId.ERC]: 678030,
      [PartyId.Junts]: 624261,
      [PartyId.PSC]: 497650,
      [PartyId.Comuns]: 276810,
      [PartyId.CUP]: 143711,
      [PartyId.PP]: 142934,
      [PartyId.Primaries]: 31330,
      [PartyId.RecortesZero_UCE]: 8621,
    },
  },
  [Provinces.GIR]: {
    nil: 1863,
    white: 1833,
    parties: {
      ...defaultParties,
      [PartyId.Junts]: 149638,
      [PartyId.ERC]: 88582,
      [PartyId.Cs]: 79634,
      [PartyId.PSC]: 35197,
      [PartyId.CUP]: 21708,
      [PartyId.Comuns]: 16482,
      [PartyId.PP]: 11646,
      [PartyId.Primaries]: 2582,
      [PartyId.RecortesZero_UCE]: 560,
      [PartyId.PUM_J]: 241,
    },
  },
  [Provinces.LLE]: {
    nil: 1002,
    white: 1341,
    parties: {
      ...defaultParties,
      [PartyId.Junts]: 78303,
      [PartyId.ERC]: 64417,
      [PartyId.Cs]: 40908,
      [PartyId.PSC]: 21795,
      [PartyId.CUP]: 12140,
      [PartyId.PP]: 10902,
      [PartyId.Comuns]: 9415,
      [PartyId.Primaries]: 1186,
      [PartyId.PUM_J]: 336,
      [PartyId.RecortesZero_UCE]: 312,
    },
  },
  [Provinces.TAR]: {
    nil: 2302,
    white: 2094,
    parties: {
      ...defaultParties,
      [PartyId.Cs]: 120825,
      [PartyId.ERC]: 104832,
      [PartyId.Junts]: 96031,
      [PartyId.PSC]: 52017,
      [PartyId.Comuns]: 23653,
      [PartyId.PP]: 20188,
      [PartyId.CUP]: 17687,
      [PartyId.Primaries]: 3645,
      [PartyId.RecortesZero_UCE]: 794,
    },
  },
})
