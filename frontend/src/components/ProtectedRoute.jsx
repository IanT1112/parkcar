import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ children, allowedRoles }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) setSession(next);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) return <div>Cargando...</div>;
  if (!session) return <Navigate to="/login" replace />;

  const role = session.user.app_metadata?.role || "usuario";
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/usuario" replace />;
  }
  return children;
}

export default ProtectedRoute;

