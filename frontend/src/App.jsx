import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";

import MisPruebas from "./pages/usuario/MisPruebas.jsx";
import ProbarIA from "./pages/usuario/ProbarIA.jsx";
import UsuarioDashboard from "./pages/usuario/UsuarioDashboard.jsx";
import OperadorLayout from "./layouts/OperadorLayout.jsx";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Vehiculos from "./pages/admin/Vehiculos";
import Movimientos from "./pages/admin/Movimientos";
import Pagos from "./pages/admin/Pagos";
import Tarifas from "./pages/admin/Tarifas";
import Configuracion from "./pages/admin/Configuracion";

import OperadorDashboard from "./pages/operador/OperadorDashboard";
import PantallaSalida from "./pages/salida/PantallaSalida";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
        path="/usuario/ia"
        element={<ProtectedRoute><ProbarIA /></ProtectedRoute>}
      />

        <Route
          path="/usuario"
          element={<ProtectedRoute><UsuarioDashboard /></ProtectedRoute>}
        />

        <Route
          path="/usuario/pruebas"
          element={<ProtectedRoute><MisPruebas /></ProtectedRoute>}
        />

        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}
        >
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="vehiculos"
            element={<Vehiculos />}
          />

          <Route
            path="movimientos"
            element={<Movimientos />}
          />

          <Route
            path="pagos"
            element={<Pagos />}
          />

          <Route
            path="tarifas"
            element={<Tarifas />}
          />

          <Route
            path="configuracion"
            element={<Configuracion />}
          />
        </Route>

        <Route
          path="/operador"
          element={<ProtectedRoute allowedRoles={["admin", "operador"]}><OperadorLayout /></ProtectedRoute>}
        >
          <Route
            index
            element={<OperadorDashboard />}
          />

          <Route
            path="vehiculos"
            element={<Vehiculos />}
          />

          <Route
            path="movimientos"
            element={<Movimientos />}
          />

          <Route
            path="pagos"
            element={<Pagos />}
          />
        </Route>

        <Route
          path="/salida"
          element={<PantallaSalida />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
