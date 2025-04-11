import React from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import Todo from "./pages/Todo";
import Course from "./pages/Course";
import StudentDetail from "./pages/StudentDetail";
import Reports from "./pages/Reports";
import TeacherFiles from "./pages/TeacherFiles";
import Leaderboard from "./pages/Leaderboard";
import StudentFiles from "./pages/StudentFiles";
import RegisterStudent from "./pages/RegisterStudent";
import AuthWrapper from "./components/AuthWrapper";
import DashboardLayout from "./components/DashboardLayout";

const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/admin",
    element: <AdminPanel />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/todo",
    element: <Todo />,
  },
  {
    path: "/student/:id",
    element: <StudentDetail />,
  },
  {
    path: "/course/:id",
    element: <Course />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/teacher/files",
    element: <TeacherFiles />,
  },
  {
    path: "/student/files",
    element: <StudentFiles />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
  {
    path: "/register-student",
    element: (
      <AuthWrapper roles={["admin"]}>
        <DashboardLayout>
          <RegisterStudent />
        </DashboardLayout>
      </AuthWrapper>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
