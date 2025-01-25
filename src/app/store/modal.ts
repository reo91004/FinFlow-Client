import { create } from "zustand";

interface ModalState {
    isModalOpen: boolean;
    setIsModalOpen: (status: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isModalOpen: false,
    setIsModalOpen: (status) => set({ isModalOpen: status }),
}));