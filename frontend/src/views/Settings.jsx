import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Switch,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";

import DynamicTable from "../components/layout/DynamicTable";
import urls from "../utility/urls";
import api from "../utility/api";

const { Column } = Table;
const { Text } = Typography;

export default function Admin() {
  const [data, setData] = useState(null);
  const user = useSelector((state) => state.user);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const tableRef = useRef(null);

  const updateField = (id, key, value) => {
    var data = {};
    data[key] = value;
    api.patch(urls.user(id), data).then((response) => {
      if (response) {
        try {
          tableRef.current.updateObject(response);
        } catch (error) {
          //pass
        }
        message.success("Settings Updated");
        if (id === user.id) {
          setData(response);
        }
      }
    });
  };

  const onFinish = () => {
    form.validateFields().then((values) => {
      api.patch(urls.user(user.id), values).then((response) => {
        if (response) {
          setData(response);
          setVisible(false);
          message.success("Password Updated");
        }
      });
    });
  };

  useEffect(() => {
    api.get(urls.user(user.id)).then((response) => {
      if (response) {
        setData(response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1 style={{ marginTop: "15px" }}>Profile Settings</h1>
      {data && (
        <div style={{ width: "85%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text>Name:</Text>
            <Text
              editable={{
                onChange: (val) => updateField(data.id, "first_name", val),
              }}
              style={{ marginLeft: "10px" }}
            >
              {data.first_name}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text>Name:</Text>
            <Text
              editable={{
                onChange: (val) => updateField(data.id, "last_name", val),
              }}
              style={{ marginLeft: "10px" }}
            >
              {data.last_name}
            </Text>
          </div>
          <Button
            type="primary"
            onClick={() => setVisible(true)}
            style={{ marginTop: "15px" }}
          >
            Change Password
          </Button>
          <Modal
            visible={visible}
            onCancel={() => {
              setVisible(false);
            }}
            onOk={onFinish}
          >
            <Form form={form} style={{ marginTop: "25px" }}>
              <Form.Item label="Old Password" name="old_password" required>
                <Input.Password />
              </Form.Item>
              <Form.Item label="New Password" name="new_password" required>
                <Input.Password />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
      {user.staff && (
        <>
          <h1 style={{ marginTop: "15px" }}>Admin Settings</h1>
          <DynamicTable ref={tableRef} url={urls.user()}>
            <Column
              title="Name"
              render={(text, record) =>
                `${record.first_name} ${record.last_name}`
              }
            />
            <Column
              title="Authorized"
              dataIndex="is_active"
              key="is_active"
              render={(text, record) => (
                <Switch
                  checked={record.is_active}
                  onChange={(checked) =>
                    updateField(record.id, "is_active", checked)
                  }
                />
              )}
            />
            <Column
              title="Admin"
              dataIndex="is_staff"
              key="is_staff"
              render={(text, record) => (
                <Switch
                  checked={record.is_staff}
                  onChange={(checked) =>
                    updateField(record.id, "is_staff", checked)
                  }
                />
              )}
            />
          </DynamicTable>
        </>
      )}
    </div>
  );
}
