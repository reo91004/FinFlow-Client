"use client";

import { useModalStore } from '@/app/store/modal';
import AddInvestmentsModal from './_component/AddInvestmentsModal';

export default function Page() {
    const { isModalOpen, setIsModalOpen } = useModalStore();

    return (
        <>
            {isModalOpen && <AddInvestmentsModal />}
            <div>거래 내역 페이지</div>
        </>
    )
}