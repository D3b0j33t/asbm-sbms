
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Filter environment variables to only expose those prefixed with VITE_
  const envWithProcessPrefix = Object.entries(env).reduce(
    (acc, [key, val]) => {
      if (key.startsWith('VITE_')) {
        acc[`process.env.${key}`] = JSON.stringify(val);
      }
      return acc;
    },
    {} as Record<string, string>
  );

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Only expose environment variables prefixed with VITE_
      ...envWithProcessPrefix
    },
  };
});
