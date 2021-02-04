import { shareLatest } from "@react-rxjs/core"
import { timer } from "rxjs"
import { distinctUntilChanged, filter, map, switchMap } from "rxjs/operators"
import { recordFromEntries, recordEntries } from "utils/record-utils"
import { getResults, Results } from "./fileService/results"
import { getTimestampFile } from "./fileService/timestamp"
import { PartyId } from "./parties"
import { Provinces } from "./provinces"

const POLL_TIME = 60_000

const timestamp$ = timer(0, POLL_TIME).pipe(
  switchMap(() => getTimestampFile()),
  map((timestamps) => timestamps[timestamps.length - 1]),
  map((timestamp) => timestamp?.TimestampCandidaturaValue),
  filter((timestamp) => timestamp !== undefined),
  distinctUntilChanged(),
)

export const result$ = timestamp$.pipe(
  switchMap((timestamp) => getResults(99, timestamp)),
  map((results) => ({
    summary: mapSummary(results.summary),
    detail: mapDetail(results.detail),
  })),
  shareLatest(),
)

function mapSummary(summary: Results["summary"]) {
  const provinceData = summary.filter(
    (v) => v.TypeAmbito === TypeAmbitoProvince,
  )
  return pickBy(
    provinceData,
    (province) => codeProvinces[Number(province.CodigoCircumscripcion)],
  )
}

function mapDetail(summary: Results["detail"]) {
  const provinceData = summary.filter(
    (v) => v.TypeAmbito === TypeAmbitoProvince,
  )
  const provinceGroups = groupBy(
    provinceData,
    (province) => codeProvinces[Number(province.CodigoCircumscripcion)],
  )
  return recordFromEntries(
    recordEntries(provinceGroups).map(([province, provinceRows]) => [
      province,
      pickBy(provinceRows, (row) => codeParties[Number(row.CodigoPartido)]),
    ]),
  )
}

/// Hardcoded values
const provinceCodes: Record<Provinces, number> = {
  [Provinces.BCN]: 89,
  [Provinces.TAR]: 439,
  [Provinces.GIR]: 179,
  [Provinces.LLE]: 259,
}
const codeProvinces = recordFromEntries(
  recordEntries(provinceCodes).map(([province, code]) => [code, province]),
)

const partyCodes: Record<PartyId, number> = {
  [PartyId.Cs]: 301,
  [PartyId.PDeCAT]: 1016,
  [PartyId.ERC]: 647,
  [PartyId.PSC]: 6,
  [PartyId.Comuns]: 1015,
  [PartyId.CUP]: 1003,
  [PartyId.PP]: 86,
  [PartyId.Junts]: 1016,
  [PartyId.Vox]: 0,
  [PartyId.PNC]: 0,
  [PartyId.Primaries]: 0,
  [PartyId.RecortesZero_UCE]: 1009,
  [PartyId.PCTC]: 0,
  [PartyId.FNC]: 0,
  [PartyId.IZQP]: 0,
  [PartyId.PUM_J]: 350,
  [PartyId.MCR]: 0,
  [PartyId.EsconsEnBlanc]: 0,
}
const codeParties = recordFromEntries(
  recordEntries(partyCodes).map(([party, code]) => [code, party]),
)

const TypeAmbitoProvince = "CI"

/// Utils
function groupBy<T, G extends number | string>(
  array: T[],
  groupFn: (value: T) => G,
): Record<G, T[]> {
  const result: Record<G, T[]> = {} as any

  array.forEach((v) => {
    const key = groupFn(v)
    if (key === undefined) return
    result[key] = result[key] || []
    result[key].push(v)
  })

  return result
}
function pickBy<T, G extends number | string>(
  array: T[],
  groupFn: (value: T) => G,
): Record<G, T> {
  const result: Record<G, T> = {} as any

  array.forEach((v) => {
    const key = groupFn(v)
    if (key === undefined) return
    result[key] = v
  })

  return result
}
