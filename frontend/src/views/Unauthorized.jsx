import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, message } from "antd";
import api from "../utility/api";
import urls from "../utility/urls";

export default function Unauthorized() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const history = useHistory();

  const checkCredentials = () => {
    api.refresh().then((response) => {
      if (response && response.active) {
        message.success("Account Activated");
      } else {
        message.error("Account is not Activated");
      }
    });
  };

  useEffect(() => {
    if (user) {
      if (user.active) {
        history.push("/");
      }
    } else {
      history.push("/login");
    }
    // eslint-disable-next-line
  }, [user]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "25px",
      }}
    >
      <div
        className="main-text"
        style={{
          fontSize: "48px",
          fontWeight: "bold",
        }}
      >
        Please ask an Admin to activate your Account!
      </div>
      <div
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: "15px",
        }}
      >
        <Button type="primary" size="large" onClick={checkCredentials}>
          Check Credentials
        </Button>
        <Button
          type="primary"
          size="large"
          danger
          onClick={() => {
            api.delete(urls.login).then((response) => {
              if (response) {
                dispatch({ type: "SET_USER", user: null });
              }
            });
          }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
