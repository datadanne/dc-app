import { Buffer } from "buffer";
window.Buffer = Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { Provider } from "react-redux";
import store from "./redux/store";

import "./globals.css";

import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <>
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  </>
  // </React.StrictMode>,
);
