import React from 'react';

export const Spinner: React.FC = () => (
  <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#fd572b] animate-spin-custom"></div>
);

export const CardSkeleton: React.FC = () => (
  <div className="aspect-card rounded-xl overflow-hidden relative bg-gray-200 shadow-sm">
    <div className="absolute inset-0 skeleton"></div>
  </div>
);

export const CategorySkeleton: React.FC = () => (
  <div className="h-8 w-24 rounded-full skeleton flex-shrink-0"></div>
);