'use client';

import React from 'react';
import { App } from 'konsta/react';
import FloatingBall from './FloatingBall';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <App theme="ios" safeAreas>
      <div className="bg-noise" />
      {children}
      <FloatingBall />
    </App>
  );
}
