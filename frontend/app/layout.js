import "./global.css";

export const metadata = {
  title: "Proyecto CISE - Dashboard Loja",
  description: "Dashboard por cantones - Provincia de Loja"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 font-sans">{children}</body>
    </html>
  );
}
