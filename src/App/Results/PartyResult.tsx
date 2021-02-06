import { Party } from "api/parties"
import { formatNumber, formatPercent } from "utils/formatters"
import { Link } from "react-router-dom"
import { getTextColor } from "utils/color"

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
      <Link
        className={`border-2 border-gray-700 flex-grow-0 text-center ${getTextColor(
          party.color,
        )} h-14 w-14 rounded-full font-bold text-xl flex`}
        style={{ backgroundColor: party.color }}
        to={`/party/${party.id}`}
      >
        <span className="m-auto">{sits}</span>
      </Link>
      <div className="flex-grow flex flex-col h-14 justify-between">
        <div className="pl-2 antialiased font-medium flex-grow-0 ">
          {party.name}
        </div>
        <div className="border-2 border-gray-700 border-l-0 -ml-0.5 rounded-r-md bg-gray-300 h-1 box-content flex-grow-0 relative">
          <div
            className="absolute h-full -top-0.5 border-l-0 border-r-0 border-2 border-gray-700 box-content"
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
