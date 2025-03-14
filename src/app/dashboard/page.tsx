'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchPatients = async () => {
            const { data, error } = await supabase.from('patients').select('*'); // ✅ let → const 변경
            if (error) {
                console.error(error);
            } else {
                setPatients(data || []); // 🛠 null 방지: 기본값을 빈 배열로 설정
            }
        };
        fetchPatients();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold">상담 대상자 목록</h2>
            <ul className="mt-4">
                {patients.map((patient) => (
                    <li
                        key={patient.id}
                        className="cursor-pointer text-blue-600"
                        onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                    >
                        {patient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
