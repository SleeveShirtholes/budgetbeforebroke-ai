import { renderHook, act } from '@testing-library/react';
import useSWR from 'swr';
import { useDebts } from '../useDebts';
import * as debtActions from '@/app/actions/debt';
import type { CreateDebtInput, UpdateDebtInput, CreateDebtPaymentInput } from '@/types/debt';

// Mock SWR
jest.mock('swr');

// Mock debt actions
jest.mock('@/app/actions/debt');

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
// Removed unused mockGetDebts variable
const mockCreateDebt = debtActions.createDebt as jest.MockedFunction<typeof debtActions.createDebt>;
const mockUpdateDebt = debtActions.updateDebt as jest.MockedFunction<typeof debtActions.updateDebt>;
const mockDeleteDebt = debtActions.deleteDebt as jest.MockedFunction<typeof debtActions.deleteDebt>;
const mockCreateDebtPayment = debtActions.createDebtPayment as jest.MockedFunction<typeof debtActions.createDebtPayment>;

describe('useDebts', () => {
  const mockDebts = [
    {
      id: '1',
      budgetAccountId: 'account-1',
      createdByUserId: 'user-1',
      name: 'Credit Card',
      balance: 50,
      interestRate: 18.99,
      dueDate: new Date('2024-10-22'),
      createdAt: new Date('2024-10-21'),
      updatedAt: new Date('2024-10-22'),
      payments: [
        {
          id: 'payment-1',
          debtId: '1',
          amount: 500,
          date: new Date('2024-10-22'),
          note: 'Monthly payment',
          createdAt: new Date('2024-10-21'),
          updatedAt: new Date('2024-10-22'),
        },
      ],
    },
    {
      id: '2',
      budgetAccountId: 'account-1',
      createdByUserId: 'user-1',
      name: 'Student Loan',
      balance: 250,
      interestRate: 500.5,
      dueDate: new Date('2024-10-22'),
      createdAt: new Date('2024-10-21'),
      updatedAt: new Date('2024-10-22'),
      payments: [],
    },
  ];

  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default SWR mock setup
    mockUseSWR.mockReturnValue({
      data: mockDebts,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
  });

  describe('data fetching', () => {
    it('should fetch debts when budgetAccountId is provided', () => {
      const budgetAccountId = 'account-1';
      
      renderHook(() => useDebts(budgetAccountId));

      expect(mockUseSWR).toHaveBeenCalledWith(
        ['/api/debts', budgetAccountId],
        expect.any(Function),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
        }
      );
    });

    it('should not fetch debts when budgetAccountId is not provided', () => {
      renderHook(() => useDebts());

      expect(mockUseSWR).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
        }
      );
    });

    it('should return debts data', () => {
      const { result } = renderHook(() => useDebts('account-1'));
      expect(result.current.debts).toEqual(mockDebts);
    });

    it('should return empty array when no data', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useDebts('account-1'));
      expect(result.current.debts).toEqual([]);
    });

    it('should return loading state', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useDebts('account-1'));
      expect(result.current.isLoading).toBe(true);
    });

    it('should return error state', () => {
      const mockError = new Error('Failed to fetch debts');
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useDebts('account-1'));
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('addDebt', () => {
    it('should create a debt successfully', async () => {
      const debtData: CreateDebtInput = {
        name: 'New Debt',
        balance: 1000,
        interestRate: 105,
        dueDate: '2024-10-22',
      };

      mockCreateDebt.mockResolvedValue({ id: '11111111-1111-1111-1111-111111111111' });
      mockMutate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.addDebt(debtData);
      });

      expect(mockCreateDebt).toHaveBeenCalledWith(debtData);
      expect(mockMutate).toHaveBeenCalled();
      expect(response).toEqual({ success: true });
    });

    it('should handle error when creating debt fails', async () => {
      const debtData: CreateDebtInput = {
        name: 'New Debt',
        balance: 1000,
        interestRate: 105,
        dueDate: '2024-10-22',
      };

      const mockError = new Error('Failed to create debt');
      mockCreateDebt.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.addDebt(debtData);
      });

      expect(mockCreateDebt).toHaveBeenCalledWith(debtData);
      expect(mockMutate).not.toHaveBeenCalled();
      expect(response).toEqual({ success: false, error: mockError });
    });
  });

  describe('updateDebtById', () => {
    it('should update a debt successfully', async () => {
      const debtData: UpdateDebtInput = {
        id: '1',
        name: 'Updated Credit Card',
        balance: 4500,
        interestRate: 18.99,
        dueDate: '2024-10-22',
      };

      mockUpdateDebt.mockResolvedValue({ id: '1' });
      mockMutate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.updateDebtById(debtData);
      });

      expect(mockUpdateDebt).toHaveBeenCalledWith(debtData);
      expect(mockMutate).toHaveBeenCalled();
      expect(response).toEqual({ success: true });
    });

    it('should handle error when updating debt fails', async () => {
      const debtData: UpdateDebtInput = {
        id: '1',
        name: 'Updated Credit Card',
        balance: 4500,
        interestRate: 18.99,
        dueDate: '2024-10-22',
      };

      const mockError = new Error('Failed to update debt');
      mockUpdateDebt.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.updateDebtById(debtData);
      });

      expect(mockUpdateDebt).toHaveBeenCalledWith(debtData);
      expect(mockMutate).not.toHaveBeenCalled();
      expect(response).toEqual({ success: false, error: mockError });
    });
  });

  describe('removeDebt', () => {
    it('should delete a debt successfully', async () => {
      const debtId = '1';

      mockDeleteDebt.mockResolvedValue({ id: '1' });
      mockMutate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.removeDebt(debtId);
      });

      expect(mockDeleteDebt).toHaveBeenCalledWith(debtId);
      expect(mockMutate).toHaveBeenCalled();
      expect(response).toEqual({ success: true });
    });

    it('should handle error when deleting debt fails', async () => {
      const debtId = '1';

      const mockError = new Error('Failed to delete debt');
      mockDeleteDebt.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.removeDebt(debtId);
      });

      expect(mockDeleteDebt).toHaveBeenCalledWith(debtId);
      expect(mockMutate).not.toHaveBeenCalled();
      expect(response).toEqual({ success: false, error: mockError });
    });
  });

  describe('addPayment', () => {
    it('should create a payment successfully', async () => {
      const paymentData: CreateDebtPaymentInput = {
        debtId: '1',
        amount: 300,
        date: '2024-10-22',
        note: 'Extra payment',
      };

      mockCreateDebtPayment.mockResolvedValue({ id: '22222222-2222-2222-2222-222222222222' });
      mockMutate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.addPayment(paymentData);
      });

      expect(mockCreateDebtPayment).toHaveBeenCalledWith(paymentData);
      expect(mockMutate).toHaveBeenCalled();
      expect(response).toEqual({ success: true });
    });

    it('should handle error when creating payment fails', async () => {
      const paymentData: CreateDebtPaymentInput = {
        debtId: '1',
        amount: 300,
        date: '2024-10-22',
        note: 'Extra payment',
      };

      const mockError = new Error('Failed to create payment');
      mockCreateDebtPayment.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDebts('account-1'));

      let response;
      await act(async () => {
        response = await result.current.addPayment(paymentData);
      });

      expect(mockCreateDebtPayment).toHaveBeenCalledWith(paymentData);
      expect(mockMutate).not.toHaveBeenCalled();
      expect(response).toEqual({ success: false, error: mockError });
    });
  });

  describe('mutateDebts', () => {
    it('should expose the mutate function', () => {
      const { result } = renderHook(() => useDebts('account-1'));
      expect(result.current.mutateDebts).toBe(mockMutate);
    });
  });

  describe('SWR configuration', () => {
    it('should use correct SWR configuration', () => {
      renderHook(() => useDebts('account-1'));

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
        }
      );
    });
  });
}); 