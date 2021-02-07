import { Results } from "./Results"
import { Router, Switch, Route } from "react-router-dom"
import { Party } from "./Party"
import { history } from "./history"

export function App() {
  return (
    <Router history={history}>
      <div className="container mx-auto max-w-4xl min-w-min">
        <Switch>
          <Route path="/party/:id" component={Party} />
          <Route>
            <Results />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
