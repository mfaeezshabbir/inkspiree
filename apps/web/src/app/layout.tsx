import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InkSpire - AI-Powered Creative Canvas",
  description: "Transform your ideas into reality with our intelligent infinite canvas platform. Create, collaborate, and innovate with AI assistance.",
  keywords: ["canvas", "collaboration", "AI", "creativity", "brainstorming", "design"],
  authors: [{ name: "InkSpire Team" }],
  openGraph: {
    title: "InkSpire - AI-Powered Creative Canvas",
    description: "Transform your ideas into reality with our intelligent infinite canvas platform.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-slate-950 text-slate-100 overflow-hidden`}>
        {/* Animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(59,130,246,0.1),_transparent_50%)]" />
        </div>
        
        {/* Global cursor glow effect */}
        <div 
          id="cursor-glow" 
          className="fixed pointer-events-none w-96 h-96 rounded-full opacity-10 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 blur-3xl transition-all duration-500 ease-out -z-5 -translate-x-1/2 -translate-y-1/2"
        />
        
        <div className="relative z-10 h-screen flex flex-col">
          {children}
        </div>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('mousemove', (e) => {
                const x = e.clientX;
                const y = e.clientY;
                
                // Update cursor glow
                const glow = document.getElementById('cursor-glow');
                if (glow) {
                  glow.style.left = x + 'px';
                  glow.style.top = y + 'px';
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}