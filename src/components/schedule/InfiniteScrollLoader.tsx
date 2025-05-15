import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface InfiniteScrollLoaderProps {
  isVisible: boolean;
}

const InfiniteScrollLoader: React.FC<InfiniteScrollLoaderProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        py: 4,
        width: '100%',
      }}
    >
      <CircularProgress size={30} color="primary" />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Cargando más días...
      </Typography>
    </Box>
  );
};

export default InfiniteScrollLoader;