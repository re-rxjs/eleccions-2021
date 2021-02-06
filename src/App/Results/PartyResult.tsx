import { Party } from "api/parties"

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
        className="flex-grow-0 text-center text-white pt-3.5 h-14 w-14 inline-block rounded-full font-bold text-xl"
        style={{ backgroundColor: party.color }}
      >
        {sits}
      </div>
      <div className="flex-grow flex flex-col h-14 justify-between">
        <div className="pl-2 antialiased font-medium flex-grow-0">
          {party.name}
        </div>
        <div className="bg-gray-100 h-1 flex-grow-0 relative">
          <div
            className="h-1"
            style={{ backgroundColor: party.color, width: percent + "%" }}
          ></div>
          <input
            type="range"
            className={`absolute w-full h-full appearance-none bg-transparent top-0 outline-none${
              editting ? "" : " hidden"
            }`}
            style={{ cursor: "col-resize" }}
            min="0"
            max="10000"
            value={percent * 100}
            onChange={(e) => onEdit(Number(e.target.value) / 100)}
          />
        </div>
        <div className="pl-2 flex justify-between text-sm text-gray-600 flex-grow-0 pb-1">
          <span className="">{votes}</span>
          <span className="">{percent}%</span>
        </div>
      </div>
    </li>
  )
}
