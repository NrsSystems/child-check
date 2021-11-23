import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import api from "../utility/api";
import urls from "../utility/urls";
import scanner from "../utility/scanner";

export default function Login() {
  let history = useHistory();
  let location = useLocation();
  const dispatch = useDispatch();
  let { from } = location.state || {
    from: { pathname: "/" },
  };
  const [signup, setSignup] = useState(false);
  const [form] = Form.useForm();

  const onFinish = () => {
    form.validateFields().then((values) => {
      if (signup) {
        api.post(urls.login, values).then((response) => {
          if (response) {
            dispatch({ type: "SET_USER", user: response });
            history.replace(from);
          } else {
            form.resetFields(["password"]);
          }
        });
      } else {
        api.put(urls.login, values).then((response) => {
          if (response) {
            dispatch({ type: "SET_USER", user: response });
            history.replace(from);
          } else {
            form.resetFields(["password"]);
          }
        });
      }
    });
  };

  const autoLogin = () => {
    api.refresh().then((response) => {
      if (response) {
        dispatch({ type: "SET_USER", user: response });
        history.replace(from);
      }
    });
  };

  // eslint-disable-next-line
  useEffect(autoLogin, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
      }}
    >
      <div
        className="main-text"
        style={{
          fontSize: "48px",
          fontWeight: "bold",
        }}
      >
        Child Check
      </div>
      <Form form={form} style={{ padding: "25px" }}>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your E-mail!",
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
          hasFeedback={signup}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        {signup && (
          <>
            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject();
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[
                {
                  required: true,
                  message: "Please input your First Name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[
                {
                  required: true,
                  message: "Please input your Last Name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              onFinish();
              if (window.process) {
                try {
                  var port = await navigator.serial.requestPort({
                    filters: [{ usbVendorId: 0x2dd6 }],
                  });
                  var info = port.getInfo();
                  if (scanner.VENDOR_IDS.includes(info.usbVendorId)) {
                    scanner.readStream(port);
                  }
                } catch (e) {
                  console.log(e);
                }
                try {
                  port = await navigator.serial.requestPort({
                    filters: [{ usbVendorId: 0x0c27 }],
                  });
                  info = port.getInfo();
                  if (scanner.VENDOR_IDS.includes(info.usbVendorId)) {
                    scanner.readStream(port);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            }}
            style={{ width: "100%" }}
          >
            {signup ? "Sign Up" : "Log In"}
          </Button>
        </Form.Item>
        <Form.Item>
          {signup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Button
            onClick={() => setSignup(!signup)}
            type="link"
            style={{ paddingLeft: "5px" }}
          >
            {signup ? "Login here!" : "Signup now!"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
