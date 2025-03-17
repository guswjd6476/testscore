'use client'; // Add this line to mark the file as a client component

import React, { useState } from 'react';
import { emotions } from '@/app/lib/question';

type Answer = {
    [key: string]: string[];
};

const CoreEmotionTest = () => {
    const [answers, setAnswers] = useState<Answer>({});

    const handleCheckboxChange = (emotion: string, option: string) => {
        setAnswers((prev) => {
            const updatedAnswers = { ...prev };
            if (!updatedAnswers[emotion]) {
                updatedAnswers[emotion] = [];
            }
            if (updatedAnswers[emotion].includes(option)) {
                updatedAnswers[emotion] = updatedAnswers[emotion].filter((item) => item !== option);
            } else {
                updatedAnswers[emotion].push(option);
            }
            return updatedAnswers;
        });
    };

    const handleSubmit = () => {
        console.log('Submitted Answers:', answers);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">핵심 감정 검사</h1>
            {emotions.map((emotion) => (
                <div key={emotion.id} className="mb-4 border-b pb-2">
                    <h2 className="text-lg font-semibold">{emotion.id}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['대인관계', '가족관계', '일과공부', '나의감정'].map((category) => (
                            <label key={category} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    onChange={() => handleCheckboxChange(emotion.id.toString(), category)}
                                />
                                <span>{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={handleSubmit} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md">
                제출하기
            </button>
        </div>
    );
};

export default CoreEmotionTest;
