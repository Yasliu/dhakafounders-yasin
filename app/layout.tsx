import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { dark } from "@clerk/themes";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dhaka Founders - Connect with Builders in Dhaka",
  description:
    "A directory of startup founders and builders in Dhaka. Discover projects, connect with creators, and showcase what you are building.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "#8b5cf6",
              colorBackground: "#0b0b0f",
              colorForeground: "#f4f4f5",
              colorMutedForeground: "#a1a1aa",
              colorInput: "#18181b",
              colorInputForeground: "#f4f4f5",
              colorBorder: "#27272a",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "border border-zinc-800/80 bg-[#0b0b0f] shadow-2xl backdrop-blur-xl",
              headerTitle: "text-white font-heading font-bold text-xl",
              headerSubtitle: "text-zinc-400 font-body text-sm",
              socialButtonsBlockButton: "bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-850 hover:text-white transition-all",
              formButtonPrimary: "bg-primary hover:bg-primary-light text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all",
              footerActionText: "text-zinc-400 font-body",
              footerActionLink: "text-secondary hover:text-secondary-light font-semibold",
              formFieldLabel: "text-zinc-300 font-medium",
              formFieldInput: "bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-500",
              // Target UserButton Popover to prevent black text / bad backgrounds
              userButtonPopoverCard: "border border-zinc-800/80 bg-[#0b0b0f] shadow-2xl text-white",
              userButtonPopoverActionButton: "text-zinc-200 hover:text-white hover:bg-zinc-900/60 transition-all",
              userButtonPopoverActionButtonText: "text-zinc-200 font-body font-medium",
              userButtonPopoverActionButtonIcon: "text-zinc-400",
              userButtonPopoverFooter: "bg-[#0b0b0f] border-t border-zinc-800/60",
              userButtonOuterIdentifier: "text-zinc-200 font-body font-semibold",
            }
          }}
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}