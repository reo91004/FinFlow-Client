import { FinancialProduct } from './FinancialProduct';

export interface Asset {
    portfolio_id: number;
    currency_code: string;
    price: number;
    quantity: number;
    financial_product: FinancialProduct;
}