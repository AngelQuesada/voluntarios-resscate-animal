"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import { UserRoles } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { CircularProgress, Box } from "@mui/material";
import { use } from "react";

export default function AdminPage(){

  
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Solo redirigir si NO estamos cargando Y el usuario no es administrador
    if (!loading && user && !user.roles?.includes(UserRoles.ADMINISTRADOR)) {
      router.push("/schedule");
    }
  }, [router, user, loading]);

  // Mostrar un indicador de carga mientras verificamos la autenticación
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <main className="flex justify-center items-center h-screen bg-background">
      <AdminPanel />
    </main>
  );
}
