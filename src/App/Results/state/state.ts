import { bind, shareLatest } from "@react-rxjs/core"
import { PartyId } from "api/parties"
import { Provinces } from "api/provinces"
import { isResults$ } from "App/ResultsOrPrediction"
import { combineLatest, NEVER } from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { selectedProvince$ } from "../AreaPicker"
import { getPredictionResultsByProvince, editingParty$ } from "./predictions"
import { getResultsByProvince, PartyResults } from "./results"

export const getCurrentResults = (province: Provinces | null) =>
  isResults$.pipe(
    switchMap((isResults) =>
      (isResults ? getResultsByProvince : getPredictionResultsByProvince)(
        province,
      ),
    ),
  )

export const currentResults$ = selectedProvince$.pipe(
  switchMap(getCurrentResults),
  shareLatest(),
)

const sortPartyResults = (a: PartyResults, b: PartyResults) => b.votes - a.votes
const actualOrder$ = currentResults$.pipe(
  map((res) =>
    Object.values(res.parties)
      .sort(sortPartyResults)
      .map((x) => x.party.id),
  ),
)

export const [useOrder, order$] = bind(
  editingParty$.pipe(switchMap((party) => (party ? NEVER : actualOrder$))),
)

export const [usePartyResult, getPartyResult$] = bind((id: PartyId) =>
  currentResults$.pipe(map((res) => res.parties[id])),
)

export const [useIsEditing] = bind(
  combineLatest([isResults$, selectedProvince$]).pipe(
    map(([isResults, province]) => !isResults && !!province),
  ),
  false,
)
