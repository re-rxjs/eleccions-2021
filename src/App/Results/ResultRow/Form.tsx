import { combineLatest, concat, NEVER, Observable, of } from "rxjs"
import { map, pluck, switchMap, take, withLatestFrom } from "rxjs/operators"
import { bind, Subscribe } from "@react-rxjs/core"
import { getParties, PartyId } from "api/parties"
import {
  editingParty$,
  locks$,
  onDoneEditing,
  prediction$,
  predictionInput$,
  useEditingParty,
} from "App/Results/state/predictions"
import { ProgressBar } from "components/progressBar"
import { useLayoutEffect, useRef } from "react"
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
function onDone(e: KeyboardEvent | React.KeyboardEvent<any>) {
  if (e.key === "Escape" || e.key === "Enter") {
    onDoneEditing()
  }
}

const FormBase: React.FC = () => {
  const [value, party] = useFormData()
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    inputRef.current!.focus()
    function onClickDocument(e: MouseEvent) {
      if (!formRef.current!.contains(e.target as any)) {
        onDoneEditing()
      }
    }
    setTimeout(() => {
      document.addEventListener("click", onClickDocument)
      document.addEventListener("keydown", onDone)
    }, 0)
    return () => {
      document.removeEventListener("click", onClickDocument)
      document.removeEventListener("keydown", onDone)
    }
  }, [])
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        onDoneEditing()
      }}
      className="w-full pl-12 flex flex-wrap mt-2 pr-16 mr-0.5 justify-center"
    >
      <label className="w-full flex-grow" htmlFor="prediccio-text">
        Quin percentatge dels vots no escrutats creus que s'endurà {party.name}?
      </label>
      <ProgressBar
        className="rounded-md my-2 w-full flex-grow"
        width={value}
        color={party.color}
      >
        <input
          name="prediccio-barra"
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
      <p className="flex-grow-0">
        <input
          ref={inputRef}
          className="w-14 bg-gray-100"
          type="number"
          name="prediccio-text"
          min={0}
          max={100}
          step={0.01}
          value={value}
          onChange={(e) => {
            onPredictionChange(party.id, e.target.value)
          }}
        />
        %
      </p>
    </form>
  )
}

const Form: React.FC<{ partyId: PartyId }> = ({ partyId }) =>
  useEditingParty() === partyId ? (
    <Subscribe source$={formData$}>
      <FormBase />
    </Subscribe>
  ) : null

export default Form
