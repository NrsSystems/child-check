import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Space, Button, Dropdown } from "antd";

import api from "../utility/api";
import urls from "../utility/urls";
import scanner from "../utility/scanner";

export default function Navbar(props) {
  const user = useSelector((state) => state.user);
  const devices = useSelector((state) => state.devices);
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
          <Space size="large">
            <Dropdown
              trigger={["click"]}
              overlay={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "white",
                    padding: "15px",
                  }}
                >
                  {devices === 0
                    ? "No Connections"
                    : `${devices} Connected Devices`}
                  <div
                    style={{
                      width: "90%",
                      borderTop: "1px solid lightgray",
                      marginBottom: "15px",
                    }}
                  />
                  <Button
                    onClick={() => {
                      navigator.serial
                        .requestPort({
                          filters: [
                            { usbVendorId: 0x0c27 },
                            { usbVendorId: 0x2dd6 },
                          ],
                        })
                        .then((port) => {
                          var info = port.getInfo();
                          if (scanner.VENDOR_IDS.includes(info.usbVendorId)) {
                            scanner.readStream(port);
                          }
                        })
                        .catch((e) => {
                          console.log(e);
                        });
                    }}
                  >
                    Scan for Devices
                  </Button>
                </div>
              }
              placement="bottomCenter"
            >
              <Button
                shape="round"
                style={
                  devices > 0
                    ? { background: "#5cb85c", color: "white", border: "none" }
                    : { background: "#e73f33", color: "white", border: "none" }
                }
              >
                Scanner
              </Button>
            </Dropdown>
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
          </Space>
        </div>
      )}
    </div>
  );
}
