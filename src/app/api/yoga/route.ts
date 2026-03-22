import { NextResponse } from 'next/server';
import { YogaActionSchema } from '@/types/yoga';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 使用 Zod 驗證前端傳來的資料
    const validated = YogaActionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.format() }, { status: 400 });
    }

    // 2. 轉發請求給 GAS
    const gasResponse = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated.data),
    });

    const result = await gasResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 });
  }
}
