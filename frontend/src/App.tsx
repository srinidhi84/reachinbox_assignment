import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Login always first */}
      <Route path="/" element={<Login />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
