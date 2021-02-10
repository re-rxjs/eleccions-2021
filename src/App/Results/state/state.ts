import { bind, shareLatest } from "@react-rxjs/core"
import { createListener } from "@react-rxjs/utils"
import { PartyId } from "api/parties"
import { Provinces } from "api/provinces"
import { isResults$ } from "App/ResultsOrPrediction"
import { NEVER } from "rxjs"
import { map, startWith, switchMap } from "rxjs/operators"
import { selectedProvince$ } from "../AreaPicker"
import { getPredictionResultsByProvince } from "./predictions"
import { getResultsByProvince, PartyResults } from "./results"

export const getCurrentResults = (province: Provinces | null) =>
  isResults$.pipe(
    switchMap((isResults) =>
      (isResults ? getResultsByProvince : getPredictionResultsByProvince)(
        province,
      ),
    ),
  )

const currentResults$ = selectedProvince$.pipe(
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

const [isManipulatingBar$, setIsManipulatinBar] = createListener<boolean>()
export { setIsManipulatinBar }

export const [useOrder, order$] = bind(
  isManipulatingBar$.pipe(
    startWith(false),
    switchMap((isManipulatingBar) =>
      isManipulatingBar ? NEVER : actualOrder$,
    ),
  ),
)

export const [usePartyResult, getPartyResult$] = bind((id: PartyId) =>
  currentResults$.pipe(map((res) => res.parties[id])),
)

export const [useIsEditing] = bind(
  isResults$.pipe(map((isResults) => !isResults)),
  false,
)
