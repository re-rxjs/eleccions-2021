import { Party } from "api/parties"
import { formatNumber, formatPercent } from "utils/formatters"
import { Link } from "react-router-dom"
import { getTextColor } from "utils/color"

const MAX_INPUT = 10_000

export const PartyResult: React.FC<{
  party: Party
  sits: number
  votes: number
  percent: number
  linkToParty?: boolean
  editting?: boolean
  onEdit?: (value: number) => void
}> = ({
  party,
  sits,
  votes,
  percent,
  linkToParty,
  editting,
  onEdit = Function.prototype,
}) => {
  const sitsElementProps = {
    className: `border-2 border-gray-700 flex-grow-0 text-center ${getTextColor(
      party.color,
    )} h-14 w-14 rounded-full font-bold text-xl flex`,
    style: { backgroundColor: party.color },
    children: <span className="m-auto">{sits}</span>,
  }

  const sitsElement = linkToParty ? (
    <Link {...sitsElementProps} to={`/party/${party.id}`} />
  ) : (
    <div {...sitsElementProps} />
  )
  return (
    <li className="flex items-center my-2">
      {sitsElement}
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
            max={MAX_INPUT}
            value={percent * MAX_INPUT}
            onChange={(e) => onEdit(Number(e.target.value) / MAX_INPUT)}
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
