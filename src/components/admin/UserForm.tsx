import React from "react";
import { TextField, FormControl, FormLabel, Autocomplete, Box, Chip } from "@mui/material";
import { UserRoles } from "@/lib/constants";

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
}

const UserForm: React.FC<UserFormProps> = ({ 
  userData, 
  handleChange, 
  setUserData, 
  isAddMode = false 
}) => {
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
        onChange={handleChange}
        required
      />
      <TextField
        margin="dense"
        name="name"
        label="Nombre"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.name}
        onChange={handleChange}
        required
      />
      <TextField
        margin="dense"
        name="lastname"
        label="Apellidos"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.lastname}
        onChange={handleChange}
        required
      />
      <TextField
        margin="dense"
        name="birthdate"
        label="Fecha de Nacimiento"
        type="date"
        fullWidth
        variant="outlined"
        value={userData.birthdate}
        onChange={handleChange}
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
        onChange={handleChange}
        required
      />
      {isAddMode && (
        <TextField
          margin="dense"
          name="password"
          label="Contraseña"
          type="password"
          fullWidth
          variant="outlined"
          value={userData.password}
          onChange={handleChange}
          required
          helperText="Mínimo 6 caracteres."
        />
      )}
      <TextField
        margin="dense"
        name="phone"
        label="Teléfono"
        type="tel"
        fullWidth
        variant="outlined"
        value={userData.phone}
        onChange={handleChange}
        required
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
        onChange={handleChange}
      />
      <TextField
        margin="dense"
        name="location"
        label="Localidad (Opcional)"
        type="text"
        fullWidth
        variant="outlined"
        value={userData.location}
        onChange={handleChange}
      />
    </>
  );
};

export default UserForm;