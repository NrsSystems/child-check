import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Space } from "antd";

import api from "../utility/api";
import urls from "../utility/urls";

export default function Navbar(props) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  return (
    <div
      className="background"
      id="Navbar"
      style={{
        display: "flex",
        top: 0,
        width: "100%",
        zIndex: 10,
        boxShadow: "rgba(0,0,0,.10) 0 3px 11px 0",
        transition: "top 0.3s",
      }}
    >
      {user && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "15px",
            paddingRight: "25px",
            width: "100%",
          }}
        >
          <Space
            size="large"
            className="nav-desktop"
            style={{ display: "flex", flexDirection: "row" }}
          >
            <Link to="/">Check In/Out</Link>
            <Link to="/registry">Registry</Link>
            <Link to="/settings">Settings</Link>
          </Space>
          <Link
            to="/login"
            onClick={() => {
              api.delete(urls.login).then((response) => {
                if (response) {
                  dispatch({ type: "SET_USER", user: null });
                }
              });
            }}
          >
            Log Out
          </Link>
        </div>
      )}
    </div>
  );
}
