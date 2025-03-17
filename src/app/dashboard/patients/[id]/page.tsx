'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function PatientPage() {
    const router = useRouter();
    const params = useParams(); // ✅ useParams()는 이제 Promise이므로 안전하게 처리해야 함
    const [patientId, setPatientId] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ useEffect 내부에서 params를 안전하게 처리
    useEffect(() => {
        if (!params) return; // params가 없으면 실행 X
        const id = params.id as string;
        if (!id) return; // ID가 없으면 실행 X

        setPatientId(id);

        const fetchTestStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('personality_tests')
                    .select('id')
                    .eq('patient_id', id)
                    .maybeSingle();

                if (error) throw error;

                setIsCompleted(!!data);
            } catch (err) {
                console.error('Error fetching test status:', err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchTestStatus();
    }, [params]);

    if (loading) return <p className="text-gray-600">⏳ 로딩 중...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold">검사 목록</h2>
            <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2">
                    <span
                        className="cursor-pointer text-blue-600"
                        onClick={() => patientId && router.push(`/dashboard/patients/${patientId}/personality-test`)}
                    >
                        성격 유형 검사
                    </span>
                    {isCompleted ? (
                        <span className="text-green-600 font-bold">✅ 완료</span>
                    ) : (
                        <span className="text-red-500 font-bold">⏳ 진행 중</span>
                    )}
                </li>
                {isCompleted && patientId && (
                    <li>
                        <button
                            onClick={() => router.push(`/dashboard/patients/${patientId}/personality-test/results`)}
                            className="mt-2 bg-blue-500 text-white py-1 px-4 rounded"
                        >
                            결과 확인하기
                        </button>
                    </li>
                )}
                <li
                    className="cursor-pointer text-blue-600"
                    onClick={() => patientId && router.push(`/dashboard/patients/${patientId}/core-emotion-test`)}
                >
                    핵심감정 검사
                </li>
                <li className="cursor-pointer text-gray-500">회복탄력성 검사 (추가 예정)</li>
            </ul>

            {/* 목록보기 버튼 추가 */}
            <div className="mt-4">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                >
                    목록 보기
                </button>
            </div>
        </div>
    );
}
