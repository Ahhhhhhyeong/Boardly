import { createBrowserRouter } from "react-router-dom";
// import { AuthPage } from "../pages/AuthPage";
import App from "./App";

export const router = createBrowserRouter([
 {
    path: "/",
    element: <App />,
 },
]);