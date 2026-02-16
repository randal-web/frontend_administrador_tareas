import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow — Administrador de Tareas",
    template: "%s | TaskFlow",
  },
  description: "Organiza tus tareas, proyectos y hábitos desde un solo lugar. Tablero Kanban, Gantt y seguimiento de hábitos.",
  keywords: ["tareas", "proyectos", "hábitos", "productividad", "kanban", "gantt", "gestión"],
  authors: [{ name: "TaskFlow" }],
  openGraph: {
    title: "TaskFlow — Administrador de Tareas",
    description: "Organiza tus tareas, proyectos y hábitos desde un solo lugar.",
    type: "website",
    locale: "es_ES",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
