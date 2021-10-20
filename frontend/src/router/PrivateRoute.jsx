import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";

export default function PrivateRoute({ children, ...rest }) {
  const user = useSelector((state) => state.user);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        user !== null && user.active ? (
          children
        ) : user ? (
          <Redirect
            to={{ pathname: "/unauthorized", state: { from: location } }}
          />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
