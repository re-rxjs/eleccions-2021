import { bind } from "@react-rxjs/core"
import { Provinces } from "api/provinces"
import { FC } from "react"
import { map } from "rxjs/operators"
import { changeProvince, selectedProvince$ } from "./AreaPicker.state"

export const AreaPicker = () => {
  return (
    <div className="flex flex-col gap-1 max-w-sm m-auto mb-4">
      <ProvinceButton province={null} />
      <div className="grid grid-cols-2 gap-1">
        <ProvinceButton province={Provinces.BCN} />
        <ProvinceButton province={Provinces.GIR} />
        <ProvinceButton province={Provinces.LLE} />
        <ProvinceButton province={Provinces.TAR} />
      </div>
    </div>
  )
}

const [useIsSelected] = bind(
  (province: Provinces | null) =>
    selectedProvince$.pipe(map((selected) => selected === province)),
  false,
)
const ProvinceButton: FC<{ province: Provinces | null }> = ({ province }) => {
  const isSelected = useIsSelected(province)

  const bgShade = isSelected ? 400 : 200

  return (
    <div
      className={`text-center p-2 rounded font-bold bg-indigo-${bgShade} cursor-pointer`}
      onClick={() => changeProvince(province)}
    >
      {province || "Catalunya"}
    </div>
  )
}
