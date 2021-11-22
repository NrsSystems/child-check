import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Typography,
  Image,
  message,
} from "antd";
import { PlusOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";

import urls from "../utility/urls";
import DynamicTable from "../components/layout/DynamicTable";
import api from "../utility/api";

const { Column } = Table;
const { Paragraph } = Typography;

export default function GuardianRegistry() {
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
      data.append("guardian_id", values.guardian_id);
      if (values.phone_number) {
        data.append("phone_number", values.prefix + values.phone_number);
      }
      if (values.photo.length !== 0) {
        data.append("photo", values.photo[0].originFileObj);
      }
      api.post(urls.guardian(null), data).then((response) => {
        if (response) {
          message.success("Guardian Added");
          tableRef.current.resetTable();
          setVisible(false);
          form.resetFields();
        }
      });
    });
  };

  const updateField = (key, value) => {
    var data = new FormData();
    data.append(key, value);
    api.patch(urls.guardian(selected.id), data).then((response) => {
      if (response) {
        setSelected(response);
        tableRef.current.updateObject(response);
        message.success("Profile Updated");
      }
    });
  };

  const enterId = (event) => {
    if (selected) {
      updateField("guardian_id", event.detail);
    } else {
      form.setFieldsValue({ guardian_id: event.detail });
    }
  };

  useEffect(() => {
    if (selected) {
      document.addEventListener("submit-barcode", enterId);
    } else {
      document.removeEventListener("submit-barcode", enterId);
      document.addEventListener("submit-barcode", enterId);
    }
    return () => {
      document.removeEventListener("submit-barcode", enterId);
    };
    // eslint-disable-next-line
  }, [selected]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1 style={{ marginTop: "15px" }}>Guardian Registry</h1>
      <div
        style={{ width: "85%", display: "flex", justifyContent: "flex-end" }}
      >
        <Button
          type="primary"
          style={{ marginBottom: "15px", right: 0 }}
          onClick={() => setVisible(true)}
        >
          Add Guardian
        </Button>
        <Modal
          visible={visible}
          title="Add Guardian"
          onCancel={() => {
            setVisible(false);
          }}
          onOk={onFinished}
        >
          <Form
            form={form}
            initialValues={{ id_type: "id", prefix: "+1", photo: [] }}
          >
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
              name="guardian_id"
              rules={[{ required: true, message: "Please input id!" }]}
            >
              <Input maxLength={16} />
            </Form.Item>
            <Form.Item name="phone_number" label="Phone Number">
              <Input
                addonBefore={
                  <Form.Item name="prefix" noStyle>
                    <Select style={{ width: 70 }} defaultValue="+1">
                      <Select.Option value="+1">+1</Select.Option>
                    </Select>
                  </Form.Item>
                }
                style={{ width: "100%" }}
              />
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
          </Form>
        </Modal>
      </div>
      <DynamicTable ref={tableRef} url={urls.guardian()}>
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
        title="Guardian Profile"
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
              Phone Number:
              <Paragraph
                style={{ marginLeft: "15px" }}
                editable={{
                  onChange: (val) => updateField("phone_number", val),
                }}
              >
                {selected.phone_number}
              </Paragraph>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              Id:
              <Paragraph
                style={{ marginLeft: "15px" }}
                editable={{
                  onChange: (val) => updateField("guardian_id", val),
                  maxLength: 16,
                }}
              >
                {selected.guardian_id}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
