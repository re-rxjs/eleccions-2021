import { PartyId } from "api/parties"
import { onPredictionChange, usePrediction } from "../state"

export const Form: React.FC<{ partyId: PartyId }> = ({ partyId }) => {
  const prediction = usePrediction(partyId)
  return (
    <div className="w-full">
      <input
        type="number"
        min="0"
        max="100"
        value={(prediction * 100).toFixed(2)}
        onChange={(e) => {
          onPredictionChange(partyId, Number(e.target.value) / 100)
        }}
      />
    </div>
  )
}
