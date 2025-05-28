"use client";
import React, { useState, useEffect } from "react";
import { Container, Paper, Avatar, Typography, CssBaseline } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { useResidualStateCleanup } from "@/hooks/useResidualStateCleanup";
import SignInForm from "./sign-in/SignInForm";
import Copyright from "./Copyright";
import { containerStyles, paperStyles } from "@/styles/formStyles";

const SignIn = () => {
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();

  const { performCleanup } = useResidualStateCleanup({
    onTimeout: () => {
      console.warn('Se detectó un posible estado colgado en el login');
      // Forzar un refresh suave si es necesario
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
    timeoutMs: 20000,
    storageKeys: ['loginFormState', 'authRedirectPending', 'loginTimeout', 'firebaseAuthState']
  });
  
  useEffect(() => {
    setIsMounted(true);
    
    // Limpieza adicional específica para el componente de login
    if (typeof window !== 'undefined') {
      // En móviles, forzar un repaint para evitar estados visuales colgados
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Forzar recálculo de estilos
        document.body.style.transform = 'translateZ(0)';
        setTimeout(() => {
          document.body.style.transform = '';
        }, 10);
      }
    }
    
    return () => {
      // Cleanup al desmontar
      performCleanup();
    };
  }, [performCleanup]);

  if (!isMounted) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs" sx={containerStyles}>
      <CssBaseline />
      <Paper sx={paperStyles}>
        <Avatar sx={{ m: 1, bgcolor: "transparent", width: 75, height: 75 }}>
          <img
            src="/logo.png"
            alt="Logo Rescate Animal Granada"
            style={{ width: "100%", height: "100%" }}
          />
        </Avatar>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 2 }}>
          Rescate Animal Granada
        </Typography>
        
        <SignInForm {...auth} />
        
        <Copyright />
      </Paper>
    </Container>
  );
};

export default SignIn;
