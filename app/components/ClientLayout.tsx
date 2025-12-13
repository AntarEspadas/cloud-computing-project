'use client';

    import React from 'react';
    import { Amplify } from 'aws-amplify';
    
    import awsExports from '../../src/aws-exports'; 

    Amplify.configure(awsExports);

    export default function ClientLayout({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    }