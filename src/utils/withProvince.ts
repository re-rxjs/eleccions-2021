import { selectedProvince$ } from "App/Results/AreaPicker"
import { NEVER, Observable } from "rxjs"
import { map, switchMap } from "rxjs/operators"

export const withProvince = <T>(source$: Observable<T>) =>
  selectedProvince$.pipe(
    switchMap((province) =>
      province ? source$.pipe(map((x) => [x, province] as const)) : NEVER,
    ),
  )
