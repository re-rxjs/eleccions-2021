import { Party } from "api/parties"
import { formatNumber, formatPercent } from "utils/formatters"
import { Link } from "react-router-dom"
import { getTextColor } from "utils/color"
import { ProgressBar } from "components/progressBar"

export const PartyResult: React.FC<{
  party: Party
  sits: number
  votes: number
  percent: number
  linkToParty?: boolean
}> = ({ party, sits, votes, percent, linkToParty }) => {
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
    <div className="flex-grow flex items-center">
      {sitsElement}
      <div className="flex-grow flex flex-col h-14 justify-between">
        <div className="pl-2 antialiased font-medium flex-grow-0 ">
          {party.name}
        </div>
        <ProgressBar
          className="border-l-0 rounded-r-md -ml-0.5 flex-grow-0"
          width={percent * 100}
          color={party.color}
        />
        <div className="pl-2 flex justify-between text-sm text-gray-600 flex-grow-0 pb-1">
          <span className="">{formatNumber(votes)}</span>
          <span className="">{formatPercent(percent)}</span>
        </div>
      </div>
    </div>
  )
}
