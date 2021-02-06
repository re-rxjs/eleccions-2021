import { Subscribe } from "@react-rxjs/core"
import { PartyResult } from "./PartyResult"
import { useResults, getResults$, PartyResults } from "./results.state"

const sortPartyResults = (a: PartyResults, b: PartyResults) => b.votes - a.votes

const Parties: React.FC = () => {
  const results = useResults()
  return (
    <ul className="foo px-3">
      {Object.values(results.parties)
        .sort(sortPartyResults)
        .map((partyResult) => (
          <PartyResult key={partyResult.party.id} {...partyResult} />
        ))}
    </ul>
  )
}

export const Results: React.FC = () => {
  return (
    <Subscribe source$={getResults$}>
      <Parties />
    </Subscribe>
  )
}
