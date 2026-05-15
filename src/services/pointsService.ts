import { authService } from '@/src/services/authService';
import { LotteryEntry, PointsLedger } from '@/src/types';

let ledger: PointsLedger[] = [
  {
    id: 'points-1',
    userId: 'user-demo-1',
    shopId: 'shop-choppers',
    points: 120,
    reason: 'Treuebonus',
    source: 'bonus',
    createdAt: new Date().toISOString(),
  },
];

let lotteryEntries: LotteryEntry[] = [];

export const pointsService = {
  async listLedgerByUser(userId: string) {
    return ledger.filter((entry) => entry.userId === userId);
  },

  async addPoints(entry: Omit<PointsLedger, 'id' | 'createdAt'>) {
    const next: PointsLedger = {
      ...entry,
      id: `points-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    ledger = [next, ...ledger];
    authService.adjustPoints(entry.userId, entry.points);

    return next;
  },

  async getBalanceForUser(userId: string) {
    return ledger
      .filter((entry) => entry.userId === userId)
      .reduce((sum, entry) => sum + entry.points, 0);
  },

  async createLotteryEntry(entry: Omit<LotteryEntry, 'id' | 'createdAt'>) {
    const next: LotteryEntry = {
      ...entry,
      id: `lottery-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    lotteryEntries = [next, ...lotteryEntries];
    return next;
  },

  async listLotteryEntries(userId: string) {
    return lotteryEntries.filter((entry) => entry.userId === userId);
  },
};
