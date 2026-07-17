import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
    </div>
  );
}