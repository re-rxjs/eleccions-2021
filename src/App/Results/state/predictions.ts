import { bind, shareLatest } from "@react-rxjs/core"
import { createListener, selfDependant } from "@react-rxjs/utils"
import { Participation, participation$ } from "api/participation"
import { Party, PartyId } from "api/parties"
import { Provinces, sitsByProvince } from "api/provinces"
import { Votes, votes$ } from "api/votes"
import { selectedProvince$ } from "../AreaPicker"
import { combineLatest, concat, EMPTY, merge, Observable, race } from "rxjs"
import {
  filter,
  map,
  publish,
  scan,
  startWith,
  switchMap,
  switchMapTo,
  takeUntil,
  withLatestFrom,
} from "rxjs/operators"
import { add } from "utils/add"
import { dhondt } from "utils/dhondt"
import { mapRecord, recordFromEntries } from "utils/record-utils"
import { mergeResults } from "./results"
import { isResults$ } from "App/ResultsOrPrediction"

export const [predictionInput$, onPredictionChange] = createListener(
  (partyId: PartyId, percent: string) => ({
    partyId,
    percent,
  }),
)

const [toggleLock$, onToggleLock] = createListener<PartyId>()
export { onToggleLock }

const withDefaultStream$ = <T, TT>(default$: Observable<T>) =>
  publish((source$: Observable<TT>) =>
    race([source$, merge(default$.pipe(takeUntil(source$)), source$)]),
  )

const initialLocks = recordFromEntries(
  Object.values(Provinces).map((p) => [p, new Set<PartyId>()]),
)
export const locks$ = selectedProvince$.pipe(
  switchMap((province) =>
    province
      ? toggleLock$.pipe(map((partyId) => ({ partyId, province })))
      : EMPTY,
  ),
  scan((acc, { province, partyId }) => {
    const nextSet = new Set(acc[province])
    if (nextSet.has(partyId)) nextSet.delete(partyId)
    else nextSet.add(partyId)
    return {
      ...acc,
      [province]: nextSet,
    }
  }, initialLocks),
  startWith(initialLocks),
  shareLatest(),
)

export const [useIsLocked] = bind(
  (partyId: PartyId) =>
    selectedProvince$.pipe(
      switchMap((province) =>
        locks$.pipe(map((l) => (province ? l[province].has(partyId) : false))),
      ),
    ),
  false,
)

const values$ = selectedProvince$.pipe(
  switchMap((province) =>
    province
      ? predictionInput$.pipe(
          map(({ partyId, percent }) => ({
            partyId,
            province,
            percent: Number(percent) / 100,
          })),
          filter((x) => !Number.isNaN(x.percent)),
        )
      : EMPTY,
  ),
)

const [_predictions$, connectPredictions] = selfDependant<
  Record<Provinces, Record<PartyId, { party: Party; percent: number }>>
>()

export const prediction$ = values$.pipe(
  withLatestFrom(_predictions$, locks$),
  map(([{ province, partyId, percent: rawValue }, prev, locks]) => {
    const provinceData = prev[province]
    const partyData = { ...prev[province][partyId] }

    const lockedParties: Partial<
      Record<PartyId, { party: Party; percent: number; isLock: true }>
    > = {}
    const unlockedParties = {} as Record<
      PartyId,
      { party: Party; percent: number; isLock?: false }
    >
    Object.values(provinceData).forEach((entry) => {
      if (entry.party.id === partyData.party.id) return
      const set = locks[province].has(entry.party.id)
        ? lockedParties
        : unlockedParties
      set[entry.party.id] = entry
    })

    const unlockedValue = Object.values(unlockedParties)
      .map((x) => x!.percent)
      .reduce(add, 0)

    const lockedValue = Object.values(lockedParties)
      .map((x) => x!.percent)
      .reduce(add, 0)

    partyData.percent = Math.min(
      Math.max(0, rawValue),
      unlockedValue + partyData.percent - 0.01,
    )

    const remaining = 1 - lockedValue - partyData.percent

    if (unlockedValue > 0)
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

    const nToSplit = Object.keys(unlockedParties).length
    return nToSplit > 0
      ? {
          ...prev,
          [province]: {
            ...lockedParties,
            [partyId]: partyData,
            ...mapRecord(unlockedParties, (x) => ({
              ...x,
              percent: remaining / nToSplit,
            })),
          },
        }
      : prev
  }),
  withDefaultStream$(
    votes$.pipe(
      map((results) =>
        mapRecord(
          results,
          (d) =>
            d.parties as Record<PartyId, { party: Party; percent: number }>,
        ),
      ),
    ),
  ),
  connectPredictions(),
  shareLatest(),
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

  const totalValid = remainingValid + votes.partyVotes + votes.white

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

const predictionResults$ = combineLatest([
  votes$,
  prediction$,
  participation$,
]).pipe(
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

export const getPredictionResultsByProvince = (province: Provinces | null) =>
  province
    ? predictionResults$.pipe(map((res) => res[province]))
    : catPredictionResults$

const [editParty$, onEditParty] = createListener<PartyId>()
const [doneEditing$, onDoneEditing] = createListener()

export { onEditParty, onDoneEditing }
export const [useEditingParty, editingParty$] = bind(
  merge(isResults$, selectedProvince$, doneEditing$).pipe(
    switchMapTo(concat([null], editParty$)),
  ),
  null,
)
