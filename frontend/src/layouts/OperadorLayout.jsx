import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  ArrowLeftRight,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function OperadorLayout() {
  const navigate = useNavigate();
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };
  const menu = [
    {
      name: "Dashboard",
      path: "/operador",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Vehículos",
      path: "/operador/vehiculos",
      icon: Car,
    },
    {
      name: "Entradas y salidas",
      path: "/operador/movimientos",
      icon: ArrowLeftRight,
    },
    {
      name: "Pagos",
      path: "/operador/pagos",
      icon: CreditCard,
    },
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src="/favicon-32x32.png" alt="" />
          </div>

          <div>
            <h2>ParkCar</h2>
            <span>Operador</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-link logout-link" onClick={cerrarSesion}>
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default OperadorLayout;
