import React from "react";
import { Layout } from "antd";

import AppRoutes from "./AppRoutes";
import Navbar from "./Navbar";

const { Content } = Layout;

export default function Base() {
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
