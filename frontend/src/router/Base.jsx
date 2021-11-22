import React, { useEffect } from "react";
import { Layout } from "antd";

import AppRoutes from "./AppRoutes";
import Navbar from "./Navbar";
import scanner from "../utility/scanner";

const { Content } = Layout;

export default function Base() {
  useEffect(() => {
    navigator.serial.getPorts().then((ports) => {
      for (var port of ports) {
        var info = port.getInfo();
        if (scanner.VENDOR_IDS.includes(info.usbVendorId)) {
          scanner.readStream(port);
        }
      }
    });
  }, []);

  return (
    <Layout
      style={{
        paddingBottom: "4rem",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <Content style={{ width: "100%" }}>
        <div style={{ padding: "15px" }}>
          <AppRoutes />
        </div>
      </Content>
    </Layout>
  );
}
