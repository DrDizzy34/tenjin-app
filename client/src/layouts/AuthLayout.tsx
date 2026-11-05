export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-gray-200/70 bg-white">
                <p>Tenjin</p>
            </header>
            <main className="flex flex-1">{children}</main>
            <footer className="border-t border-gray-200/70 bg-white py-6 text-center text-sm text-gray-500">
                <p>We are not in any way affiliated with Ontario Tech, rather this is a personal project made to bring students together.</p>
            </footer>
        </div>
    )
}
