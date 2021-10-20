import { message } from "antd";

import store from "../redux/store";
import urls from "./urls";

const axios = require("axios");

const refresh = () => {
  return axios
    .get(urls.login, { withCredentials: true })
    .then((response) => {
      store.dispatch({ type: "SET_USER", user: response.data });
      return response.data;
    })
    .catch((error) => {
      return null;
    });
};

const request = (method, url, headers, data, retry = true, progress = null) => {
  var state = store.getState();
  var user = state.user;
  headers["Authorization"] = `Bearer ${user ? user.token : null}`;
  return axios({
    method: method,
    url: url,
    headers: headers,
    withCredentials: true,
    data: data,
    onUploadProgress: progress,
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        if (error.response.status === 401 && retry) {
          return refresh().then((response) => {
            if (response) {
              return request(method, url, headers, data, false).then(
                (response) => {
                  return response;
                }
              );
            } else {
              return null;
            }
          });
        } else {
          if (error.response.data.detail) {
            message.error(error.response.data.detail);
          } else if (
            JSON.stringify(error.response.data).includes("doctype") ||
            JSON.stringify(error.response.data).includes("!DOCTYPE")
          ) {
            message.error(
              JSON.stringify(error.response.data)
                .split("title")[1]
                .replace(">", "")
                .replace("</", "")
            );
          } else {
            message.error(JSON.stringify(error.response.data));
          }
          return null;
        }
      } else {
        message.error("Server Unresponsive");
      }
    });
};

const jsonHeader = { "Content-Type": "application/json;charset=UTF-8" };

const api = {
  get: (url) => {
    return request("GET", url, {}, {});
  },
  retrieve: async (url) => {
    var results = [];
    while (url) {
      var response = await request("GET", url, {}, {});
      results = results.concat(response.results);
      url = results.next;
    }
    return results;
  },
  post: (url, data, progress = null) => {
    return request("POST", url, jsonHeader, data, true, progress);
  },
  put: (url, data) => {
    return request("PUT", url, jsonHeader, data);
  },
  patch: (url, data) => {
    return request("PATCH", url, jsonHeader, data);
  },
  delete: (url) => {
    return request("DELETE", url, {}, {});
  },
  refresh: () => {
    return refresh();
  },
};

export default api;
