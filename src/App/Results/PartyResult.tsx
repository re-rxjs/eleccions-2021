import { Party } from "api/parties"

export const PartyResult: React.FC<{
  party: Party
  sits: number
  votes: number
  percent: number
}> = ({ party, sits, votes, percent }) => (
  <li className="flex items-center my-2">
    <div
      className="flex-grow-0 text-center text-white pt-3.5 h-14 w-14 inline-block rounded-full font-bold text-xl"
      style={{ backgroundColor: party.color }}
    >
      {sits}
    </div>
    <div className="flex-grow flex flex-col h-14 justify-between">
      <div className="pl-2 antialiased font-medium flex-grow-0">
        {party.name}
      </div>
      <div className="bg-gray-100 h-1 flex-grow-0">
        <div
          className="h-1"
          style={{ backgroundColor: party.color, width: percent + "%" }}
        ></div>
      </div>
      <div className="pl-2 flex justify-between text-sm text-gray-600 flex-grow-0 pb-1">
        <span className="">{votes}</span>
        <span className="">{percent}%</span>
      </div>
    </div>
  </li>
)
