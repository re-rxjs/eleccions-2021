import { Results } from "./Results"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { Party } from "./Party"

export function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto max-w-4xl min-w-min">
        <Switch>
          <Route path="/party/:id" component={Party} />
          <Route>
            <Results />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  )
}
