import React, { useState } from "react";
import { TextField, Box, Alert, FormHelperText } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { textFieldStyles } from "@/styles/formStyles";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
  isLoading: boolean;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
}

const SignInForm = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  handleSignIn,
}: SignInFormProps) => {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const validateField = (field: "email" | "password") => {
    if (field === "email" && !email.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        email: "El correo electrónico es obligatorio",
      }));
      return false;
    } else if (field === "email") {
      setFormErrors((prev) => ({ ...prev, email: "" }));
    }

    if (field === "password" && !password) {
      setFormErrors((prev) => ({
        ...prev,
        password: "La contraseña es obligatoria",
      }));
      return false;
    } else if (field === "password" && password.length < 6) {
      setFormErrors((prev) => ({
        ...prev,
        password: "La contraseña debe tener al menos 6 caracteres",
      }));
      return false;
    } else if (field === "password") {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }

    return true;
  };

  const validateForm = () => {
    const emailValid = validateField("email");
    const passwordValid = validateField("password");
    return emailValid && passwordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      return;
    }

    await handleSignIn(e);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ mt: 1, width: "100%" }}
    >
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (submitAttempted) validateField("email");
        }}
        error={!!error || (submitAttempted && !!formErrors.email)}
        disabled={isLoading}
        helperText={
          submitAttempted && formErrors.email ? formErrors.email : ""
        }
        sx={textFieldStyles}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (submitAttempted) validateField("password");
        }}
        error={!!error || (submitAttempted && !!formErrors.password)}
        disabled={isLoading}
        helperText={
          submitAttempted && formErrors.password ? formErrors.password : ""
        }
        sx={textFieldStyles}
      />
      {error && (
        <Alert severity="error" sx={{ width: "100%", mt: 2, mb: 1 }}>
          {error}
        </Alert>
      )}
      <SubmitButton isLoading={isLoading} />
    </Box>
  );
};

export default SignInForm;