import { createStore } from "redux";

const initialState = {
  user: null,
  devices: 0,
};

function checkState(state = initialState, action) {
  switch (action.type) {
    case "SET_USER":
      return Object.assign({}, state, {
        user: action.user,
      });
    case "SET_DEVICES":
      return Object.assign({}, state, {
        devices: action.devices,
      });
    default:
      return state;
  }
}

const store = createStore(checkState);

export default store;
