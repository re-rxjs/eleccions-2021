import { bind, shareLatest } from "@react-rxjs/core"
import { createListener, selfDependant } from "@react-rxjs/utils"
import { Participation, participation$ } from "api/participation"
import { PartyId } from "api/parties"
import { Provinces, sitsByProvince } from "api/provinces"
import { Votes, votes$ } from "api/votes"
import { combineLatest, merge, NEVER, Observable, race } from "rxjs"
import {
  filter,
  map,
  mapTo,
  publish,
  scan,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs/operators"
import { add } from "utils/add"
import { dhondt } from "utils/dhondt"
import { mapRecord, recordEntries, recordFromEntries } from "utils/record-utils"
import { mergeResults, Results } from "./results"
import { withProvince } from "utils/withProvince"
import { selectedProvince$ } from "../AreaPicker"

const [editParty$, onEditParty] = createListener<PartyId>()
const [doneEditing$, onDoneEditing] = createListener()

export { onEditParty, onDoneEditing }
export const [useEditingParty, editingParty$] = bind(
  merge(editParty$, doneEditing$.pipe(mapTo(null))),
  null,
)

export const currentParty$ = editingParty$.pipe(
  filter((x): x is PartyId => x !== null),
)

export const [predictionInput$, onPredictionChange] = createListener<string>()

const [toggleLock$, onToggleLock] = createListener<PartyId>()
export { onToggleLock }

const withDefaultStream$ = <T, TT>(default$: Observable<T>) =>
  publish((source$: Observable<TT>) =>
    race([source$, merge(default$.pipe(takeUntil(source$)), source$)]),
  )

const initialLocks: Record<Provinces | "CAT", Set<PartyId>> = recordFromEntries(
  [...Object.values(Provinces), "CAT"].map((p) => [p, new Set<PartyId>()]),
)
const locks$: Observable<
  Record<Provinces | "CAT", Set<PartyId>>
> = toggleLock$.pipe(
  withLatestFrom(selectedProvince$),
  scan((acc, [partyId, province]) => {
    const key = province || ("CAT" as const)
    const nextSet = new Set(acc[key])
    if (nextSet.has(partyId)) nextSet.delete(partyId)
    else nextSet.add(partyId)
    return {
      ...acc,
      [key]: nextSet,
    }
  }, initialLocks),
  startWith(initialLocks),
  shareLatest(),
)

const [_predictions$, connectPredictions] = selfDependant<
  Record<Provinces, Record<PartyId, number>>
>()
const initialLockedValues: Record<Provinces, number> = recordFromEntries(
  Object.values(Provinces).map((p) => [p, 0]),
)
const lockedValues$ = locks$.pipe(
  withLatestFrom(selectedProvince$, toggleLock$, _predictions$),
  scan((acc, [locks, province, partyId, prevPredictions]) => {
    if (!province) return acc
    let diff = prevPredictions[province][partyId]
    const result = { ...acc }
    if (!locks[province].has(partyId)) {
      diff *= -1
    }
    result[province] += diff
    return result
  }, initialLockedValues),
  startWith(initialLockedValues),
  shareLatest(),
)

export const multipliers$ = combineLatest([participation$, votes$]).pipe(
  map(([participation, votes]) => {
    let totalRemaining = 0
    const remainingVotesPerProvince = mapRecord(votes, (x, province) => {
      const percentPartyVotes = x.partyVotes / (x.nil + x.partyVotes + x.white)
      const expectedTotalParties = Math.round(
        participation[province].nVoters * percentPartyVotes,
      )
      const res = expectedTotalParties - x.partyVotes
      totalRemaining += res
      return res
    })

    const generalToProvinces = (
      percent: number,
      partyId: PartyId,
      latestPredictions: Record<Provinces, Record<PartyId, number>>,
    ) => {
      let total = 0
      const weight = mapRecord(latestPredictions, (x, province) => {
        const res = provinceToGeneral(x[partyId], province)
        total += res
        return res
      })

      return mapRecord(weight, (x, province) => {
        return (
          ((x / total) * percent * totalRemaining) /
          remainingVotesPerProvince[province]
        )
      })
    }

    const provinceToGeneral = (percent: number, province: Provinces) => {
      const votes = remainingVotesPerProvince[province] * percent
      return votes / totalRemaining
    }

    return { generalToProvinces, provinceToGeneral }
  }),
  shareLatest(),
)

const catLockedValue$ = locks$.pipe(
  withLatestFrom(selectedProvince$, toggleLock$, _predictions$, multipliers$),
  scan((acc, [locks, province, partyId, prevPredictions, multipliers]) => {
    if (province) return acc

    return (
      acc +
      Object.values(Provinces)
        .map((province) => {
          let diff = prevPredictions[province][partyId]
          if (diff === undefined) return 0
          diff = multipliers.provinceToGeneral(diff, province)

          if (!locks.CAT.has(partyId)) {
            diff *= -1
          }
          return diff
        })
        .reduce(add)
    )
  }, 0),
  startWith(0),
)

const getMinMax = (
  partyId: PartyId,
  locks: Set<PartyId>,
  currentVal: number,
  lockedValue: number,
  nParties: number,
) => {
  let nUnlocked = nParties - locks.size
  if (locks.has(partyId)) {
    lockedValue -= currentVal
  } else {
    nUnlocked--
  }
  if (nUnlocked === 0) {
    return { min: currentVal, max: currentVal }
  }

  let unlockedValue = 1 - lockedValue - currentVal
  return { min: 0, max: Math.min(unlockedValue + currentVal, 0.99) }
}

const [
  _catPredictionResults$,
  connectCatPredictionResults,
] = selfDependant<Results>()
const catMinMax$ = combineLatest([
  currentParty$,
  locks$,
  selectedProvince$,
]).pipe(
  withLatestFrom(_catPredictionResults$, catLockedValue$),
  filter(([[_, __, province]]) => !province),
  map(([[partyId, locks], catResults, lockedValue]) =>
    getMinMax(
      partyId,
      locks.CAT,
      catResults.parties[partyId].percent,
      lockedValue,
      Object.keys(catResults.parties).length,
    ),
  ),
)

const provinceMinMax$ = combineLatest([
  currentParty$,
  locks$,
  selectedProvince$,
]).pipe(
  withLatestFrom(_predictions$, lockedValues$),
  filter(([[_, __, province]]) => !!province),
  map(([[partyId, locks, province], prev, lockedValues]) =>
    getMinMax(
      partyId,
      locks[province as Provinces],
      prev[province as Provinces][partyId],
      lockedValues[province as Provinces],
      Object.keys(prev[province as Provinces]).length,
    ),
  ),
)

export const [useMinMax, minMax$] = bind(merge(catMinMax$, provinceMinMax$))

export const [useIsLocked] = bind(
  (partyId: PartyId) =>
    combineLatest([locks$, selectedProvince$]).pipe(
      map(([l, province]) => l[province || "CAT"].has(partyId)),
    ),
  false,
)

function getNextPrediction(
  partyId: PartyId,
  desiredValue: number,
  prevPredictions: Record<PartyId, number>,
  locks: Set<PartyId>,
  lockedValue: number,
) {
  let unlockedValue = 1 - lockedValue - prevPredictions[partyId]

  const percent = Math.min(
    Math.max(0, desiredValue),
    Math.min(unlockedValue + prevPredictions[partyId], 0.99),
  )

  const remaining = 1 - lockedValue - percent

  const lockedParties = {} as Record<PartyId, number>
  const unlockedParties = {} as Record<PartyId, number>
  recordEntries(prevPredictions).forEach(([key, val]) => {
    if (key === partyId) return
    ;(locks.has(key) ? lockedParties : unlockedParties)[key] = val
  })

  if (unlockedValue > 0) {
    return {
      ...lockedParties,
      ...mapRecord(unlockedParties, (x) => (x / unlockedValue) * remaining),
      [partyId]: percent,
    }
  }

  const nUnlocked = Object.keys(unlockedParties).length
  if (nUnlocked === 0) return prevPredictions

  const splitValue = remaining / nUnlocked
  return {
    ...lockedParties,
    [partyId]: percent,
    ...mapRecord(unlockedParties, () => splitValue),
  }
}

const provinceUpdates$ = withProvince(predictionInput$).pipe(
  withLatestFrom(currentParty$),
  map(([[percent, province], partyId]) => ({
    partyId,
    province,
    percent: Number(percent) / 100,
  })),
  filter((x) => !Number.isNaN(x.percent)),
)
const provincePredictions$ = provinceUpdates$.pipe(
  withLatestFrom(_predictions$, locks$, lockedValues$),
  map(
    ([
      { province, partyId, percent: desiredValue },
      prev,
      locks,
      lockedValues,
    ]) => {
      const currentProvinceData = prev[province]
      let lockedValue = lockedValues[province]
      if (locks[province].has(partyId)) {
        lockedValue -= currentProvinceData[partyId]
      }
      const nextProvinceData = getNextPrediction(
        partyId,
        desiredValue,
        currentProvinceData,
        locks[province],
        lockedValue,
      )
      return currentProvinceData === nextProvinceData
        ? prev
        : {
            ...prev,
            [province]: nextProvinceData,
          }
    },
  ),
)

const catUpdates$ = selectedProvince$.pipe(
  switchMap((province) =>
    province
      ? NEVER
      : predictionInput$.pipe(
          withLatestFrom(currentParty$),
          map(([x, partyId]) => ({ partyId, percent: Number(x) / 100 })),
          filter((x) => !Number.isNaN(x.percent)),
        ),
  ),
)

const catPredictions$ = catUpdates$.pipe(
  withLatestFrom(minMax$, _predictions$, locks$, multipliers$),
  map(
    ([
      { partyId, percent: desiredValue },
      { max },
      prevPredictions,
      locks,
      multipliers,
    ]) => {
      const percent = Math.min(Math.max(0, desiredValue), max)

      const values = multipliers.generalToProvinces(
        percent,
        partyId,
        prevPredictions,
      )
      return mapRecord(prevPredictions, (prev, province) => {
        if (prev[partyId] === undefined) return prev

        let innerLock: number = 0
        locks.CAT.forEach((id) => {
          innerLock += prev[id]
        })
        if (locks.CAT.has(partyId)) innerLock -= prev[partyId]

        return getNextPrediction(
          partyId,
          values[province],
          prev,
          locks.CAT,
          innerLock,
        )
      })
    },
  ),
)

export const prediction$ = merge(catPredictions$, provincePredictions$).pipe(
  withDefaultStream$(
    votes$.pipe(
      map((results) =>
        mapRecord(results, (d) => mapRecord(d.parties, (x) => x.percent)),
      ),
    ),
  ),
  connectPredictions(),
  shareLatest(),
)

const resultPerProvince = (
  votes: Votes,
  prediction: Record<PartyId, number>,
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
    const votes = Math.round(x.votes + y * remainingValid)
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
  connectCatPredictionResults(),
  shareLatest(),
)
catPredictionResults$.subscribe()

export const getPredictionResultsByProvince = (province: Provinces | null) =>
  province
    ? predictionResults$.pipe(map((res) => res[province]))
    : catPredictionResults$
