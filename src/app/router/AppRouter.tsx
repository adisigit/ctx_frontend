import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginCompletePage from "../../features/auth/pages/LoginCompletePage";
import LoginPage from "../../features/auth/pages/LoginPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/complete" element={<LoginCompletePage />} />
        <Route path="*" element={<Navigate to="/login" replace/>} />
      </Routes>
    </BrowserRouter>
  )
}
