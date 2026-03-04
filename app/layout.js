import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/sonner";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Budget Tracking - Manage Your Expenses",
  description: "Track your expenses and manage your budget efficiently",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.svg" />
        </head>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="budget-tracker-theme"
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
