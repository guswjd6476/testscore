'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Enneagram data
type EnneagramData = {
    type: string;
    integration: number;
    disintegration: number;
    wings: number[];
};

const enneagramData: Record<number, EnneagramData> = {
    1: { type: '장', integration: 7, disintegration: 4, wings: [9, 2] },
    2: { type: '가슴', integration: 4, disintegration: 8, wings: [1, 3] },
    3: { type: '가슴', integration: 6, disintegration: 9, wings: [2, 4] },
    4: { type: '가슴', integration: 1, disintegration: 2, wings: [3, 5] },
    5: { type: '머리', integration: 8, disintegration: 7, wings: [4, 6] },
    6: { type: '머리', integration: 9, disintegration: 3, wings: [5, 7] },
    7: { type: '머리', integration: 5, disintegration: 1, wings: [6, 8] },
    8: { type: '장', integration: 2, disintegration: 5, wings: [7, 9] },
    9: { type: '장', integration: 3, disintegration: 6, wings: [8, 1] },
};

export default function ResultsPage() {
    const router = useRouter();
    const { id: patientId } = useParams();
    const [results, setResults] = useState<{
        scores: Record<string, number>;
        enneagramType: number;
        type: string;
        integration: number;
        disintegration: number;
        wingType: number;
    } | null>(null); // Typing for results to handle nullable state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const { data, error } = await supabase
                .from('personality_tests')
                .select('answers')
                .eq('patient_id', patientId)
                .maybeSingle();

            if (error || !data) return;

            const answers = data.answers;
            const scores: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0 };

            Object.keys(answers).forEach((key) => {
                const category = key[0];
                if (scores[category] !== undefined) {
                    scores[category] += answers[key];
                }
            });

            const highestType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
            const enneagramType = highestType.charCodeAt(0) - 64; // A=1, B=2, ..., I=9
            const { type, integration, disintegration, wings } = enneagramData[enneagramType];
            const wingType = scores[wings[0]] > scores[wings[1]] ? wings[0] : wings[1];

            setResults({ scores, enneagramType, type, integration, disintegration, wingType });
            setLoading(false);
        };

        fetchResults();
    }, [patientId]);

    if (loading) return <p>로딩 중...</p>;
    if (!results) return <p>결과를 불러오는 데 실패했습니다.</p>;

    console.log(results, '???');
    const chartData = {
        labels: Object.keys(results.scores),
        datasets: [
            {
                label: '응답 점수',
                data: Object.values(results.scores),
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
                    options={{ responsive: true, plugins: { legend: { display: false } } }}
                />
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold">
                    에니어그램 유형: {results.enneagramType} ({results.type} 유형)
                </p>
                <p>날개 유형: {results.wingType}</p>
                <p>통합 방향: {results.integration} → 성장</p>
                <p>분열 방향: {results.disintegration} → 스트레스</p>
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
