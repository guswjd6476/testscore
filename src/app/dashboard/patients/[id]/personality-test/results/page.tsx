'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function ResultsPage() {
    const router = useRouter();
    const { id: patientId } = useParams();
    const [results, setResults] = useState<{ categoryScores: Record<string, number> } | null>(null);
    const [loading, setLoading] = useState(true);

    // supabase에서 결과 데이터 불러오기
    useEffect(() => {
        const fetchResults = async () => {
            const { data, error } = await supabase
                .from('personality_tests')
                .select('answers')
                .eq('patient_id', patientId)
                .maybeSingle();

            if (error || !data) {
                console.error('Error fetching data or no data found');
                return;
            }

            const answers = data.answers;
            // 각 카테고리 점수를 누적 (카테고리: A, B, C, D, E, F, G, H, I)
            const scores: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0 };

            for (let i = 1; i <= 9; i++) {
                scores.A += answers[`a${i}`] || 0;
                scores.B += answers[`b${i}`] || 0;
                scores.C += answers[`c${i}`] || 0;
                scores.D += answers[`d${i}`] || 0;
                scores.E += answers[`e${i}`] || 0;
                scores.F += answers[`f${i}`] || 0;
                scores.G += answers[`g${i}`] || 0;
                scores.H += answers[`h${i}`] || 0;
                scores.I += answers[`i${i}`] || 0;
            }

            setResults({ categoryScores: scores });
            setLoading(false);
        };

        fetchResults();
    }, [patientId]);

    if (loading) return <p className="text-center text-gray-600">로딩 중...</p>;
    if (!results) return <p className="text-center text-red-500">결과를 불러오는 데 실패했습니다.</p>;

    // 원하는 순서에 따른 매핑 설정 (F는 3번으로 가정)
    const order = ['D', 'F', 'E', 'A', 'B', 'C', 'G', 'H', 'I'];
    const labelMapping: Record<string, string> = {
        D: '2',
        F: '3',
        E: '4',
        A: '5',
        B: '6',
        C: '7',
        G: '8',
        H: '9',
        I: '1',
    };

    const chartLabels = order.map((key) => labelMapping[key]);
    const chartValues = order.map((key) => results.categoryScores[key]);

    const chartData = {
        labels: chartLabels, // ['2', '3', '4', '5', '6', '7', '8', '9', '1']
        datasets: [
            {
                label: '점수',
                data: chartValues,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
            {/* 헤더 */}
            <header className="text-center border-b pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">에니어그램 성격 유형 검사 결과</h1>
                <p className="text-sm text-gray-500">환자 ID: {patientId}</p>
            </header>

            {/* 그래프 섹션 */}
            <div className="mb-6">
                <Line
                    data={chartData}
                    options={{ responsive: true }}
                />
            </div>

            {/* 점수 테이블 - (필요시 순서를 변경하여 출력 가능) */}
            <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">카테고리</th>
                        <th className="border p-2">점수</th>
                    </tr>
                </thead>
                <tbody>
                    {order.map((key) => (
                        <tr
                            key={key}
                            className="text-center"
                        >
                            <td className="border p-2">{labelMapping[key]}</td>
                            <td className="border p-2">{results.categoryScores[key]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 버튼 섹션 */}
            <div className="mt-6 flex justify-between">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    인쇄하기
                </button>
                <button
                    onClick={() => router.push(`/dashboard/patients/${patientId}`)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                    뒤로 가기
                </button>
            </div>
        </div>
    );
}
