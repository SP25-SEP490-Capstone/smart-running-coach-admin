import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ToastContainer />
      <App />
    </LocalizationProvider>
  </BrowserRouter>
);

