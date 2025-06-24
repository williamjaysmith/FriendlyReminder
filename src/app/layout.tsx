import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Leckerli_One } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const leckerliOne = Leckerli_One({
  variable: "--font-leckerli-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Friendly Reminder",
  description: "Your personal CRM to stay connected with the people you meet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#231f20]">
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${leckerliOne.variable} antialiased bg-[#231f20]`}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
