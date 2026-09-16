import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginCompletePage from "../../features/auth/pages/LoginCompletePage";
import LoginPage from "../../features/auth/pages/LoginPage";
import { AppLayout } from "@/shared/components/AppLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import TeamPage from "@/features/team/pages/TeamPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/complete" element={<LoginCompletePage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/team/:id" element={<TeamPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace/>} />
      </Routes>
    </BrowserRouter>
  )
}
