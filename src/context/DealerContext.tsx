// context/DealerContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dealer } from '@/data/dealers';
import { useDealersWithFiles } from '@/hooks/useDealersWithFiles';

interface DealerContextType {
  dealers: Dealer[];
  loading: boolean;
}

const DealerContext = createContext<DealerContextType>({
  dealers: [],
  loading: true,
});

export const useDealerContext = () => useContext(DealerContext);

export const DealerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dealers, loading } = useDealersWithFiles();

  return (
    <DealerContext.Provider value={{ dealers, loading }}>
      {children}
    </DealerContext.Provider>
  );
};
