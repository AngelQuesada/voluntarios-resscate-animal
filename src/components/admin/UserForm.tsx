import React, { useRef, useEffect } from "react";
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
    
  // Referencias para los campos de texto para mantener el estado del formulario en un componente no controlado
  const usernameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const jobRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const birthdateRef = useRef<HTMLInputElement>(null);
  
  // Manejar los cambios en el formulario al perder el foco (onBlur) en lugar de en cada tecla
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(e as any);
  };

  // Configurar el orden de los elementos del formulario
  const inputFieldsOrder = isAddMode ? 
    [usernameRef, nameRef, lastnameRef, birthdateRef, emailRef, passwordRef, passwordConfirmRef, phoneRef, jobRef, locationRef] :
    [usernameRef, nameRef, lastnameRef, birthdateRef, emailRef, phoneRef, jobRef, locationRef];

  // Esta función conecta los campos para la navegación
  useEffect(() => {
    // Agregar oyentes para manejar la navegación del teclado
    const fields = inputFieldsOrder.filter(ref => ref.current);

    fields.forEach((fieldRef, index) => {
      if (!fieldRef.current) return;
      
      // Eliminar primero los event listeners anteriores para evitar duplicados
      const element = fieldRef.current;
      
      element.addEventListener('keydown', (e: KeyboardEvent) => {
        // Solo manejar la tecla Enter, Tab o ir a siguiente desde el teclado móvil
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextField = fields[index + 1];
          if (nextField && nextField.current) {
            nextField.current.focus();
          }
        }
      });
    });

    fields.forEach((fieldRef, index) => {
      if (!fieldRef.current) return;
      
      if (index < fields.length - 1) {
        fieldRef.current.setAttribute('enterkeyhint', 'next');
      } else {
        fieldRef.current.setAttribute('enterkeyhint', 'done');
      }
    });

    // Limpiar event listeners al desmontar
    return () => {
      fields.forEach(fieldRef => {
        if (fieldRef.current) {
          const clone = fieldRef.current.cloneNode(true);
          if (fieldRef.current.parentNode) {
            fieldRef.current.parentNode.replaceChild(clone, fieldRef.current);
          }
        }
      });
    };
  }, [isAddMode]);

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
        defaultValue={userData.username}
        inputRef={usernameRef}
        onBlur={handleBlur}
        required
        error={submitAttempted && !userData.username}
        helperText={submitAttempted && !userData.username ? "El nombre de usuario es obligatorio" : ""}
        inputProps={{
          autoCapitalize: "none",
          autoComplete: "off",
          autoCorrect: "off"
        }}
        InputProps={{
          inputMode: "text",
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
        defaultValue={userData.name}
        inputRef={nameRef}
        onBlur={handleBlur}
        required
        error={submitAttempted && !userData.name}
        helperText={submitAttempted && !userData.name ? "El nombre es obligatorio" : ""}
        inputProps={{
          autoComplete: "off",
          autoCorrect: "off"
        }}
        InputProps={{
          inputMode: "text",
        }}
      />
      <TextField
        margin="dense"
        name="lastname"
        label="Apellidos"
        type="text"
        fullWidth
        variant="outlined"
        defaultValue={userData.lastname}
        inputRef={lastnameRef}
        onBlur={handleBlur}
        required
        error={submitAttempted && !userData.lastname}
        helperText={submitAttempted && !userData.lastname ? "Los apellidos son obligatorios" : ""}
        inputProps={{
          autoComplete: "off",
          autoCorrect: "off"
        }}
        InputProps={{
          inputMode: "text",
        }}
      />
      <TextField
        margin="dense"
        name="birthdate"
        label="Fecha de Nacimiento"
        type="date"
        fullWidth
        variant="outlined"
        defaultValue={userData.birthdate}
        inputRef={birthdateRef}
        onBlur={handleBlur}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          autoComplete: "off"
        }}
      />
      <TextField
        margin="dense"
        name="email"
        label="Correo Electrónico"
        type={isAddMode ? "email" : "text"}
        fullWidth
        variant="outlined"
        defaultValue={userData.email}
        inputRef={emailRef}
        onBlur={handleBlur}
        required
        error={submitAttempted && !userData.email}
        helperText={submitAttempted && !userData.email ? "El correo electrónico es obligatorio" : ""}
        inputProps={{
          autoComplete: "off",
          autoCorrect: "off"
        }}
        InputProps={{
          inputMode: "email",
        }}
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
            defaultValue={userData.password}
            inputRef={passwordRef}
            onBlur={handleBlur}
            required
            error={submitAttempted && (!userData.password || userData.password.length < 6)}
            helperText={
              submitAttempted && !userData.password 
                ? "La contraseña es obligatoria" 
                : submitAttempted && userData.password && userData.password.length < 6
                  ? "La contraseña debe tener al menos 6 caracteres"
                  : "Mínimo 6 caracteres."
            }
            inputProps={{
              autoComplete: "new-password",
              autoCorrect: "off"
            }}
          />
          <TextField
            margin="dense"
            name="passwordConfirm"
            label="Confirmar Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            defaultValue={userData.passwordConfirm || ""}
            inputRef={passwordConfirmRef}
            onBlur={handleBlur}
            required
            error={passwordsDoNotMatch}
            helperText={
              passwordsDoNotMatch
                ? "Las contraseñas no coinciden" 
                : "Repite la contraseña para confirmar."
            }
            inputProps={{
              autoComplete: "new-password",
              autoCorrect: "off"
            }}
          />
        </>
      )}
      <TextField
        margin="dense"
        name="phone"
        label="Teléfono"
        type="text"
        fullWidth
        variant="outlined"
        defaultValue={userData.phone}
        inputRef={phoneRef}
        onBlur={handleBlur}
        required
        error={submitAttempted && (!userData.phone || phoneError)}
        helperText={
          submitAttempted && !userData.phone
            ? "El teléfono es obligatorio"
            : phoneError
              ? "Formato de teléfono inválido. Usa formato: 6XXXXXXXX, +34 6XXXXXXXX, etc."
              : ""
        }
        inputProps={{
          autoComplete: "off",
          pattern: "^(\\+34|0034)?[ -]*(6|7|8|9)[ -]*([0-9][ -]*){8}$",
        }}
        InputProps={{
          inputMode: "tel",
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
              InputProps={{
                ...params.InputProps
              }}
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
        defaultValue={userData.job}
        inputRef={jobRef}
        onBlur={handleBlur}
        inputProps={{
          autoComplete: "off",
          autoCorrect: "off"
        }}
        InputProps={{
          inputMode: "text",
        }}
      />
      <TextField
        margin="dense"
        name="location"
        label="Localidad (Opcional)"
        type="text"
        fullWidth
        variant="outlined"
        defaultValue={userData.location}
        inputRef={locationRef}
        onBlur={handleBlur}
        inputProps={{
          autoComplete: "off",
          autoCorrect: "off"
        }}
        InputProps={{
          inputMode: "text",
        }}
      />
    </>
  );
};

export default UserForm;