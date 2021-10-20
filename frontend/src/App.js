import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import Base from "./router/Base";
import store from "./redux/store";

import "./static/css/App.css";
import "antd/dist/antd.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Base />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
