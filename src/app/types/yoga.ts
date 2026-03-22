import { z } from 'zod';

/**
 * 核心資料結構：日期對應布林值
 * Key: "YYYY-MM-DD"
 * Value: true (已報名) | false (未報名/取消)
 */
export const VotesMapSchema = z.record(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.boolean()
);

export type VotesMap = z.infer<typeof VotesMapSchema>;

/**
 * 完整名單結構：日期對應姓名陣列
 * Key: "YYYY-MM-DD"
 * Value: ["小明", "小華", ...]
 */
export const FullListSchema = z.record(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.array(z.string())
);

export type FullList = z.infer<typeof FullListSchema>;

/**
 * 人數統計結構：日期對應數字
 * Key: "YYYY-MM-DD"
 * Value: 5
 */
export const CountsMapSchema = z.record(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.number()
);

export type CountsMap = z.infer<typeof CountsMapSchema>;

/**
 * API 請求與回應的聯集型別 (Discriminated Union)
 */
export const YogaActionRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('getYogaData'), userId: z.string() }),
  z.object({ action: z.literal('updateVotes'), userId: z.string(), displayName: z.string(), votes: VotesMapSchema }),
]);

export type YogaActionRequest = z.infer<typeof YogaActionRequestSchema>;

