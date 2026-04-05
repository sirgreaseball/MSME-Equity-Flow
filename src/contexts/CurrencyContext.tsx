import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  exchangeRate: number;
  format: (amount: number) => string;
  convert: (amount: number) => number;
  toBaseCurrency: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

// Fallback if API is unreachable
const FALLBACK_RATE = 83.45;

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('equityFlow_currency') as Currency) || 'USD';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_RATE);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.INR) {
          setExchangeRate(data.rates.INR);
          console.log(`Live Exchange Rate Updated: $1 = ₹${data.rates.INR}`);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate, using fallback:", error);
      }
    };
    fetchRate();
  }, []);

  const setCurrency = (c: Currency) => {
    localStorage.setItem('equityFlow_currency', c);
    setCurrencyState(c);
  };

  const symbol = currency === 'USD' ? '$' : '₹';

  // amount is assumed to be in the base currency (INR)
  const convert = useCallback((amount: number): number => {
    if (currency === 'INR') return amount;
    return amount / exchangeRate;
  }, [currency, exchangeRate]);

  // converts a displayed currency value back to base currency (INR)
  const toBaseCurrency = useCallback((amount: number): number => {
    if (currency === 'INR') return amount;
    return amount * exchangeRate;
  }, [currency, exchangeRate]);

  const format = useCallback((amount: number): string => {
    const convertedAmount = convert(amount);
    
    if (currency === 'INR') {
      // Indian number formatting: 1,00,000 style
      return '₹' + Math.round(convertedAmount).toLocaleString('en-IN');
    }
    
    // USD formatting: $100,000.00 style
    return '$' + convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [currency, convert]);

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      symbol, 
      exchangeRate, 
      format, 
      convert,
      toBaseCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
