import { getParties, PartyId } from "api/parties"
import { FC } from "react"
import { useHistory, useParams } from "react-router"
import { Link } from "react-router-dom"
import { getTextColor } from "utils/color"
import { Logo } from "./Logo"

export const Party: FC = () => {
  const match = useParams<{ id: PartyId }>()
  const party = getParties()[match.id]
  const history = useHistory()
  console.log({ history })

  const backBtn =
    history.action === "PUSH" ? (
      <div className="cursor-pointer" onClick={history.goBack}>
        🡸
      </div>
    ) : (
      <Link to="/">🡸</Link>
    )

  return (
    <div
      className={`${getTextColor(party.color)} min-h-screen `}
      style={{ backgroundColor: party.color }}
    >
      <div className={`p-2 flex gap-2`}>
        {backBtn}
        <div>{party.name}</div>
      </div>
      <Logo
        party={match.id}
        className="max-w-full max-h-40 bg-white p-2 rounded-xl m-auto"
      />
    </div>
  )
}
