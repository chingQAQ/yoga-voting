'use client';

import { useState, useEffect } from 'react';
import { useLiff } from '@/hooks/useLiff';
import { getNextMonthMondays } from '@/utils/dateUtils';
import { VotesMap, CountsMap, FullList } from '@/types/yoga';

export default function YogaVoting() {
    const { profile, isReady } = useLiff();
    const [view, setView] = useState<'vote' | 'list'>('vote'); // 切換頁面
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [counts, setCounts] = useState<CountsMap>({});
    const [fullList, setFullList] = useState<FullList>({});
    const [votes, setVotes] = useState<VotesMap>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    // 1. 初始化次月週一日期
    useEffect(() => {
        (() => {
            const dates = getNextMonthMondays();

            setAvailableDates(dates);
        })();
    }, []);

    const fetchData = async () => {
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

        return result;
    };

    // 2. 當 LIFF 準備好且有 profile 時，從 GAS 抓取既有報名資料
    useEffect(() => {
        (async () => {
            if (isReady && profile) {
                setLoading(true);

                fetchData().finally(() => {
                    setLoading(false);
                });
            }
        })();
    }, [isReady, profile]);

    const handleToggle = (date: string) => {
        setMessage(null);
        setVotes((prev) => ({ ...prev, [date]: !prev[date] }));
    };

    const handleSubmit = async () => {
        if (!profile) return;

        setSubmitting(true);

        setMessage(null);

        try {
            await fetch('/api/yoga', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updateVotes',
                    userId: profile.userId,
                    displayName: profile.displayName,
                    votes,
                }),
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: '儲存失敗，請關閉視窗重新嘗試',
            });
        }

        await fetchData(); // 儲存後重新抓取最新的人數統計

        setMessage({
            type: 'success',
            text: '儲存成功。可關閉視窗',
        });

        setSubmitting(false);
    };

    if (!isReady) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-400">
                LINE 環境初始化中...
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-6 bg-white">
            <header className="my-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    請勾選 m+1 月預計參加的瑜伽課
                </h1>
            </header>

            <div className="flex items-start flex-col gap-4 mb-4">
                <p className="text-xs text-gray-300 uppercase font-semibold tracking-wider">
                    *通常情況 4 人開班，有例外情形會另外公告
                </p>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                    即將以 {profile?.displayName} 身分進行預約
                </p>
            </div>

            {/* 頂部切換 Tab */}
            <div
                className={`flex sticky top-0 z-10 mb-10 ${
                    submitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
            >
                <button
                    onClick={() => setView('vote')}
                    className={`flex-1 py-2 font-bold text-sm ${
                        view === 'vote'
                            ? 'text-rose-400 border-b-2 border-rose-400'
                            : 'text-gray-400'
                    }`}
                >
                    投票
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`flex-1 py-2 font-bold text-sm ${
                        view === 'list'
                            ? 'text-rose-400 border-b-2 border-rose-400'
                            : 'text-gray-400'
                    }`}
                >
                    查看結果
                </button>
            </div>

            {view === 'list' && (
                <>
                    <div className="animate-fadeIn">
                        {availableDates.map((date) => (
                            <div
                                key={date}
                                className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-center mb-3 border-b pb-2">
                                    <span className="font-bold text-gray-800">
                                        {date}
                                    </span>
                                    {(fullList[date]?.length || 0) >= 4 ? (
                                        <span className="text-sm bg-blue-100 px-2 py-1 rounded-md text-blue-600">
                                            開班！
                                        </span>
                                    ) : (
                                        <span className="text-sm bg-red-100 px-2 py-1 rounded-md text-red-600">
                                            缺 {4 - (fullList[date]?.length || 0)} 人開班
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {fullList[date]?.length > 0 ? (
                                        fullList[date].map((name, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium"
                                            >
                                                {name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">
                                            尚無人報名
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'vote' && (
                <>
                    <div className="space-y-3 mb-8">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-gray-100 animate-pulse rounded-2xl"
                                    />
                                ))}
                            </div>
                        ) : (
                            availableDates.map((date) => {
                                const isChecked = !!votes[date];

                                return (
                                    <label
                                        key={date}
                                        className={`group flex items-center justify-start py-1 gap-3 transition-all duration-200 cursor-pointer ${
                                            submitting
                                                ? 'opacity-50 cursor-not-allowed pointer-events-none'
                                                : ''
                                        }`}
                                    >
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={isChecked}
                                                onChange={() => handleToggle(date)}
                                            />
                                            <div
                                                className={`w-5 h-5 rounded-full border-1 flex items-center justify-center transition-colors ${
                                                    isChecked
                                                        ? 'bg-rose-400 border-rose-400'
                                                        : 'border-gray-300'
                                                }`}
                                            >
                                                {isChecked && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-white"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span
                                                className={`font-bold ${
                                                    isChecked
                                                        ? 'text-rose-400'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                {date + ' (一)'}
                                            </span>
                                        </div>
                                        <div className="flex-grow text-right text-xs text-gray-400 italic">
                                            人數：{counts[date] || 0}
                                        </div>
                                    </label>
                                );
                            })
                        )}
                        {/* 訊息提示 */}
                        {message && (
                            <div
                                className={`p-4 text-sm font-medium text-center ${
                                    message.type === 'success'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* 提交按鈕 */}
                    {!loading && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-rose-400 hover:bg-black text-white font-bold py-2 rounded-[12px] shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    儲存變更中...
                                </span>
                            ) : (
                                '儲存變更'
                            )}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
