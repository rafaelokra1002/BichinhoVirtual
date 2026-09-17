import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { InstallButton } from "@/components/InstallButton";
import "./globals.css";

/** Fonte arredondada e lúdica — combina com o público infantil do jogo, no lugar de uma sans-serif genérica. */
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Bichinho Virtual",
  description: "Cuide do seu bichinho virtual: alimente, brinque, cure e ajude-o a evoluir.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  themeColor: "#9333ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gradient-to-b from-sky-200 via-purple-100 to-rose-100 dark:from-stone-950 dark:via-purple-950/40 dark:to-stone-950">
        <div className="fundo-decorativo" aria-hidden="true" />
        <PwaRegister />
        <InstallButton />
        {children}
      </body>
    </html>
  );
}
