import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface InfiniteScrollLoaderProps {
  isVisible: boolean;
  onIntersect?: () => void;
}

const InfiniteScrollLoader: React.FC<InfiniteScrollLoaderProps> = ({ isVisible, onIntersect }) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  // Usar IntersectionObserver para detectar cuando el loader es visible
  useEffect(() => {
    if (!onIntersect) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 400px 0px',
        threshold: 0.1,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [onIntersect]);

  if (!isVisible) return null;

  return (
    <Box
      ref={loaderRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        py: 4,
        width: '100%',
        minHeight: '80px',
      }}
      data-testid="infinite-scroll-loader"
    >
      <CircularProgress size={30} color="primary" />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Cargando más días...
      </Typography>
    </Box>
  );
};

export default InfiniteScrollLoader;