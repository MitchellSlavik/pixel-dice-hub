import React from "react";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import "./App.css";

import Animations from "./pages/animations/Animations";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <Animations />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
