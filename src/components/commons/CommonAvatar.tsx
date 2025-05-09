import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import './CommonAvatar.scss';

type CommonAvatarProps = {
  mode?: 'runner' | 'expert' | null;
  size?: number;
  uri?: string;
};

export const CommonAvatar: React.FC<CommonAvatarProps> = ({ 
  mode, 
  size = 36, 
  uri 
}) => {
  const badgeSize = size * 0.4;
  const avatarStyle = {
    width: size,
    height: size,
  };

  return (
    <Box className="common-avatar">
      {uri ? (
        <Avatar 
          src={uri} 
          sx={avatarStyle} 
          className="avatar-image"
        />
      ) : (
        <Avatar 
          sx={{ 
            ...avatarStyle, 
            bgcolor: 'primary.main' 
          }}
          className="avatar-placeholder"
        >
          <PersonIcon sx={{ fontSize: size * 0.55, color: 'white' }} />
        </Avatar>
      )}
      
      {mode === 'expert' && (
        <Box
          className="role-badge expert-badge"
          sx={{
            width: badgeSize,
            height: badgeSize,
            right: -2,
            bottom: -2,
          }}
        >
          <EmojiEventsIcon sx={{ 
            fontSize: badgeSize * 0.5, 
            color: 'white' 
          }} />
        </Box>
      )}
      
      {mode === 'runner' && (
        <Box
          className="role-badge runner-badge"
          sx={{
            width: badgeSize,
            height: badgeSize,
            right: -2,
            bottom: -2,
          }}
        >
          <DirectionsRunIcon sx={{ 
            fontSize: badgeSize * 0.5, 
            color: 'white' 
          }} />
        </Box>
      )}
    </Box>
  );
};