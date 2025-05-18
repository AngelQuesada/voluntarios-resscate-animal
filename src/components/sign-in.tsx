"use client";
import React, { useState, useEffect } from "react";
import { Container, Paper, Avatar, Typography, CssBaseline } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import SignInForm from "./sign-in/SignInForm";
import Copyright from "./Copyright";
import { containerStyles, paperStyles } from "@/styles/formStyles";

const SignIn = () => {
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
