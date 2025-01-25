import { useCurrencyStore } from "@/app/store/currency";
import { useModalStore } from "@/app/store/modal";
import { useState } from "react";

export default function AddInvestmentsModal() {
    const { isModalOpen, setIsModalOpen } = useModalStore();
    const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();

    const [ticker, setTicker] = useState("");
    const [type, setType] = useState("구매");
    const [date, setDate] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [errors, setErrors] = useState({
        ticker: "",
        date: "",
        quantity: "",
        price: "",
    });

    const validateForm = () => {
        const newErrors = {
            ticker: "",
            date: "",
            quantity: "",
            price: "",
        };

        let isValid = true;

        if (!ticker.trim()) {
            newErrors.ticker = "티커명/회사 이름을 입력해주세요";
            isValid = false;
        }
        if (!date) {
            newErrors.date = "날짜를 선택해주세요";
            isValid = false;
        }
        if (!quantity) {
            newErrors.quantity = "수량을 입력해주세요";
            isValid = false;
        }
        if (!price) {
            newErrors.price = "가격을 입력해주세요";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/25 z-[60]"></div>
            <div className="fixed top-1/2 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-lg shadow-xl p-6 animate-fade-in-down">
                    <div className="pb-4 mb-4 border-b">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                새로운 거래 내역
                            </h2>
                            <button
                                className="text-3xl text-slate-300 hover:text-[#3699ff] transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col pb-4 mb-4 border-b">
                        <div className="flex flex-col mb-4">
                            <label className="text-sm text-slate-700 mb-2">
                                티커명/회사 이름
                            </label>
                            <input
                                type="text"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                className="p-3 bg-slate-100 text-sm text-slate-700 rounded-md"
                                placeholder="티커명이나 회사 이름을 입력해주세요."
                            />
                            {errors.ticker && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.ticker}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-row mb-4 gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="text-sm text-slate-700 mb-2">
                                    거래 종류
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="p-3 bg-slate-100 text-sm text-slate-700 rounded-md"
                                >
                                    <option>구매</option>
                                    <option>판매</option>
                                </select>
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="text-sm text-slate-700 mb-2">
                                    날짜
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="p-3 bg-slate-100 text-sm text-slate-700 rounded-md"
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-row mb-4 gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="text-sm text-slate-700 mb-2">
                                    수량
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                    placeholder="수량"
                                    className="p-3 bg-slate-100 text-sm text-slate-700 rounded-md"
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="text-sm text-slate-700 mb-2">
                                    가격
                                </label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(e.target.value)
                                        }
                                        placeholder="가격"
                                        className="p-3 bg-slate-100 text-sm text-slate-700 rounded-l-md w-full"
                                    />
                                    <select className="p-3 bg-slate-100 text-sm text-slate-700 rounded-r-md border-slate-200">
                                        {currencies.map((currency) => (
                                            <option
                                                key={currency}
                                                value={currency}
                                            >
                                                {currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.price && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row justify-end gap-2">
                        <button
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-300 text-sm font-semibold text-slate-700 rounded-md transition-all"
                            onClick={() => setIsModalOpen(false)}
                        >
                            취소
                        </button>
                        <button
                            className="px-3 py-2 bg-[#e1f0ff] hover:bg-[#3699ff] text-sm font-semibold text-[#3699ff] hover:text-white rounded-md transition-all"
                            onClick={handleSubmit}
                        >
                            추가
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
