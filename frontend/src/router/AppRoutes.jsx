import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import urls from "../utility/urls";
import Settings from "../views/Settings";
import Checks from "../views/Checks";
import Home from "../views/Home";
import Login from "../views/Login";
import Registry from "../views/Registry";
import Unauthorized from "../views/Unauthorized";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  var date = new Date();

  return (
    <Switch>
      <PrivateRoute exact path="/">
        <Home />
      </PrivateRoute>
      <PrivateRoute path="/registry">
        <Registry />
      </PrivateRoute>
      <PrivateRoute path="/today">
        <Checks
          title="Today's Check-Ins"
          url={urls.check(null, {
            date: `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(
              -2
            )}-${("0" + date.getDate()).slice(-2)}`,
          })}
        />
      </PrivateRoute>
      <PrivateRoute path="/all">
        <Checks title="All Check-Ins" url={urls.check()} />
      </PrivateRoute>
      <PrivateRoute path="/settings">
        <Settings />
      </PrivateRoute>
      <Route path="/unauthorized">
        <Unauthorized />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Redirect to="/" />
    </Switch>
  );
}
