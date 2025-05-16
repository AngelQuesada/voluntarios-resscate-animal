import { Inter } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/theme";
import { AuthProvider } from "@/context/AuthContext";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ReduxProvider } from "@/store/provider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
      </head>
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
        <Script src="/register-sw.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
