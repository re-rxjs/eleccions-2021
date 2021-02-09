import { bind } from "@react-rxjs/core"
import { Provinces } from "api/provinces"
import { FC } from "react"
import { map } from "rxjs/operators"
import { changeProvince, selectedProvince$ } from "./AreaPicker.state"

export const AreaPicker = () => {
  return (
    <div className="flex py-2 justify-center">
      <Button province={null} className="mr-2" />
      <div className="flex divide-x divide-white">
        <Button province={Provinces.BCN} />
        <Button province={Provinces.GIR} />
        <Button province={Provinces.LLE} />
        <Button province={Provinces.TAR} />
      </div>
    </div>
  )
}

const [useIsSelected] = bind(
  (province: Provinces | null) =>
    selectedProvince$.pipe(map((selected) => selected === province)),
  false,
)
const Button: FC<{ province: Provinces | null; className?: string }> = ({
  province,
  className = "",
}) => {
  const isSelected = useIsSelected(province)
  return (
    <button
      className={`text-center p-2 font-bold ${
        isSelected ? "bg-indigo-400" : "bg-indigo-200"
      } ${className}`}
      onClick={() => changeProvince(province)}
    >
      {province || "Catalunya"}
    </button>
  )
}
