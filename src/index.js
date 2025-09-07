import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import Context from "./context/LoginContext";
import NoInternetWrapper from './context/NoInternetWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Context>
      <BrowserRouter>
        <NoInternetWrapper>
          <App />
        </NoInternetWrapper>
      </BrowserRouter>
    </Context>
  </React.StrictMode>
);

