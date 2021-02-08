import { bind, Subscribe } from "@react-rxjs/core"
import { getParties } from "api/parties"
import {
  editingParty$,
  locks$,
  onDoneEditing,
  prediction$,
  predictionInput$,
} from "App/Results/state/predictions"
import { ProgressBar } from "components/progressBar"
import { useLayoutEffect, useRef } from "react"
import { combineLatest, concat, NEVER, Observable, of } from "rxjs"
import { map, pluck, switchMap, take, withLatestFrom } from "rxjs/operators"
import { withProvince } from "utils/withProvince"
import { onPredictionChange } from "../state"

const withEditingParty = <T extends {}>(source$: Observable<T>) =>
  editingParty$.pipe(
    switchMap((partyId) =>
      partyId ? source$.pipe(map((x) => [x, partyId] as const)) : NEVER,
    ),
  )

export const minMax$ = withEditingParty(
  withProvince(locks$.pipe(withLatestFrom(prediction$))),
).pipe(
  map(([[[locks, predictions], province], partyId]) => {
    const prediction = predictions[province]

    let nUnlocked = Object.keys(prediction).length - locks[province].size
    if (!locks[province].has(partyId)) nUnlocked--
    if (nUnlocked === 0) {
      const val = prediction[partyId].percent * 100
      return { min: val, max: val }
    }

    let available = 1
    locks[province].forEach((id) => {
      if (id !== partyId) {
        available -= prediction[id].percent
      }
    })
    return { min: 0, max: Math.min(0.99, available) * 100 }
  }),
)

const value$ = concat(
  withEditingParty(withProvince(prediction$)).pipe(
    map(([[p, province], partyId]) =>
      (p[province][partyId].percent * 100).toFixed(2),
    ),
    take(1),
  ),
  predictionInput$.pipe(
    pluck("percent"),
    withLatestFrom(minMax$),
    map(([x, { min, max }]) => {
      const value = Number(x)
      if (Number.isNaN(value)) return x
      const finalValue = Math.max(min, Math.min(value, max))
      return finalValue === value ? x : finalValue.toFixed(2)
    }),
  ),
)

const party$ = withEditingParty(of(getParties())).pipe(map(([p, k]) => p[k]))

const [useFormData, formData$] = bind(combineLatest([value$, party$]))

const FormBase: React.FC = () => {
  const [value, party] = useFormData()
  const rangeRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    rangeRef.current!.focus()
    function onClickDocument(e: MouseEvent) {
      if (e.target !== rangeRef.current && e.target !== inputRef.current) {
        onDoneEditing()
      }
    }
    setTimeout(() => {
      document.addEventListener("click", onClickDocument)
    }, 0)
    return () => {
      document.removeEventListener("click", onClickDocument)
    }
  }, [])
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onDoneEditing()
      }}
      className="w-full pl-12 flex items-center"
    >
      <ProgressBar
        className="rounded-md ml-0.5 w-full flex-grow"
        width={value}
        color={party.color}
      >
        <input
          ref={rangeRef}
          type="range"
          className={`absolute w-full h-full appearance-none bg-transparent top-0 outline-none`}
          style={{ cursor: "col-resize" }}
          min="0"
          max={100}
          step={0.01}
          value={value}
          onChange={(e) => onPredictionChange(party.id, e.target.value)}
        />
      </ProgressBar>
      <input
        ref={inputRef}
        className="ml-2 flex-grow-0 w-14"
        type="number"
        min={0}
        max={100}
        step={0.01}
        value={value}
        onChange={(e) => {
          onPredictionChange(party.id, e.target.value)
        }}
      />
    </form>
  )
}

export const Form: React.FC = () => (
  <Subscribe source$={formData$}>
    <FormBase />
  </Subscribe>
)
