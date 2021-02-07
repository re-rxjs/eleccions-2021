import { Subscribe } from "@react-rxjs/core"
import { AreaPicker } from "./AreaPicker"
import { PartyResult } from "./PartyResult"
import {
  selectedProvinceResults$,
  PartyResults,
  useSelectedProvinceResults,
} from "./results.state"

const sortPartyResults = (a: PartyResults, b: PartyResults) => b.votes - a.votes

const Parties: React.FC = () => {
  const results = useSelectedProvinceResults()
  return (
    <ul className="foo px-3">
      {Object.values(results.parties)
        .sort(sortPartyResults)
        .map((partyResult) => (
          <PartyResult
            key={partyResult.party.id}
            {...partyResult}
            linkToParty
          />
        ))}
    </ul>
  )
}

export const Results: React.FC = () => {
  return (
    <Subscribe source$={selectedProvinceResults$}>
      <AreaPicker />
      <Parties />
    </Subscribe>
  )
}
