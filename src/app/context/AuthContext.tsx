'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/auth-helpers-nextjs'; // Supabase에서 제공하는 타입

// 로그인 정보를 담을 타입 정의
type AuthContextType = {
    session: Session | null; // 세션 정보 (null 허용)
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    // 페이지가 로드될 때 세션을 확인하는 useEffect
    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (!error && data?.session) {
                setSession(data.session);
            }
        };

        checkSession();

        // auth 상태 변경 감지 (로그인/로그아웃 시 자동 업데이트)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'SIGNED_IN') {
                router.push('/dashboard');
            }
            if (event === 'SIGNED_OUT') {
                router.push('/login');
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [router]);

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('로그인 실패: ' + error.message);
        } else {
            setSession(data.session); // 로그인 성공 후 세션 저장
            router.push('/dashboard');
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null); // 로그아웃 후 세션 초기화
        router.push('/login'); // 로그인 페이지로 리다이렉트
    };

    return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>;
};

// 커스텀 훅으로 context를 쉽게 사용할 수 있도록 하기
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
