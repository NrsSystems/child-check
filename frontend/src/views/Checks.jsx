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
  Radio,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";

import DynamicTable from "../components/layout/DynamicTable";
import urls from "../utility/urls";
import api from "../utility/api";

const { Column } = Table;
const { RangePicker } = DatePicker;

export default function Checks(props) {
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(false);
  const [range, setRange] = useState(false);
  const [form] = Form.useForm();
  const tableRef = useRef(null);

  const onFinish = () => {
    form.validateFields().then((values) => {
      var title;
      if (values.date) {
        values.date = values.date.format("YYYY-MM-DD");
        title = values.date;
      } else {
        values.range[0] = values.range[0].format("YYYY-MM-DD");
        values.range[1] = values.range[1].format("YYYY-MM-DD");
        title = `${values.range[0]}_${values.range[1]}`;
      }
      api.download("POST", urls.report, values).then((response) => {
        if (response) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${title}_childcheck_report.csv`);
          document.body.appendChild(link);
          link.click();
          setReport(false);
          setRange(false);
          form.resetFields();
        }
      });
    });
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
          onClick={() => setReport(true)}
        >
          Generate Report
        </Button>
        <Modal
          visible={report}
          onCancel={() => {
            setReport(false);
            setRange(false);
            form.resetFields();
          }}
          onOk={onFinish}
          title="Generate Report"
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Radio.Group
            size="middle"
            buttonStyle="solid"
            value={range}
            onChange={(val) => setRange(val.target.value)}
          >
            <Radio.Button value={false}>Date</Radio.Button>
            <Radio.Button value={true}>Range</Radio.Button>
          </Radio.Group>
          <div style={{ height: "25px" }} />
          <Form form={form}>
            {range ? (
              <Form.Item
                name="range"
                label="Range"
                rules={[{ required: true }]}
              >
                <RangePicker />
              </Form.Item>
            ) : (
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
            )}
          </Form>
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
            new Date(record.date + "T12:00:00").toLocaleDateString()
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
                {new Date(selected.date + "T12:00:00").toLocaleDateString()}
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
