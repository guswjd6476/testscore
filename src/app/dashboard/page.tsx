'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [patients, setPatients] = useState<
        { id: string; name: string; birth_date: string; email: string; phone: string }[]
    >([]);
    const [newPatient, setNewPatient] = useState({
        name: '',
        birth_date: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false); // 추가 폼 보이게 하는 상태
    const router = useRouter();

    // 상담 대상자 목록 불러오기
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const { data, error } = await supabase.from('patients').select('*');
        if (error) {
            console.error(error);
        } else {
            setPatients(data || []);
        }
    };

    // 입력 값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPatient((prev) => ({ ...prev, [name]: value }));
    };

    // 상담 대상자 추가
    const addPatient = async () => {
        const { name, birth_date, email, phone } = newPatient;

        if (!name.trim() || !birth_date.trim() || !email.trim() || !phone.trim()) {
            alert('모든 필드를 입력하세요.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.from('patients').insert([{ name, birth_date, email, phone }]).select();
        setLoading(false);

        if (error) {
            console.error(error);
            alert('추가 중 오류가 발생했습니다.');
        } else {
            setPatients((prev) => [...prev, ...data]); // 목록 업데이트
            setNewPatient({ name: '', birth_date: '', email: '', phone: '' }); // 입력값 초기화
            setShowForm(false); // 폼 닫기
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">상담 대상자 목록</h2>

            {/* 상담 대상자 추가 버튼 */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-200 w-full mb-6"
                >
                    상담 대상자 추가
                </button>
            ) : (
                <>
                    {/* 상담 대상자 추가 입력 필드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <input
                            type="text"
                            name="name"
                            value={newPatient.name}
                            onChange={handleChange}
                            placeholder="이름"
                            className="border p-3 rounded-md w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="date"
                            name="birth_date"
                            value={newPatient.birth_date}
                            onChange={handleChange}
                            className="border p-3 rounded-md w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="email"
                            name="email"
                            value={newPatient.email}
                            onChange={handleChange}
                            placeholder="이메일"
                            className="border p-3 rounded-md w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={newPatient.phone}
                            onChange={handleChange}
                            placeholder="전화번호"
                            className="border p-3 rounded-md w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <button
                        onClick={addPatient}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md w-full mb-4 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? '추가 중...' : '상담 대상자 추가'}
                    </button>
                </>
            )}

            {/* 상담 대상자 목록 */}
            <ul className="space-y-4">
                {patients.map((patient) => (
                    <li
                        key={patient.id}
                        className="cursor-pointer text-blue-600 hover:underline text-lg"
                        onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                    >
                        {patient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
