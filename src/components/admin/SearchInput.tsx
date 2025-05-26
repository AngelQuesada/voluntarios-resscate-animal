import React, { useRef, useEffect, useState, useCallback } from "react";
import { Box, TextField, Tooltip, IconButton } from "@mui/material";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localFocus, setLocalFocus] = useState(false);

  useEffect(() => {
    if (showSearchInput && inputRef.current && document.activeElement === inputRef.current) {
      // Asegurarse de que el input mantenga el foco si ya lo tenía
      const currentPos = inputRef.current.selectionStart;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Restaurar la posición del cursor
          if (currentPos !== null) {
            inputRef.current.setSelectionRange(currentPos, currentPos);
          }
        }
      }, 0);
    }
  }, [searchTerm, showSearchInput]);

  // Efecto para manejar el enfoque automático cuando showSearchInput cambia a true
  // useEffect(() => {
  //   if (showSearchInput && inputRef.current && !isMobile) {
  //     setTimeout(() => {
  //       if (inputRef.current) {
  //         inputRef.current.focus();
  //         // Colocar cursor al final
  //         const len = inputRef.current.value.length;
  //         inputRef.current.setSelectionRange(len, len);
  //       }
  //     }, 10);
  //   }
  // }, [showSearchInput, isMobile]);

  // Efecto para manejar clics fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) && 
        handleClickAwaySearch &&
        !isMobile &&
        showSearchInput
      ) {
        // Solo ocultar si realmente se hizo clic fuera
        handleClickAwaySearch();
      }
    }

    // Solo agregar el listener si no es móvil y el campo de búsqueda está visible
    if (!isMobile && showSearchInput) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickAwaySearch, isMobile, showSearchInput]);

  // Handler para cuando el input recibe foco
  const handleFocus = useCallback(() => {
    setLocalFocus(true);
  }, []);

  // Handler para cuando el input pierde foco
  const handleBlur = useCallback(() => {
    setLocalFocus(false);
  }, []);

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, width: '100%' }}>
        <TextField
          label="Buscar Usuario"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          inputRef={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

  // Versión para escritorio con manejo personalizado de enfoque
  return (
    <Box 
      ref={containerRef}
      sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: '200px' }}
    >
      {showSearchInput ? (
        <TextField
          label="Buscar Usuario por nombre, apellidos o username"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          inputRef={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && handleClickAwaySearch) {
              e.preventDefault();
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
  );
};

export default SearchInput;