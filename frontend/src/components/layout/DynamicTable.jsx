import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Table } from "antd";

import api from "../../utility/api";
import urls from "../../utility/urls";

const DynamicTable = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 100,
  });

  const handleChange = (pagination, filters, sorter) => {
    setLoading(true);
    setPagination(pagination);
    var params = {};
    var url = new URL(props.url.href);

    if (pagination.current !== 1) {
      params["offset"] = (pagination.current - 1) * pagination.pageSize;
    }

    params["limit"] = pagination.pageSize;

    for (var filter of Object.keys(filters)) {
      if (filters[filter]) {
        if (filter === "date") {
          params[filter] = filters[filter][1];
        } else {
          params[filter] = filters[filter][0];
        }
      }
    }

    if (sorter.order) {
      if (sorter.order === "ascend") {
        params["order_by"] = sorter.field;
      } else {
        params["order_by"] = "-" + sorter.field;
      }
    }

    api.get(urls.addQuery(url, params)).then((response) => {
      if (response) {
        setData(response.results);
        setPagination(Object.assign({}, pagination, { total: response.count }));
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    api.get(props.url).then((response) => {
      if (response) {
        setData(response.results);
        setPagination(Object.assign({}, pagination, { total: response.count }));
        setLoading(false);
      }
    });
    // eslint-disable-next-line
  }, []);

  const resetTable = () => {
    handleChange(Object.assign({}, pagination, { current: 1 }), {}, {});
  };

  const updateObject = (object) => {
    const id = object.id;
    let arr = [...data];
    arr.find((obj, i) => {
      if (obj.id === id) {
        arr[i] = object;
        setData(arr);
        return true;
      }
      return false;
    });
  };

  useImperativeHandle(ref, () => ({
    resetTable,
    updateObject,
  }));

  return (
    <Table
      dataSource={data}
      style={{ width: "85%" }}
      pagination={pagination}
      onChange={handleChange}
      rowKey="id"
      loading={loading}
      expandable={{ childrenColumnName: "table_children" }}
    >
      {props.children}
    </Table>
  );
});

export default DynamicTable;
