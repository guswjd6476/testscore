// app/layout.tsx

import { AuthProvider } from './context/AuthContext'; // 방금 만든 AuthContext
import './globals.css';

export const metadata = {
    title: '상담사 시스템',
    description: '상담사 대시보드 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <html lang="ko">
                <body>{children}</body>
            </html>
        </AuthProvider>
    );
}
