import { createStore } from "redux";

const initialState = {
  user: null,
};

function checkState(state = initialState, action) {
  switch (action.type) {
    case "SET_USER":
      return Object.assign({}, state, {
        user: action.user,
      });
    default:
      return state;
  }
}

const store = createStore(checkState);

export default store;
