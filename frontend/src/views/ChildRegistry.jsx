import React, { useState, useRef } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Typography,
  List,
  Card,
  Image,
  message,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import urls from "../utility/urls";
import DynamicTable from "../components/layout/DynamicTable";
import api from "../utility/api";
import DebounceSelect from "../components/layout/DebounceSelect";
import formatter from "../utility/formatter";

const { Column } = Table;
const { Paragraph } = Typography;

export default function ChildRegistry() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form] = Form.useForm();
  const tableRef = useRef(null);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinished = () => {
    form.validateFields().then((values) => {
      var data = new FormData();
      data.append("first_name", values.first_name);
      data.append("last_name", values.last_name);
      data.append("child_id", values.child_id);
      if (values.photo.length !== 0) {
        data.append("photo", values.photo[0].originFileObj);
      }
      if (values.guardians) {
        data.append(
          "guardians",
          values.guardians.map((obj) => obj.value)
        );
      }
      api.post(urls.child(null), data).then((response) => {
        if (response) {
          message.success("Child Added");
          tableRef.current.resetTable();
          setVisible(false);
          form.resetFields();
        }
      });
    });
  };

  async function fetchUserList(name) {
    return api.get(urls.guardian(null, { name: name })).then((body) =>
      body.results.map((guardian) => ({
        label: `${guardian.first_name} ${guardian.last_name}`,
        value: guardian.id,
      }))
    );
  }

  const updateField = (key, value) => {
    var data = new FormData();
    data.append(key, value);
    api.patch(urls.child(selected.id), data).then((response) => {
      if (response) {
        setSelected(response);
        tableRef.current.updateObject(response);
        message.success("Profile Updated");
      }
    });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1 style={{ marginTop: "15px" }}>Child Registry</h1>
      <div
        style={{ width: "85%", display: "flex", justifyContent: "flex-end" }}
      >
        <Button
          type="primary"
          style={{ marginBottom: "15px", marginRight: 0, right: 0 }}
          onClick={() => setVisible(true)}
        >
          Add Child
        </Button>
        <Modal
          visible={visible}
          title="Add Child"
          onCancel={() => {
            setVisible(false);
          }}
          onOk={onFinished}
        >
          <Form form={form} initialValues={{ photo: [] }}>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true, message: "Please input first name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true, message: "Please input last name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Id"
              name="child_id"
              rules={[{ required: true, message: "Please input child id!" }]}
            >
              <Input maxLength={16} />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.photo !== currentValues.photo
              }
            >
              {({ getFieldValue }) => (
                <Form.Item
                  name="photo"
                  label="Photo"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    name="photo"
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/jpeg,image/png"
                    listType="picture-card"
                    previewFile={(file) =>
                      new Promise((resolve, reject) =>
                        resolve(URL.createObjectURL(file))
                      )
                    }
                  >
                    {getFieldValue("photo").length === 0 ? (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    ) : null}
                  </Upload>
                </Form.Item>
              )}
            </Form.Item>
            <Form.Item name="guardians" label="Guardians">
              <DebounceSelect
                mode="multiple"
                placeholder="Select users"
                fetchOptions={fetchUserList}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <DynamicTable ref={tableRef} url={urls.child()}>
        <Column
          title="First Name"
          dataIndex="first_name"
          key="first_name"
          sorter={true}
          filterDropdown={({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => (
            <div style={{ padding: 8 }}>
              <Input
                placeholder={`Search First Name`}
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
          title="Last Name"
          dataIndex="last_name"
          key="last_name"
          sorter={true}
          filterDropdown={({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => (
            <div style={{ padding: 8 }}>
              <Input
                placeholder={`Search Last Name`}
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
        title="Child Profile"
        visible={selected}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected && (
          <div>
            {selected.photo && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                Photo:
                <div style={{ marginLeft: "15px" }}>
                  <Image
                    style={{ width: "200px" }}
                    src={urls.photo(selected.photo)}
                  />
                </div>
              </div>
            )}
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/jpeg,image/png"
              showUploadList={false}
              onChange={(info) => updateField("photo", info.file)}
            >
              <Button
                style={{ marginBottom: "15px" }}
                icon={<UploadOutlined />}
              >
                Replace Photo
              </Button>
            </Upload>
            <div style={{ display: "flex", flexDirection: "row" }}>
              First Name:
              <Paragraph
                style={{ marginLeft: "15px" }}
                editable={{ onChange: (val) => updateField("first_name", val) }}
              >
                {selected.first_name}
              </Paragraph>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              Last Name:
              <Paragraph
                style={{ marginLeft: "15px" }}
                editable={{ onChange: (val) => updateField("last_name", val) }}
              >
                {selected.last_name}
              </Paragraph>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              Id:
              <Paragraph
                style={{ marginLeft: "15px" }}
                editable={{
                  onChange: (val) => updateField("child_id", val),
                  maxLength: 16,
                }}
              >
                {selected.child_id}
              </Paragraph>
            </div>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              Guardians
            </div>
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={selected.guardians.concat([{ add: true }])}
              renderItem={(item) => (
                <List.Item>
                  {item.add ? (
                    <Card title="Add Guardian">
                      <DebounceSelect
                        mode="multiple"
                        placeholder="Add Guardian"
                        fetchOptions={fetchUserList}
                        onChange={(val) => updateField("add", val[0].value)}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Card>
                  ) : (
                    <Card
                      title={`${item.first_name} ${item.last_name}`}
                      actions={[
                        <DeleteOutlined
                          onClick={() => updateField("remove", item.id)}
                        />,
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
                  )}
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
