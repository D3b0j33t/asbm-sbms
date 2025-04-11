
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ShieldCheck, GraduationCap, School } from 'lucide-react';

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  role?: 'student' | 'teacher' | 'admin' | null;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  role = 'student',
  size = 'md',
  showBadge = true,
  className
}) => {
  const initials = name
    ? name
        .split(' ')
        .map(part => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : role === 'admin'
    ? 'AD'
    : role === 'teacher'
    ? 'TC'
    : 'ST';

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const badgeSizeClasses = {
    sm: 'h-3.5 w-3.5 -bottom-0.5 -right-0.5',
    md: 'h-4 w-4 -bottom-0.5 -right-0.5',
    lg: 'h-6 w-6 -bottom-1 -right-1'
  };

  const getBadgeIcon = () => {
    if (role === 'admin') {
      return <ShieldCheck className="h-full w-full" />;
    } else if (role === 'teacher') {
      return <School className="h-full w-full" />;
    } else {
      return <GraduationCap className="h-full w-full" />;
    }
  };

  const getBadgeColor = () => {
    if (role === 'admin') {
      return 'bg-red-500';
    } else if (role === 'teacher') {
      return 'bg-purple-500';
    } else {
      return 'bg-primary';
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={avatarUrl || ''} alt={name || 'User'} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      {showBadge && (
        <div className={cn(
          'absolute rounded-full text-white flex items-center justify-center p-0.5',
          badgeSizeClasses[size],
          getBadgeColor()
        )}>
          {getBadgeIcon()}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
