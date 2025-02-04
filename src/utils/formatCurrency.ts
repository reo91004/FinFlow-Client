import { currencySymbols } from "./currencySymbols";

export const formatCurrency = (
    amount: number,
    currency: keyof typeof currencySymbols
) => {
    const symbol = currencySymbols[currency] || "";
    const absAmount = Math.abs(amount);
    const formattedAmount = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(absAmount);

    return amount < 0
        ? `-${symbol}${formattedAmount}`
        : `${symbol}${formattedAmount}`;
};
