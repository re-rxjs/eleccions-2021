import { Subscribe } from "@react-rxjs/core"
import { Provinces } from "api/provinces"
import { PartyResult } from "./PartyResult"
import { useResults, getResults$, PartyResults } from "./results.state"

const sortPartyResults = (a: PartyResults, b: PartyResults) => b.votes - a.votes

const Parties: React.FC<{ province?: Provinces }> = ({ province }) => {
  const results = useResults(province)
  return (
    <ul className="foo">
      {Object.values(results.parties)
        .sort(sortPartyResults)
        .map((partyResult) => (
          <li className="bar" key={partyResult.party.id}>
            <PartyResult {...partyResult} />
          </li>
        ))}
    </ul>
  )
}

export const Results: React.FC<{ province?: Provinces }> = ({ province }) => {
  return (
    <Subscribe source$={getResults$(province)}>
      <Parties province={province} />
    </Subscribe>
  )
}
