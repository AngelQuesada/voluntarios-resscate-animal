import React from "react";
import { Box, TextField, Tooltip, IconButton, ClickAwayListener } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputProps {
  searchTerm: string;
  showSearchInput: boolean;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchIconClick: () => void;
  handleClickAwaySearch?: () => void;
  isMobile?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  showSearchInput,
  handleSearchChange,
  handleSearchIconClick,
  handleClickAwaySearch,
  isMobile = false
}) => {
  // En dispositivos móviles, no usamos el ClickAwayListener
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, width: '100%' }}>
        <TextField
          label="Buscar Usuario"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
          sx={{ mr: 0 }}
        />
      </Box>
    );
  }

  // Versión desktop original con ClickAwayListener
  return (
    <ClickAwayListener onClickAway={handleClickAwaySearch || (() => {})}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: '200px' }}>
        {showSearchInput ? (
          <TextField
            label="Buscar Usuario por nombre, apellidos o username"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape' && handleClickAwaySearch) {
                handleClickAwaySearch();
              }
            }}
            sx={{ mr: 1 }}
          />
        ) : (
          <Tooltip title="Buscar Usuario">
            <IconButton 
              onClick={handleSearchIconClick} 
              sx={{ 
                mr: 1, 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchInput;