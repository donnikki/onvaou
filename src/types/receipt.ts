export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export type Receipt = {
  id: string;
  userId: string;
  shopId?: string;
  imageUrl?: string;
  totalAmount?: number;
  purchaseDate?: string;
  status: ReceiptStatus;
  extractedText?: string;
  createdAt: string;
};
