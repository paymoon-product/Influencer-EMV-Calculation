import { TopNavigation } from "./TopNavigation";

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}