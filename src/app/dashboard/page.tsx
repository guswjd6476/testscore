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
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPatient((prev) => ({ ...prev, [name]: value }));
    };

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
            setPatients((prev) => [...prev, ...data]);
            setNewPatient({ name: '', birth_date: '', email: '', phone: '' });
            setShowForm(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">상담 대상자 목록</h2>

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-200 w-full mb-6"
                >
                    상담 대상자 추가
                </button>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <input
                            type="text"
                            name="name"
                            value={newPatient.name}
                            onChange={handleChange}
                            placeholder="이름"
                            className="border p-3 rounded-md text-lg focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="date"
                            name="birth_date"
                            value={newPatient.birth_date}
                            onChange={handleChange}
                            className="border p-3 rounded-md text-lg focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="email"
                            name="email"
                            value={newPatient.email}
                            onChange={handleChange}
                            placeholder="이메일"
                            className="border p-3 rounded-md text-lg focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={newPatient.phone}
                            onChange={handleChange}
                            placeholder="전화번호"
                            className="border p-3 rounded-md text-lg focus:ring-2 focus:ring-blue-400"
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

            {/* 상담 대상자 목록 테이블 */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr className="text-left text-gray-600">
                            <th className="py-3 px-4">이름</th>
                            <th className="py-3 px-4 hidden md:table-cell">생년월일</th>
                            <th className="py-3 px-4 hidden md:table-cell">이메일</th>
                            <th className="py-3 px-4 hidden md:table-cell">전화번호</th>
                            <th className="py-3 px-4">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                className="border-t hover:bg-gray-50 cursor-pointer"
                                onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                            >
                                <td className="py-3 px-4">{patient.name}</td>
                                <td className="py-3 px-4 hidden md:table-cell">{patient.birth_date}</td>
                                <td className="py-3 px-4 hidden md:table-cell">{patient.email}</td>
                                <td className="py-3 px-4 hidden md:table-cell">{patient.phone}</td>
                                <td className="py-3 px-4">
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                                        상세 보기
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
