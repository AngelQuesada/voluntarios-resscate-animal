import React, { useState } from "react";
import { TextField, FormControl, FormLabel, Autocomplete, Box, Chip, Switch, FormControlLabel } from "@mui/material";
import { UserRoles } from "@/lib/constants";

// Función para validar formato de número de teléfono español
const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Campo vacío se maneja en otra validación
  // Regex para validar números españoles
  const phoneRegex = /^(\+34|0034)?[ -]*(6|7|8|9)[ -]*([0-9][ -]*){8}$/;
  return phoneRegex.test(phone);
};

// Definir las opciones de roles para el Autocomplete, incluyendo el color
export const roleOptions = [
  { id: UserRoles.RESPONSABLE, label: "Responsable", color: 'success.main' },
  { id: UserRoles.ADMINISTRADOR, label: "Administrador", color: 'error.main' },
];

interface UserFormProps {
  userData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setUserData: (value: React.SetStateAction<any>) => void;
  isAddMode?: boolean;
  handleEnabledSwitchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitAttempted?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ 
  userData, 
  handleChange, 
  setUserData, 
  isAddMode = false,
  handleEnabledSwitchChange,
  submitAttempted = false
}) => {
  // Validación del teléfono
  const phoneError = userData.phone && !isValidPhone(userData.phone) && submitAttempted;
  
  // Validación de contraseñas
  const passwordsDoNotMatch = isAddMode && 
    submitAttempted && 
    userData.password !== (userData.passwordConfirm || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  return (
    <>
      <TextField
        autoFocus={isAddMode}
        margin="dense"
        name="username"
        label="Nombre de Usuario"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.username}
        onChange={handleInputChange}
        required
        error={submitAttempted && !userData.username}
        helperText={submitAttempted && !userData.username ? "El nombre de usuario es obligatorio" : ""}
        inputProps={{
          autoCapitalize: "none"
        }}
      />
      
      {/* Switch para habilitar/deshabilitar usuario */}
      <FormControlLabel
        control={
          <Switch
            checked={userData.isEnabled !== false}
            onChange={handleEnabledSwitchChange}
            name="isEnabled"
            color="primary"
          />
        }
        label={userData.isEnabled !== false ? "Usuario Habilitado" : "Usuario Deshabilitado"}
        sx={{ my: 1, display: 'block' }}
      />
      
      <TextField
        margin="dense"
        name="name"
        label="Nombre"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.name}
        onChange={handleInputChange}
        required
        error={submitAttempted && !userData.name}
        helperText={submitAttempted && !userData.name ? "El nombre es obligatorio" : ""}
      />
      <TextField
        margin="dense"
        name="lastname"
        label="Apellidos"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.lastname}
        onChange={handleInputChange}
        required
        error={submitAttempted && !userData.lastname}
        helperText={submitAttempted && !userData.lastname ? "Los apellidos son obligatorios" : ""}
      />
      <TextField
        margin="dense"
        name="birthdate"
        label="Fecha de Nacimiento"
        type="date"
        fullWidth
        variant="outlined"
        value={userData.birthdate}
        onChange={handleInputChange}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        margin="dense"
        name="email"
        label="Correo Electrónico"
        type={isAddMode ? "email" : "text"}
        fullWidth
        variant="outlined"
        value={userData.email}
        onChange={handleInputChange}
        required
        error={submitAttempted && !userData.email}
        helperText={submitAttempted && !userData.email ? "El correo electrónico es obligatorio" : ""}
      />
      {isAddMode && (
        <>
          <TextField
            margin="dense"
            name="password"
            label="Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={userData.password}
            onChange={handleInputChange}
            required
            error={submitAttempted && (!userData.password || userData.password.length < 6)}
            helperText={
              submitAttempted && !userData.password 
                ? "La contraseña es obligatoria" 
                : submitAttempted && userData.password && userData.password.length < 6
                  ? "La contraseña debe tener al menos 6 caracteres"
                  : "Mínimo 6 caracteres."
            }
          />
          <TextField
            margin="dense"
            name="passwordConfirm"
            label="Confirmar Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={userData.passwordConfirm || ""}
            onChange={handleInputChange}
            required
            error={passwordsDoNotMatch}
            helperText={
              passwordsDoNotMatch
                ? "Las contraseñas no coinciden" 
                : "Repite la contraseña para confirmar."
            }
          />
        </>
      )}
      <TextField
        margin="dense"
        name="phone"
        label="Teléfono"
        type="tel"
        fullWidth
        variant="outlined"
        value={userData.phone}
        onChange={handleInputChange}
        required
        error={submitAttempted && (!userData.phone || phoneError)}
        helperText={
          submitAttempted && !userData.phone
            ? "El teléfono es obligatorio"
            : phoneError
              ? "Formato de teléfono inválido. Usa formato: 6XXXXXXXX, +34 6XXXXXXXX, etc."
              : ""
        }
        InputProps={{
          inputProps: {
            pattern: "^(\\+34|0034)?[ -]*(6|7|8|9)[ -]*([0-9][ -]*){8}$"
          }
        }}
      />
      <FormControl fullWidth margin="dense" variant="outlined">
        <FormLabel component="legend">Roles Adicionales</FormLabel>
        <Autocomplete
          multiple
          id={isAddMode ? "add-user-roles" : "edit-user-roles"}
          options={roleOptions}
          getOptionLabel={(option) => option.label}
          value={roleOptions.filter(option => userData.roles?.includes(option.id))}
          onChange={(_, selectedOptions) => {
            const selectedRoleIds = selectedOptions.map(option => option.id);
            const finalRoles = [UserRoles.VOLUNTARIO, ...selectedRoleIds];
            setUserData((prev: typeof userData) => ({
              ...prev,
              roles: [...new Set(finalRoles)]
            }));
          }}
          renderOption={(props, option) => {
            const {id, key, ...otherProps} = props;
            return (
              <Box key={id} component="li" sx={{ '& > div': { mr: 1, flexShrink: 0 } }} {...otherProps}>
                <Box
                  component="div"
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: option.color,
                    display: 'inline-block',
                    mr: 1,
                  }}
                />
                {option.label}
              </Box>
            )
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const {key, ...otherProps} = getTagProps({ index });
              return (
                <Chip
                  key={option.id}
                  label={option.label}
                  size="small"
                  sx={{
                    backgroundColor: option.color,
                    color: 'white',
                    margin: '2px',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        color: 'white',
                      },
                    },
                  }}
                  {...otherProps}
                />
              )
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Seleccionar roles"
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </FormControl>
      <TextField
        margin="dense"
        name="job"
        label="Profesión (Opcional)"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.job}
        onChange={handleInputChange}
      />
      <TextField
        margin="dense"
        name="location"
        label="Localidad (Opcional)"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.location}
        onChange={handleInputChange}
      />
    </>
  );
};

export default UserForm;