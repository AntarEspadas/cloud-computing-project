'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'; // Import UUID

export default function BoardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Generates a unique string like "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    const uniqueId = uuidv4(); 
    router.replace(`/room/${uniqueId}`);
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Creating your secure room...
    </div>
  );
}