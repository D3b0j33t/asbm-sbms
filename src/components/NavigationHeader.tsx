
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from './UserAvatar';
import NotificationIcon from './NotificationIcon';
import { LogOut, MenuIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationHeaderProps {
  toggleSidebar: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ toggleSidebar }) => {
  const { userName, userRole, userAvatar, logout } = useAuth();

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
        
        <Link to="/" className="flex items-center gap-2">
          <img src="https://www.asbm.ac.in/wp-content/uploads/2021/02/FINAL-LOGO-1.png" alt="ASBM University" className="h-10" /> {/*earlier the src was /assets/logo.png*/}
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Show notification icon for all users */}
        <NotificationIcon />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <UserAvatar
                name={userName || ''}
                avatarUrl={userAvatar || ''}
                role={userRole}
                size="md"
                showBadge={true}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {userRole || 'User'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 focus:text-red-500"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default NavigationHeader;
