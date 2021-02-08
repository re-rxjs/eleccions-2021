import { Subscribe } from "@react-rxjs/core"
import { AreaPicker } from "./AreaPicker"
import { ResultRow } from "./ResultRow"
import { useOrder, order$ } from "./state"

const Parties: React.FC = () => {
  const partyIds = useOrder()
  return (
    <ul className="foo px-3">
      {partyIds.map((partyId) => (
        <ResultRow key={partyId} partyId={partyId} />
      ))}
    </ul>
  )
}

export const Results: React.FC = () => {
  return (
    <Subscribe source$={order$}>
      <AreaPicker />
      <Parties />
    </Subscribe>
  )
}
