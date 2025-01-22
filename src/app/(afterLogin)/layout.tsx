import Navbar from './_component/Navbar';

export default function AfterLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen px-48 pt-36 bg-[#f9fafb]">
                {children}
            </main>
        </div>
    );
}