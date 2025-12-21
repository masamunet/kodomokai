import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getOrganizationSettings } from "@/app/actions/organization";
import { AppRootLayout } from "@/components/layouts/AppRootLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export async function generateMetadata(): Promise<Metadata> {
  const settings = await getOrganizationSettings();
  const orgName = settings?.name || "子ども会";

  return {
    title: {
      template: `%s | ${orgName}`,
      default: orgName,
    },
    description: `${orgName}の管理システムです。`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppRootLayout fonts={`${geistSans.variable} ${geistMono.variable}`}>
      {children}
    </AppRootLayout>
  );
}
