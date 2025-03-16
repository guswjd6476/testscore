'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsPage() {
    const router = useRouter();
    const { id: patientId } = useParams();
    const [results, setResults] = useState<{
        categoryScores: Record<string, number>;
    } | null>(null); // Categorized score data for chart
    const [loading, setLoading] = useState(true);

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
            console.log(data, '?data');

            // 각 카테고리 점수 초기화
            const scores: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0 };

            // 점수 합산
            for (let i = 1; i <= 9; i++) {
                // A 카테고리 (a1, a2, ..., a9)
                scores.A += answers[`a${i}`] || 0;
                // B 카테고리 (b1, b2, ..., b9)
                scores.B += answers[`b${i}`] || 0;
                // C 카테고리 (c1, c2, ..., c9)
                scores.C += answers[`c${i}`] || 0;
                // D 카테고리 (d1, d2, ..., d9)
                scores.D += answers[`d${i}`] || 0;
                // E 카테고리 (e1, e2, ..., e9)
                scores.E += answers[`e${i}`] || 0;
                // F 카테고리 (f1, f2, ..., f9)
                scores.F += answers[`f${i}`] || 0;
                // G 카테고리 (g1, g2, ..., g9)
                scores.G += answers[`g${i}`] || 0;
                // H 카테고리 (h1, h2, ..., h9)
                scores.H += answers[`h${i}`] || 0;
                // I 카테고리 (i1, i2, ..., i9)
                scores.I += answers[`i${i}`] || 0;
            }

            setResults({ categoryScores: scores });
            setLoading(false);
        };

        fetchResults();
    }, [patientId]);

    if (loading) return <p>로딩 중...</p>;
    if (!results) return <p>결과를 불러오는 데 실패했습니다.</p>;

    // 에니어그램 유형 매핑
    const enneagramTypes: Record<string, number> = {
        A: 5, // A -> 5번
        B: 6, // B -> 6번
        C: 7, // C -> 7번
        D: 2, // D -> 2번
        E: 3, // E -> 3번
        F: 4, // F -> 4번
        G: 8, // G -> 8번
        H: 9, // H -> 9번
        I: 1, // I -> 1번
    };

    const getEnneagramInfo = (category: string) => {
        const score = results.categoryScores[category];
        const type = enneagramTypes[category];

        // 성격 유형, 통합/분열, 날개 정보 생성
        let categoryType = '';
        let integrationDirection = '';
        let wing = '';

        if (score >= 25) {
            categoryType = `성격 유형: 통합 (에니어그램 ${type}번)`;
            integrationDirection = '통합 방향: 높은 자아 인식';
            wing = `날개: 유형 ${type === 5 ? 4 : 6}`; // 예시: 5번 유형은 4번 혹은 6번 날개
        } else if (score <= 10) {
            categoryType = `성격 유형: 분열 (에니어그램 ${type}번)`;
            integrationDirection = '분열 방향: 감정적 불안정성';
            wing = `날개: 유형 ${type === 6 ? 5 : 7}`; // 예시: 6번 유형은 5번 혹은 7번 날개
        } else {
            categoryType = `성격 유형: 일반 (에니어그램 ${type}번)`;
            integrationDirection = '방향: 안정적';
            wing = `날개: 유형 ${type === 7 ? 8 : 6}`; // 예시: 7번 유형은 8번 혹은 6번 날개
        }

        return { categoryType, integrationDirection, wing };
    };

    // chart data
    const chartData = {
        labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        datasets: [
            {
                label: '카테고리 점수',
                data: [
                    results.categoryScores.A,
                    results.categoryScores.B,
                    results.categoryScores.C,
                    results.categoryScores.D,
                    results.categoryScores.E,
                    results.categoryScores.F,
                    results.categoryScores.G,
                    results.categoryScores.H,
                    results.categoryScores.I,
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-6">검사 결과</h2>
            <div className="mb-6">
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.raw;
                                        return `점수: ${value}`;
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true, // y축을 0부터 시작하게 설정
                                ticks: {
                                    stepSize: 1, // y축 간격을 1로 설정
                                },
                            },
                        },
                    }}
                />
            </div>
            <div className="text-center">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((category) => {
                    const { categoryType, integrationDirection, wing } = getEnneagramInfo(category);
                    return (
                        <div key={category} className="mb-4">
                            <h3 className="text-xl font-semibold">
                                카테고리 {category} (에니어그램 {enneagramTypes[category]}번)
                            </h3>
                            <p>{categoryType}</p>
                            <p>{integrationDirection}</p>
                            <p>{wing}</p>
                        </div>
                    );
                })}
            </div>
            <button
                onClick={() => router.push(`/dashboard/patients/${patientId}`)}
                className="mt-6 bg-gray-500 text-white font-bold py-2 px-6 rounded-lg block mx-auto"
            >
                뒤로 가기
            </button>
        </div>
    );
}
