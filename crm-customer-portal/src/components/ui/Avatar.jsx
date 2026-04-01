import React from 'react';

const avatarColors = [
  'bg-teal-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
];

const getAvatarColor = (username) => {
  if (!username) return avatarColors[0];
  const hash = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

const getInitials = (username) => {
  if (!username) return 'U';
  return username.substring(0, 2).toUpperCase();
}

const Avatar = ({ username, size = 32 }) => {
  const bgColor = getAvatarColor(username);
  const initials = getInitials(username);
  
  const sizeClasses = {
      24: 'w-6 h-6 text-[10px]',
      28: 'w-7 h-7 text-xs',
      32: 'w-8 h-8 text-sm',
      40: 'w-10 h-10 text-base',
  }
  
  const sizeClass = sizeClasses[size] || sizeClasses[32];

  return (
    <div 
        className={`rounded-full ${bgColor} text-white flex items-center justify-center font-semibold ${sizeClass}`}
        title={username}
    >
        {initials}
    </div>
  );
};

export default Avatar;
