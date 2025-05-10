import { Inter } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/theme";
import { AuthProvider } from "@/context/AuthContext";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ReduxProvider } from "@/store/provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true} className={inter.className}>
        {" "}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ReduxProvider>
            <AuthProvider>
              <Box sx={{ minHeight: "100vh" }}>{children}</Box>
            </AuthProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
