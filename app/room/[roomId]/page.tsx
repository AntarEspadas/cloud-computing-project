'use client'; // 1. Mark this file as a Client Component

import React, { use } from 'react'; // 2. Import 'use' to handle the params Promise
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

// 3. Dynamic Import with SSR disabled (Now allowed because we are in a Client Component)
const RoomClient = dynamic(() => import('./RoomClient'), { 
  ssr: false, 
  loading: () => (
    <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Box>
  )
});

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

// 4. Remove 'async' (Client components cannot be async)
export default function RoomPage({ params }: PageProps) {
  // 5. Unwrap params using React.use() instead of await
  const { roomId } = use(params);
  
  return <RoomClient roomId={roomId} />;
}