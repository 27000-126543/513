import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { TaskList } from "@/pages/Tasks/TaskList";
import { TaskDetail } from "@/pages/Tasks/TaskDetail";
import { NewTask } from "@/pages/Tasks/NewTask";
import { Alerts } from "@/pages/Alerts/Alerts";
import { Reports } from "@/pages/Reports/Reports";
import { Recommendations } from "@/pages/Recommendations/Recommendations";
import { Approvals } from "@/pages/Approvals/Approvals";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="tasks/new" element={<NewTask />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="approvals" element={<Approvals />} />
        </Route>
      </Routes>
    </Router>
  );
}
