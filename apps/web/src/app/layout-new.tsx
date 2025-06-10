import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InkSpire - AI-Powered Creative Canvas",
  description: "Transform your ideas into reality with our intelligent infinite canvas platform. Create, collaborate, and innovate with AI assistance.",
  keywords: ["canvas", "collaboration", "AI", "creativity", "brainstorming", "design"],
  authors: [{ name: "InkSpire Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#6366f1",
  openGraph: {
    title: "InkSpire - AI-Powered Creative Canvas",
    description: "Transform your ideas into reality with our intelligent infinite canvas platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
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
          className="fixed pointer-events-none w-96 h-96 rounded-full opacity-10 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 blur-3xl transition-all duration-500 ease-out -z-5"
          style={{
            transform: "translate(-50%, -50%)",
            left: "var(--mouse-x, 50%)",
            top: "var(--mouse-y, 50%)",
          }}
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
                document.documentElement.style.setProperty('--mouse-x', x + 'px');
                document.documentElement.style.setProperty('--mouse-y', y + 'px');
                
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
