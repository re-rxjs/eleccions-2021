import { Party } from "api/parties"

export const PartyResult: React.FC<{
  party: Party
  sits: number
  votes: number
  percent: number
}> = ({ party, sits, votes, percent }) => (
  <div className="foo">
    <div className="foo" style={{ backgroundColor: party.color }}>
      {sits}
    </div>
    <div className="foo">
      <span className="asdf">{party.name}</span>
      <div className="asdf">
        <div
          className="asdf"
          style={{ backgroundColor: party.color, width: percent + "%" }}
        ></div>
      </div>
      <div className="asdf">
        <span className="asdf">{votes}</span>
        <span className="asdf">- {percent}%</span>
      </div>
    </div>
  </div>
)
