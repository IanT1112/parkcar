import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  ArrowLeftRight,
  CreditCard,
  BadgeDollarSign,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function AdminLayout() {
  const navigate = useNavigate();

  const volverPanelPrincipal = () => {
    navigate("/usuario");
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const menu = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Vehículos",
      path: "/admin/vehiculos",
      icon: Car,
    },
    {
      name: "Entradas y salidas",
      path: "/admin/movimientos",
      icon: ArrowLeftRight,
    },
    {
      name: "Pagos",
      path: "/admin/pagos",
      icon: CreditCard,
    },
    {
      name: "Tarifas",
      path: "/admin/tarifas",
      icon: BadgeDollarSign,
    },
    {
      name: "Configuración",
      path: "/admin/configuracion",
      icon: Settings,
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
            <span>Administrador</span>
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
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-link"
            onClick={volverPanelPrincipal}
          >
            <ArrowLeft size={20} />
            <span>Volver al panel principal</span>
          </button>

          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={cerrarSesion}
          >
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

export default AdminLayout;
