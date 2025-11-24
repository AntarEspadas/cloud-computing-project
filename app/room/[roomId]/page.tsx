import React from 'react';
import RoomClient from './RoomClient';

interface PageProps {
  params: {
    roomId: string;
  };
}

// Server Component
export default async function RoomPage({ params }: PageProps) {
  const { roomId } = await params;
  
  return <RoomClient roomId={roomId} />;
}