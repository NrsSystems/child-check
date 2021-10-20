import React, { useRef, useState } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Image,
  DatePicker,
  Input,
  Form,
  List,
  Card,
  message,
} from "antd";
import { EyeOutlined, LogoutOutlined } from "@ant-design/icons";

import DynamicTable from "../components/layout/DynamicTable";
import urls from "../utility/urls";
import DebounceSelect from "../components/layout/DebounceSelect";
import api from "../utility/api";
import formatter from "../utility/formatter";

const { Column } = Table;

export default function Checks(props) {
  const [selected, setSelected] = useState(null);
  const [manual, setManual] = useState(null);
  const [form] = Form.useForm();
  const tableRef = useRef(null);

  async function fetchUserList(name) {
    return api.get(urls.child(null, { name: name })).then((body) =>
      body.results.map((child) => ({
        label: `${child.first_name} ${child.last_name}`,
        value: child.id,
      }))
    );
  }

  const onFinished = () => {
    if (typeof manual === "object" && manual !== null) {
      setManual(null);
    } else {
      form.validateFields().then((values) => {
        if (values.child) {
          api
            .post(urls.check(), { child: values.child[0].value })
            .then((response) => {
              if (response) {
                message.success("Check In Successful");
                form.resetFields();
                setManual(null);
                tableRef.current.resetTable();
              }
            });
        } else {
          message.error("Please select a Child to check in!");
        }
      });
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1 style={{ marginTop: "15px" }}>{props.title}</h1>
      <div
        style={{ width: "85%", display: "flex", justifyContent: "flex-end" }}
      >
        <Button
          type="primary"
          style={{ marginBottom: "15px", right: 0 }}
          onClick={() => setManual(true)}
        >
          Manual Check-In
        </Button>
        <Modal
          title={
            typeof manual === "object" && manual !== null
              ? "Check-Out"
              : "Check-In"
          }
          visible={manual}
          onOk={onFinished}
          onCancel={() => {
            setManual(null);
            form.resetFields();
          }}
        >
          {typeof manual === "object" && manual !== null ? (
            <div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingBottom: "15px",
                }}
              >
                <Image
                  style={{ width: "250px" }}
                  src={urls.photo(manual.photo)}
                />
                {`${manual.first_name} ${manual.last_name}`}
              </div>
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={manual.guardians}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      title={`${item.first_name} ${item.last_name}`}
                      actions={[
                        <Button
                          onClick={() => {
                            api
                              .patch(urls.check(manual.check_id), {
                                out_guardian: item.id,
                              })
                              .then((response) => {
                                if (response) {
                                  message.success("Check Out Successful");
                                  setManual(null);
                                  tableRef.current.updateObject(response);
                                }
                              });
                          }}
                        >
                          Check Out
                        </Button>,
                      ]}
                    >
                      <Image
                        style={{ width: "150px" }}
                        src={urls.photo(item.photo)}
                      />
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        Phone:
                        <div style={{ marginLeft: "15px" }}>
                          {formatter.phoneNumber(item.phone_number)}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <Form form={form}>
              <Form.Item name="child" label="Child">
                <DebounceSelect
                  mode="multiple"
                  placeholder="Select Child"
                  fetchOptions={fetchUserList}
                  single
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
      <DynamicTable ref={tableRef} url={props.url}>
        <Column
          title="Child"
          dataIndex="child"
          key="child"
          render={(text, record) =>
            `${record.child.first_name} ${record.child.last_name}`
          }
          filterDropdown={({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => (
            <div style={{ padding: 8 }}>
              <Input
                placeholder={`Search Children`}
                value={selectedKeys[0]}
                onChange={(e) =>
                  setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={confirm}
                style={{ width: 188, marginBottom: 8, display: "block" }}
              />
              <div className="ant-table-filter-dropdown-btns">
                <Button type="link" size="small" onClick={clearFilters}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => confirm({ closeDropdown: true })}
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        />
        <Column
          title="Date"
          dataIndex="date"
          key="date"
          render={(text, record) =>
            new Date(record.date + " PDT").toLocaleDateString()
          }
          sorter={true}
          filterDropdown={({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => (
            <div style={{ padding: 8 }}>
              <DatePicker
                value={selectedKeys.length === 0 ? null : selectedKeys[0]}
                onChange={(date, dateString) =>
                  setSelectedKeys([date, dateString])
                }
              />
              <div className="ant-table-filter-dropdown-btns">
                <Button type="link" size="small" onClick={clearFilters}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => confirm({ closeDropdown: true })}
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        />
        <Column
          title="In time"
          dataIndex="in_time"
          key="in_time"
          responsive={["md"]}
          render={(text, record) =>
            new Date(record.date + "T" + record.in_time).toLocaleTimeString(
              "en-US",
              {
                hour: "numeric",
                minute: "2-digit",
              }
            )
          }
          sorter={true}
        />
        <Column
          title="Out time"
          dataIndex="out_time"
          key="out_time"
          responsive={["md"]}
          render={(text, record) =>
            record.out_time
              ? new Date(
                  record.date + "T" + record.out_time
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : null
          }
          sorter={true}
          filterMultiple={false}
          filters={[
            { text: "Present", value: true },
            { text: "Checked Out", value: false },
          ]}
        />
        <Column
          title="Action"
          key="action"
          render={(text, record) => (
            <Space size="middle">
              <Button
                icon={<EyeOutlined />}
                onClick={() => setSelected(record)}
              />
              {!record.out_time && (
                <Button
                  icon={<LogoutOutlined />}
                  onClick={() =>
                    api.get(urls.child(record.child.id)).then((response) => {
                      if (response) {
                        response.check_id = record.id;
                        setManual(response);
                      }
                    })
                  }
                />
              )}
            </Space>
          )}
        />
      </DynamicTable>
      <Modal
        title="Check-In Details"
        visible={selected}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected && (
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%", alignItems: "center" }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              Date:
              <div style={{ marginLeft: "15px" }}>
                {new Date(selected.date + " PDT").toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              In-Time:
              <div style={{ marginLeft: "15px" }}>
                {new Date(
                  selected.date + "T" + selected.in_time
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              Out-Time:
              <div style={{ marginLeft: "15px" }}>
                {selected.out_time
                  ? new Date(
                      selected.date + "T" + selected.out_time
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : null}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              Child:
              <div style={{ marginLeft: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ width: "200px" }}
                    src={urls.photo(selected.child.photo)}
                  />
                  {`${selected.child.first_name} ${selected.child.last_name}`}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              Guardian:
              <div style={{ marginLeft: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ maxWidth: "200px" }}
                    src={urls.photo(selected.out_guardian.photo)}
                  />
                  {`${selected.out_guardian.first_name} ${selected.out_guardian.last_name}`}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              Supervisor:
              <div style={{ marginLeft: "15px" }}>
                {`${selected.out_supervisor.first_name} ${selected.out_supervisor.last_name}`}
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}
