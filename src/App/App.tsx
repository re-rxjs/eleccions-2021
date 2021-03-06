import { Results } from "./Results"
import { ResultsOrPrediction } from "./ResultsOrPrediction"
import { Router, Switch, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import { history } from "./history"

const partyPromise = import("./Party")
const LazyParty = lazy(() => partyPromise)
const Party = () => (
  <Suspense fallback={null}>
    <LazyParty />
  </Suspense>
)

export function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/party/:id" component={Party} />
        <Route>
          <ResultsOrPrediction />
          <Results />
        </Route>
      </Switch>
    </Router>
  )
}
