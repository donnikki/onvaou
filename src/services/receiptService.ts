import { Receipt } from '@/src/types';

let receipts: Receipt[] = [];

export const receiptService = {
  async listByUser(userId: string) {
    return receipts.filter((receipt) => receipt.userId === userId);
  },

  async createDraft(userId: string, shopId?: string) {
    const receipt: Receipt = {
      id: `receipt-${Date.now()}`,
      userId,
      shopId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    receipts = [receipt, ...receipts];

    return receipt;
  },
};
