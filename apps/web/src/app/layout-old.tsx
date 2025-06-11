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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inkspiree Infinite Canvas",
  description:
    "AI-powered infinite canvas for brainstorming, storyboarding, and collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-indigo-200 via-white to-blue-200`}
        style={{ backgroundAttachment: 'fixed' }}
      >
        {/* Topbar */}
        <header className="w-full h-16 flex items-center justify-between px-8 bg-white/60 backdrop-blur-lg border-b border-gray-200 shadow-lg z-30 sticky top-0 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="inline-block bg-gradient-to-tr from-indigo-500 to-blue-400 rounded-xl p-2 shadow-lg">
                <svg
                  className="w-8 h-8 text-white drop-shadow-lg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="6"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-2xl font-extrabold bg-gradient-to-tr from-indigo-700 to-blue-500 bg-clip-text text-transparent group-hover:underline tracking-tight">
                Inkspiree
              </span>
            </Link>
          </div>
          <nav className="flex gap-6 items-center">
            <Link
              href="/boards"
              className="text-base font-semibold text-gray-700 hover:text-indigo-700 transition px-3 py-1 rounded-lg hover:bg-indigo-50"
            >
              Boards
            </Link>
            <a
              href="https://github.com/inkspiree-ai"
              target="_blank"
              rel="noopener"
              className="text-base font-semibold text-gray-400 hover:text-indigo-500 transition px-3 py-1 rounded-lg hover:bg-indigo-50"
            >
              GitHub
            </a>
          </nav>
        </header>
        {/* Main content area with sidebar */}
        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-56 bg-white/50 backdrop-blur-lg border-r border-gray-200 py-8 px-4 gap-6 shadow-xl rounded-tr-3xl rounded-br-3xl mt-4 ml-4 animate-slideIn">
            <div>
              <h2 className="text-base font-bold text-gray-700 mb-2 tracking-wide uppercase">Quick Actions</h2>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/boards"
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-100 text-gray-700 font-semibold transition"
                  >
                    My Boards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/boards"
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-100 text-gray-700 font-semibold transition"
                  >
                    Create Board
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-100 text-gray-700 font-semibold transition"
                  >
                    Home
                  </Link>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <h2 className="text-base font-bold text-gray-700 mb-2 tracking-wide uppercase">Features</h2>
              <ul className="flex flex-col gap-2 text-gray-500 text-sm">
                <li>🖼️ Infinite Canvas</li>
                <li>🧠 AI Assistant</li>
                <li>🗯️ Smart Sticky Notes</li>
                <li>🤝 Collaboration</li>
                <li>✍️ Storyboarding</li>
                <li>📦 Export Options</li>
              </ul>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1 min-h-screen px-0 md:px-10 py-10 bg-transparent">
            <div className="max-w-7xl mx-auto w-full animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
        {/* Footer */}
        <footer className="w-full text-center py-6 text-xs text-gray-400 bg-white/60 border-t border-gray-200 mt-8 rounded-t-2xl shadow-inner">
          <span>
            AI-powered infinite canvas &copy; {new Date().getFullYear()} Inkspiree
          </span>
        </footer>
      </body>
    </html>
  );
}
