import { bind } from "@react-rxjs/core"
import { createListener } from "@react-rxjs/utils"
import { merge } from "rxjs"

const [selectResults$, onSelectResults] = createListener(() => true)
const [selectPrediction$, onSelectPrediction] = createListener(() => false)

export const [useIsResults, isResults$] = bind(
  merge(selectResults$, selectPrediction$),
  true,
)

const Button: React.FC<{ isSelected: boolean; onClick: () => void }> = ({
  children,
  isSelected,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full block px-4 py-1 rounded-none ${
      isSelected ? "bg-red-100 text-red-700" : ""
    }`}
  >
    {children}
  </button>
)

export const ResultsOrPrediction: React.FC = ({ children }) => {
  const isResults = useIsResults()
  return (
    <div className="divide-y divide-gray-200">
      <nav>
        <ul className="flex">
          <li className="flex-grow">
            <Button onClick={onSelectResults} isSelected={isResults}>
              Resultats
            </Button>
          </li>
          <li className="flex-grow">
            <Button onClick={onSelectPrediction} isSelected={!isResults}>
              Predicció
            </Button>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  )
}
