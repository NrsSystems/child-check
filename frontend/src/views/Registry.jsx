import React from "react";
import { Radio } from "antd";
import {
  Redirect,
  Switch,
  Route,
  useLocation,
  useRouteMatch,
  useHistory,
} from "react-router-dom";

import ChildRegistry from "./ChildRegistry";
import GuardianRegistry from "./GuardianRegistry";

export default function Registry() {
  const location = useLocation();
  let history = useHistory();
  let { path } = useRouteMatch();

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "25px",
        }}
      >
        <Radio.Group size="large" buttonStyle="solid" value={location.pathname}>
          <Radio.Button
            style={{ width: "25vw", textAlign: "center" }}
            value="/registry/children"
            onClick={() => history.push("/registry/children")}
          >
            Children
          </Radio.Button>
          <Radio.Button
            style={{ width: "25vw", textAlign: "center" }}
            value="/registry/guardians"
            onClick={() => history.push("/registry/guardians")}
          >
            Guardians
          </Radio.Button>
        </Radio.Group>
      </div>
      <div style={{ width: "100%" }}>
        <Switch>
          <Route path={`${path}/children`}>
            <ChildRegistry />
          </Route>
          <Route path={`${path}/guardians`}>
            <GuardianRegistry />
          </Route>
          <Redirect from="/registry" to="/registry/children" />
          <Redirect to="/" />
        </Switch>
      </div>
    </div>
  );
}
