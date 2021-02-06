import { Party } from "api/parties"
import { formatNumber, formatPercent } from "utils/formatters"

const isContrastDark = (hexcolor: string) => {
  if (hexcolor[0] === "#") {
    hexcolor = hexcolor.slice(1)
  }

  if (hexcolor.length === 3) {
    hexcolor = hexcolor
      .split("")
      .map(function (hex) {
        return hex + hex
      })
      .join("")
  }

  var r = parseInt(hexcolor.substr(0, 2), 16)
  var g = parseInt(hexcolor.substr(2, 2), 16)
  var b = parseInt(hexcolor.substr(4, 2), 16)

  var yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128
}

export const PartyResult: React.FC<{
  party: Party
  sits: number
  votes: number
  percent: number
  editting?: boolean
  onEdit?: (value: number) => void
}> = ({
  party,
  sits,
  votes,
  percent,
  editting,
  onEdit = Function.prototype,
}) => {
  return (
    <li className="flex items-center my-2">
      <div
        className={`border-2 border-gray-700 flex-grow-0 text-center ${
          isContrastDark(party.color) ? "text-gray-900" : "text-gray-100"
        } pt-3.5 h-14 w-14 inline-block rounded-full font-bold text-xl`}
        style={{ backgroundColor: party.color }}
      >
        {sits}
      </div>
      <div className="flex-grow flex flex-col h-14 justify-between">
        <div className="pl-2 antialiased font-medium flex-grow-0 ">
          {party.name}
        </div>
        <div className="border-2 border-gray-700 border-l-0 -ml-0.5 rounded-r-md bg-gray-300 h-1 box-content flex-grow-0 relative">
          <div
            className="absolute h-full top-0"
            style={{
              backgroundColor: party.color,
              width: percent * 100 + "%",
            }}
          ></div>
          <input
            type="range"
            className={`absolute w-full h-full appearance-none bg-transparent top-0 outline-none${
              editting ? "" : " hidden"
            }`}
            style={{ cursor: "col-resize" }}
            min="0"
            max="10000"
            value={percent * 10000}
            onChange={(e) => onEdit(Number(e.target.value))}
          />
        </div>
        <div className="pl-2 flex justify-between text-sm text-gray-600 flex-grow-0 pb-1">
          <span className="">{formatNumber(votes)}</span>
          <span className="">{formatPercent(percent)}</span>
        </div>
      </div>
    </li>
  )
}
