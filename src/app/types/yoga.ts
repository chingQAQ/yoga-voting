import { z } from 'zod';

// 定義報名狀態
export const VoteStatusSchema = z.enum(['REGISTERED', 'CANCELLED', 'PENDING']);
export type VoteStatus = z.infer<typeof VoteStatusSchema>;

// 定義與 GAS 通訊的 Request Schema
export const YogaActionSchema = z.object({
  action: z.enum(['toggleVote', 'getVotes']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "格式必須為 YYYY-MM-DD"),
  userId: z.string().optional(), // toggleVote 必填
  displayName: z.string().optional(),
  status: VoteStatusSchema.optional(),
});

// 利用 Zod 推導出 TypeScript 型別
export type YogaRequest = z.infer<typeof YogaActionSchema>;
