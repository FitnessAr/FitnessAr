import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las páginas de /admin, /profesor y /cliente son dinámicas (usan cookies() vía los guards de
    // auth), así que caen en el bucket "dynamic" del Client Router Cache — su default es 0s desde
    // Next 15 (sin cache). Con 30s, volver a una pestaña ya visitada hace poco reutiliza el
    // payload en el navegador en vez de pedirle de nuevo todo al server.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
