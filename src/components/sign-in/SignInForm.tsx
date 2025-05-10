import React from "react";
import { TextField, Box, Alert } from "@mui/material";
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
  return (
    <Box component="form" onSubmit={handleSignIn} noValidate sx={{ mt: 1, width: "100%" }}>
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
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
        disabled={isLoading}
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
        onChange={(e) => setPassword(e.target.value)}
        error={!!error}
        disabled={isLoading}
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