'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { session, login, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.replace('/dashboard');
        }
    }, [session, router]);

    if (session === undefined) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    const handleLogin = async () => {
        setLoading(true);
        await login(email, password);
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {session ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">환영합니다!</h1>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md mb-2 w-64"
                        onClick={() => router.push('/dashboard')}
                    >
                        대시보드로 이동
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md w-64"
                        onClick={logout}
                    >
                        로그아웃
                    </button>
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-4">상담사 로그인</h1>
                    <input
                        className="border p-2 mb-2 w-64"
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="border p-2 mb-4 w-64"
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md w-64"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </>
            )}
        </div>
    );
}
