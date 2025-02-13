"use client";

import { useModalStore } from "@/app/store/modal";
import AddInvestmentsModal from "./_component/AddInvestmentsModal";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import Collapse from "@mui/material/Collapse"; // Material-UI Collapse import
import DeleteTransactionsModal from './_component/DeleteTransactionsModal';

export default function Page() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { isInvestmentsModalOpen, setIsInvestmentsModalOpen, isTransactionsDeleteModalOpen, setIsTransactionsDeleteModalOpen } = useModalStore();

  const tableData = [
    {
      id: 2,
      operation: "판매",
      name: "Apple Inc",
      symbol: "AAPL",
      date: "01/02/2025",
      quantity: 10,
      price: 236.0,
      currency: "USD",
      profitRate: -2.9,
    },
    {
      id: 1,
      operation: "구매",
      name: "Apple Inc",
      symbol: "AAPL",
      date: "01/01/2025",
      quantity: 10,
      price: 243.04,
      currency: "USD",
    },
  ];

  // 구매와 판매 각각의 총 금액(가격 * 거래량) 계산 (화폐 단위별 그룹)
  const purchaseTotals = tableData.reduce((acc, item) => {
    if (item.operation === "구매") {
      const total = item.price * item.quantity;
      acc[item.currency] = (acc[item.currency] || 0) + total;
    }
    return acc;
  }, {} as Record<string, number>);

  const saleTotals = tableData.reduce((acc, item) => {
    if (item.operation === "판매") {
      const total = item.price * item.quantity;
      acc[item.currency] = (acc[item.currency] || 0) + total;
    }
    return acc;
  }, {} as Record<string, number>);

  // 선택된 항목 삭제 처리 (필요에 따라 API 호출 등으로 구현)
  const handleDelete = () => {
    console.log("Delete items:", selectedItems);
    setIsTransactionsDeleteModalOpen(true);
  };

  return (
    <>
      {isInvestmentsModalOpen && <AddInvestmentsModal />}
      {isTransactionsDeleteModalOpen && <DeleteTransactionsModal/ >}
      <div className="p-10 bg-white rounded-2xl shadow-xl">
        <button
          className="bg-[#e1f0ff] hover:bg-[#3699ff] text-[#3699ff] hover:text-white flex justify-center items-center gap-1 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all mb-4"
          onClick={() => setIsInvestmentsModalOpen(true)}
        >
          <Plus />
          추가
        </button>

        {/* 컨테이너 내부에 삭제 버튼 영역과 기존 총 금액 영역을 모두 렌더링한 후,
            선택 여부에 따라 슬라이딩 효과로 표시되도록 처리 */}
        <div className="relative">
          {/* 삭제 버튼 영역 – 선택된 항목이 하나 이상일 때 슬라이딩되며 나타남 */}
          <Collapse in={selectedItems.length > 0} timeout="auto" unmountOnExit>
            <div className="mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleDelete}
                  className="p-2 bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white flex justify-center items-center gap-2 px-3.5 py-2 text-sm rounded-[0.5rem] transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제 ({selectedItems.length})
                </button>
              </div>
            </div>
          </Collapse>

          {/* 구매/판매 총 금액 영역 – 선택된 항목이 없을 때 표시 */}
          <Collapse in={selectedItems.length === 0} timeout="auto" unmountOnExit>
            <div className="mb-6">
              <div className="inline-flex flex-row gap-4 p-4 rounded-md border-[1px] border-slate-200 text-sm text-slate-500">
                <div>
                  <div>
                    <span className="text-[#1bc5bd] mr-1">•</span>
                    구매
                  </div>
                  <div>
                    {Object.entries(purchaseTotals).map(([currency, total]) => (
                      <p key={currency} className="text-slate-700">
                        {formatCurrency(total, currency)}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <div>
                    <span className="text-red-500 mr-1">•</span>
                    판매
                  </div>
                  <div>
                    {Object.entries(saleTotals).map(([currency, total]) => (
                      <p key={currency} className="text-slate-700">
                        {formatCurrency(total, currency)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>

        {/* 테이블 영역 */}
        <div className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-[50px] px-4 pb-3 text-left font-normal align-middle">
                  <input
                    type="checkbox"
                    className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem] relative border-2 border-transparent checked:border-transparent checked:bg-[#3699FE] checked:before:block checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
                    checked={selectedItems.length === tableData.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(tableData.map((item) => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  거래 종류
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  보유 자산
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  날짜
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  거래량
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  가격
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  요약
                </th>
                <th className="pb-3 text-left text-slate-400 font-normal">
                  총 수익
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-100">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 appearance-none bg-slate-200 text-white rounded-[0.2rem] relative border-2 border-transparent checked:border-transparent checked:bg-[#3699FE] checked:before:block checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center transition-all"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => {
                        setSelectedItems((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                    />
                  </td>
                  <td className="py-3">
                    <span
                      className={`${
                        item.operation === "판매"
                          ? "text-red-500"
                          : item.operation === "구매"
                          ? "text-[#1bc5bd]"
                          : ""
                      } font-semibold`}
                    >
                      {item.operation}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="text-slate-700">{item.name}</div>
                    <div className="text-slate-500">{item.symbol}</div>
                  </td>
                  <td className="py-3 text-slate-700">{item.date}</td>
                  <td className="py-3 text-slate-700">{item.quantity}</td>
                  <td className="py-3 text-slate-700">
                    {formatCurrency(item.price, item.currency)}
                  </td>
                  <td className="py-3">
                    <p
                      className={`${
                        item.operation === "판매"
                          ? "text-[#1bc5bd]"
                          : "text-red-500"
                      } font-semibold`}
                    >
                      {item.operation === "구매" ? "-" : ""}
                      {formatCurrency(item.price * item.quantity, item.currency)}
                    </p>
                  </td>
                  <td className="py-3">
                    {item.operation === "판매" ? (
                      <div>
                        <p
                          className={`${
                            item.profitRate && item.profitRate < 0
                              ? "text-red-500"
                              : "text-[#1bc5bd]"
                          }`}
                        >
                          {item.profitRate
                            ? formatCurrency(
                                (item.price * item.quantity * item.profitRate) /
                                  100,
                                item.currency
                              )
                            : ""}
                        </p>
                        <p
                          className={`${
                            item.profitRate && item.profitRate < 0
                              ? "text-red-500"
                              : "text-[#1bc5bd]"
                          } text-xs`}
                        >
                          {item.profitRate ? (
                            <>
                              {item.profitRate > 0 ? "+" : ""}
                              {item.profitRate.toFixed(2)}%
                            </>
                          ) : (
                            ""
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-500">---</p>
                    )}
                  </td>
                  <td className="py-3">
                    <button className="p-2 bg-[#FFE2E5] hover:bg-[#F64E60] text-[#f64e60] hover:text-white rounded-[0.5rem] transition-all" onClick={() => setIsTransactionsDeleteModalOpen(true)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t">
              <tr>
                <td className="py-3"></td>
                <td className="py-3 font-semibold text-slate-700">Total</td>
                <td className="py-3"></td>
                <td className="py-3"></td>
                <td className="py-3"></td>
                <td className="py-3"></td>
                <td className="py-3"></td>
                <td className="py-3">
                  {Object.entries(
                    tableData.reduce((acc, item) => {
                      if (item.operation === "판매" && item.profitRate) {
                        const profit =
                          (item.price * item.quantity * item.profitRate) / 100;
                        acc[item.currency] =
                          (acc[item.currency] || 0) + profit;
                      }
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([currency, total]) => (
                    <p
                      key={currency}
                      className={`${
                        total < 0 ? "text-red-500" : "text-[#1bc5bd]"
                      } font-semibold`}
                    >
                      {formatCurrency(total, currency as any)}
                    </p>
                  ))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* 페이지네이션 예시 */}
        <div className="flex justify-between mt-6">
                    <div className="flex flex-row gap-2">
                        <button className="w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all">
                            <ChevronsLeft width={16} height={16} />
                        </button>
                        <button className="w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all">
                            <ChevronLeft width={16} height={16} />
                        </button>
                        <button className="w-8 h-8 text-sm text-white bg-[#3699ff] flex justify-center items-center rounded-md">
                            1
                        </button>
                        <button className="w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all">
                            <ChevronRight width={16} height={16} />
                        </button>
                        <button className="w-8 h-8 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 flex justify-center items-center rounded-md transition-all">
                            <ChevronsRight width={16} height={16} />
                        </button>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <select className="px-4 py-2 text-slate-700 bg-slate-100 text-sm rounded-md">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span className="text-slate-700 text-sm">
                            2개 중 1-2 보기
                        </span>
                    </div>
                </div>
      </div>
    </>
  );
}