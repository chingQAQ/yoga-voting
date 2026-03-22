'use client';

import { useState, useEffect } from 'react';
import { useLiff } from '@/hooks/useLiff';
import { getNextMonthMondays } from '@/utils/dateUtils';
import { VotesMap, CountsMap, FullList } from '@/types/yoga';

export default function YogaVoting() {
  const { profile, isReady } = useLiff();

  const [view, setView] = useState<'vote' | 'list'>('vote'); // 切換頁面
  
  // 基礎資料狀態
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [counts, setCounts] = useState<CountsMap>({});
  const [fullList, setFullList] = useState<FullList>({});
  const [votes, setVotes] = useState<VotesMap>({});
  
  // UI 狀態
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. 初始化次月週一日期
  useEffect(() => {
    setAvailableDates(getNextMonthMondays());
  }, []);

  // 2. 當 LIFF 準備好且有 profile 時，從 GAS 抓取既有報名資料
  useEffect(() => {
    if (isReady && profile) fetchData();
  }, [isReady, profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/yoga', {
        method: 'POST',
        body: JSON.stringify({ action: 'getYogaData', userId: profile?.userId }),
      });
      const result = await res.json();
      if (result.success) {
        setVotes(result.userVotes || {});
        setCounts(result.counts || {});
        setFullList(result.fullList || {});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (date: string) => {
    setVotes(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    await fetch('/api/yoga', {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateVotes',
        userId: profile.userId,
        displayName: profile.displayName,
        votes
      }),
    });
    await fetchData(); // 儲存後重新抓取最新的人數統計
    setLoading(false);
  };

  if (!isReady) {
    return <div className="flex justify-center items-center h-64 text-gray-400">LINE 環境初始化中...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-2xl rounded-[2.5rem] mt-8 border border-gray-50">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Yoga Class</h1>
        <p className="text-gray-500 text-sm mt-1">請勾選下個月預計參加的瑜伽課</p>
      </header>

      {/* 使用者資訊簡覽 */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-8">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {profile?.displayName?.charAt(0)}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">學員身分</p>
          <p className="text-gray-700 font-bold">{profile?.displayName}</p>
        </div>
      </div>

      {/* 頂部切換 Tab */}
      <div className="flex bg-white border-b sticky top-0 z-10">
        <button 
          onClick={() => setView('vote')}
          className={`flex-1 py-4 font-bold text-sm ${view === 'vote' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          課程報名
        </button>
        <button 
          onClick={() => setView('list')}
          className={`flex-1 py-4 font-bold text-sm ${view === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          查看名單
        </button>
      </div>

      {view === 'list' && (
        <>
            <div className="animate-fadeIn">
            <h2 className="text-xl font-black mb-6">👥 各堂名單統計</h2>
            {availableDates.map(date => (
              <div key={date} className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <span className="font-bold text-gray-800">{date}</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                    共 {fullList[date]?.length || 0} 人
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fullList[date]?.length > 0 ? (
                    fullList[date].map((name, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-300 text-xs italic">尚無人報名</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'vote' && (
        <>
            <div className="space-y-3 mb-10">
                {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-2xl" />)}
                </div>
                ) : (
                availableDates.map(date => {
                    const isChecked = !!votes[date];
                    console.log({
                        votes,
                        date
                    });
                    return (
                    <label 
                        key={date}
                        className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        isChecked 
                            ? 'border-green-500 bg-green-50/50 ring-4 ring-green-50' 
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                        <div className="flex flex-col">
                            <span className={`font-bold ${isChecked ? 'text-green-700' : 'text-gray-600'}`}>{date + ' (一)'}</span>
                            <span className="text-xs text-gray-400 italic">已報名：{counts[date] || 0} 人</span>
                        </div>
                        <div className="relative">
                        <input 
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => handleToggle(date)}
                        />
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-green-600 border-green-600' : 'border-gray-300'
                        }`}>
                            {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            )}
                        </div>
                        </div>
                    </label>
                    );
                })
                )}
            </div>
            {/* 訊息提示 */}
            {message && (
                <div className={`mb-4 p-4 rounded-xl text-sm font-medium text-center ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {message.text}
                </div>
            )}

            {/* 提交按鈕 */}
            <button
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
                {submitting ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    同步資料中...
                </span>
                ) : '儲存變更'}
            </button>
        </>
      )}
    </div>
  );
}
