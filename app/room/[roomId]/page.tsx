import React from 'react';
import RoomClient from './RoomClient';

interface PageProps {
  params: {
    roomId: string;
  };
}

// Server Component
export default function RoomPage({ params }: PageProps) {
  return <RoomClient roomId={params.roomId} />;
}