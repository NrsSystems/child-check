import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Input, Modal, List, Card, Image, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import onScan from "onscan.js";

import urls from "../utility/urls";
import api from "../utility/api";

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [form] = Form.useForm();
  const inputRef = useRef(null);

  const onFinish = () => {
    form.validateFields().then((values) => {
      scanId(values.id);
      form.resetFields();
    });
  };

  const scanId = (id) => {
    api.get(urls.scan({ id: id })).then((response) => {
      if (response) {
        setSelected(response);
      } else {
        inputRef.current.focus({
          cursor: "start",
        });
      }
      form.resetFields();
    });
  };

  useEffect(() => {
    inputRef.current.focus({
      cursor: "start",
    });
  }, [selected]);

  useEffect(() => {
    onScan.attachTo(document, {
      suffixKeyCodes: [13],
      onScan: function (sCode, iQty) {
        scanId(sCode.substring(0, 12));
      },
    });
    return () => {
      onScan.detachFrom(document);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Link to="/today">
          <Button style={{ fontSize: "25px" }} type="link">
            Today's Roster
          </Button>
        </Link>
        <Link to="/all">
          <Button style={{ fontSize: "25px" }} type="link">
            All Records
          </Button>
        </Link>
      </div>
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
          Scan or Enter Id
        </div>
        <Form form={form} style={{ padding: "25px" }} onFinish={onFinish}>
          <Form.Item
            name="id"
            label="Id"
            rules={[
              {
                required: true,
                message: "Please input your id!",
              },
            ]}
          >
            <Input
              ref={inputRef}
              maxLength={12}
              prefix={<LockOutlined />}
              placeholder="Id"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title={selected ? `${selected.first_name} ${selected.last_name}` : ""}
          visible={selected}
          onCancel={() => setSelected(null)}
          footer={null}
        >
          {selected && selected.child_id ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Image
                style={{ width: "250px" }}
                src={
                  selected && selected.photo ? urls.photo(selected.photo) : null
                }
              />
              <Button
                type="primary"
                style={{ marginTop: "15px" }}
                onClick={() => {
                  api
                    .post(urls.check(), { child: selected.id })
                    .then((response) => {
                      if (response) {
                        message.success("Check In Successful");
                        setSelected(null);
                      }
                    });
                }}
              >
                Check In
              </Button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Image
                  style={{ width: "250px" }}
                  src={
                    selected && selected.photo
                      ? urls.photo(selected.photo)
                      : null
                  }
                />
              </div>
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Children
              </div>
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={selected ? selected.children : []}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                      title={`${item.first_name} ${item.last_name}`}
                      actions={[
                        item.present ? (
                          <Button
                            onClick={() => {
                              api
                                .patch(urls.check(item.present), {
                                  out_guardian: selected.id,
                                })
                                .then((response) => {
                                  if (response) {
                                    message.success("Check Out Successful");
                                    if (selected.children.length === 1) {
                                      setSelected(null);
                                    }
                                  }
                                });
                            }}
                          >
                            Check Out
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              api
                                .post(urls.check(), { child: item.id })
                                .then((response) => {
                                  if (response) {
                                    message.success("Check In Successful");
                                    setSelected(null);
                                  }
                                });
                            }}
                          >
                            Check In
                          </Button>
                        ),
                      ]}
                    >
                      <Image
                        style={{ width: "150px" }}
                        src={urls.photo(item.photo)}
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
