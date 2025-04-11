
import React, { ReactNode } from 'react';
import { Sidebar, SidebarProvider, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import Navigation from '@/components/Navigation';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <Navigation />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 p-6 overflow-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
