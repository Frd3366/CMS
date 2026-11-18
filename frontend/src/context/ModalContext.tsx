import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType {
  isAnyModalOpen: boolean;
  registerModal: () => () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openModalCount, setOpenModalCount] = useState<number>(0);

  const registerModal = useCallback(() => {
    setOpenModalCount((prev) => prev + 1);
    return () => {
      setOpenModalCount((prev) => Math.max(0, prev - 1));
    };
  }, []);

  return (
    <ModalContext.Provider value={{ isAnyModalOpen: openModalCount > 0, registerModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalState = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalState must be used within a ModalProvider');
  }
  return context;
};
