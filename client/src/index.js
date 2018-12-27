import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {PersistGate} from 'redux-persist/integration/react';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

var initialState = {
  loggedIn: false,
  account: {},
  profile: {},
  dialog: {
    message: '',
    cancel: '',
    ok: '',
    action: null
  },
  tweets: [],
  loading: false
}

function reducer(state=initialState, action) {
  switch(action.type) {
    case 'LOGGEDIN':
      return {...state, loggedIn: action.payload}
      break;
    case 'ACCOUNT':
      return {...state, account: action.payload}
      break;
    case 'PROFILE':
      return {...state, profile: action.payload}
      break;
    case 'DIALOG':
      return {...state, dialog: action.payload}
      break;
    case 'TWEETS':
      return {...state, tweets: action.payload}
      break;
    case 'LOADING':
      return {...state, loading: action.payload}
      break;
    default:
      return state;
      break;
  }
  //return state;
}

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, reducer)

let store = createStore(persistedReducer)
let persistor = persistStore(store)

store.subscribe(() => {
  console.log("store changed", store.getState());
});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

//serviceWorker();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
