'use client';

import { useState, useEffect } from 'react';
import { useLiff } from '@/hooks/useLiff';
import { VoteStatus, YogaRequest } from '@/types/yoga';

export default function YogaVoting() {
  const { profile, isReady } = useLiff();
  const [selectedDate, setSelectedDate] = useState('2026-04-06'); // 預設下一堂課
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleVote = async (status: VoteStatus) => {
    if (!profile) return;
    
    setLoading(true);
    setMessage('');

    try {
      const payload: YogaRequest = {
        action: 'toggleVote',
        date: selectedDate,
        userId: profile.userId,
        displayName: profile.displayName,
        status: status,
      };

      const res = await fetch('/api/yoga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (result.success) {
        setMessage(status === 'REGISTERED' ? '✅ 報名成功！' : '点 取消成功');
      } else {
        setMessage(`❌ 失敗：${result.message || '發生未知錯誤'}`);
      }
    } catch (err) {
      setMessage('❌ 連線伺服器失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) return <div className="p-8 text-center">LINE 初始化中...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">瑜珈教室投票系統</h1>
      
      {/* 資訊卡片 */}
      <div className="bg-blue-50 p-4 rounded-xl mb-6">
        <p className="text-sm text-blue-600">哈囉，{profile.displayName}！</p>
        <p className="text-xs text-blue-400 mt-1">請選擇課程日期進行報名或取消</p>
      </div>

      {/* 日期選擇器 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">選擇課程日期</label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* 按鈕區域 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleVote('REGISTERED')}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? '處理中...' : '我要報名'}
        </button>
        <button
          onClick={() => handleVote('CANCELLED')}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? '處理中...' : '取消報名'}
        </button>
      </div>

      {/* 訊息回饋 */}
      {message && (
        <div className={`mt-6 p-3 rounded-lg text-center font-medium ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
