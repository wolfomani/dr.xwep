import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-screen gradient-bg grid grid-cols-[280px_1fr_300px] grid-rows-[60px_1fr_40px] overflow-hidden">
      {children}
    </div>
  );
};
