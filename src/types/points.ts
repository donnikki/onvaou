export type PointsLedgerSource = 'receipt' | 'deal' | 'admin' | 'bonus';

export type PointsLedger = {
  id: string;
  userId: string;
  shopId?: string;
  points: number;
  reason: string;
  source: PointsLedgerSource;
  createdAt: string;
};

export type LotteryEntry = {
  id: string;
  userId: string;
  lotteryId: string;
  pointsUsed?: number;
  createdAt: string;
};
