import { shareLatest } from "@react-rxjs/core"
import { createListener, mergeWithKey, selfDependant } from "@react-rxjs/utils"
import { Participation, participation$ } from "api/participation"
import { Party, PartyId } from "api/parties"
import { Provinces, sitsByProvince } from "api/provinces"
import { Votes, votes$ } from "api/votes"
import { selectedProvince$ } from "./AreaPicker"
import { EMPTY, merge, Observable, race } from "rxjs"
import {
  map,
  publish,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs/operators"
import { add } from "utils/add"
import { dhondt } from "utils/dhondt"
import { mapRecord } from "utils/record-utils"
import { mergeResults } from "./results.state"

const [predictionInput$, onPredictionChange] = createListener(
  (partyId: PartyId, percent: number) => ({
    partyId,
    percent,
  }),
)

const [toggleLock$, onToggleLock$] = createListener<PartyId>()

const withDefaultStream$ = <T, TT>(default$: Observable<T>) =>
  publish((source$: Observable<TT>) =>
    race([source$, merge(default$.pipe(takeUntil(source$)), source$)]),
  )

const locks$ = selectedProvince$.pipe(
  switchMap((province) =>
    province
      ? toggleLock$.pipe(map((partyId) => ({ partyId, province })))
      : EMPTY,
  ),
)

const values$ = selectedProvince$.pipe(
  switchMap((province) =>
    province
      ? predictionInput$.pipe(
          map((prediction) => ({ ...prediction, province })),
        )
      : EMPTY,
  ),
)

const [_predictions$, connectPredictions] = selfDependant<
  Record<
    Provinces,
    Record<PartyId, { party: Party; percent: number; isLock?: boolean }>
  >
>()

const prediction$ = mergeWithKey({
  lock: locks$,
  value: values$,
}).pipe(
  withLatestFrom(_predictions$),
  map(([event, prev]) => {
    const { province, partyId } = event.payload
    const provinceData = prev[province]
    const partyData = { ...prev[province][partyId] }
    if (event.type === "lock") {
      partyData.isLock = !partyData.isLock
      return {
        ...prev,
        [province]: {
          ...provinceData,
          [partyId]: partyData,
        },
      }
    }
    const rawValue = event.payload.percent

    const lockedParties: Partial<
      Record<PartyId, { party: Party; percent: number; isLock: true }>
    > = {}
    const unlockedParties = {} as Record<
      PartyId,
      { party: Party; percent: number; isLock?: false }
    >
    Object.values(provinceData).forEach((entry) => {
      if (entry === partyData) return
      const set = entry.isLock ? lockedParties : unlockedParties
      set[entry.party.id] = entry
    })

    const unlockedValue = Object.values(unlockedParties)
      .map((x) => x!.percent)
      .reduce(add)

    const lockedValue = Object.values(lockedParties)
      .map((x) => x!.percent)
      .reduce(add)

    partyData.percent = Math.min(
      Math.max(0, rawValue),
      unlockedValue + partyData.percent,
    )

    const remaining = 1 - lockedValue - partyData.percent

    return {
      ...prev,
      [province]: {
        ...lockedParties,
        [partyId]: partyData,
        ...mapRecord(unlockedParties, (x) => ({
          ...x,
          percent: (x!.percent / unlockedValue) * remaining,
        })),
      },
    }
  }),
  withDefaultStream$(
    votes$.pipe(
      map((results) =>
        mapRecord(
          results,
          (d) =>
            d.parties as Record<
              PartyId,
              { party: Party; percent: number; isLock?: boolean }
            >,
        ),
      ),
    ),
  ),
  connectPredictions(),
)

const resultPerProvince = (
  votes: Votes,
  prediction: Record<PartyId, { percent: number }>,
  participation: Participation,
  nSits: number,
) => {
  const totalEmittedVotes = votes.partyVotes + votes.nil + votes.white
  const validPercent = (totalEmittedVotes - votes.nil) / totalEmittedVotes

  const remainingVotes = participation.nVoters - totalEmittedVotes
  const remainingValid = Math.round(validPercent * remainingVotes)

  const totalValid = remainingVotes + votes.partyVotes + votes.white

  let partyVotes = 0
  const parties = mapRecord(votes.parties, (x, partyId) => {
    const y = prediction[partyId]
    const votes = Math.round(x.votes + y.percent * remainingValid)
    const percent = votes / totalValid
    partyVotes += votes
    return { ...x, votes, percent, sits: 0 }
  })

  const threshold = Math.round(totalValid * 0.03)
  dhondt(parties, nSits, threshold).forEach(([party]) => {
    parties[party as PartyId].sits++
  })

  const nil = participation.nVoters - totalValid
  const white = totalValid - partyVotes
  return {
    nil,
    white,
    partyVotes,
    parties,
  }
}

const predictionResults$ = votes$.pipe(
  withLatestFrom(prediction$, participation$),
  map(([pVotes, pPrediction, pParticipation]) =>
    mapRecord(pVotes, (votes, province) =>
      resultPerProvince(
        votes,
        pPrediction[province],
        pParticipation[province],
        sitsByProvince[province],
      ),
    ),
  ),
  shareLatest(),
)
predictionResults$.subscribe()

const catPredictionResults$ = predictionResults$.pipe(
  map(mergeResults),
  shareLatest(),
)
catPredictionResults$.subscribe()
