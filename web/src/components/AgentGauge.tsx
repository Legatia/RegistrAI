import React from 'react';

interface AgentGaugeProps {
    score: number; // 0-1000
    size?: number;
}

export const AgentGauge: React.FC<AgentGaugeProps> = ({ score, size = 120 }) => {
    const radius = 45;
    const stroke = 8;
    const normalizedScore = Math.min(Math.max(score, 0), 1000);
    const percentage = normalizedScore / 1000;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - percentage * circumference;

    let color = 'text-red-500';
    if (normalizedScore > 500) color = 'text-yellow-500';
    if (normalizedScore > 800) color = 'text-emerald-500';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                className="transform -rotate-90 w-full h-full"
                viewBox="0 0 100 100"
            >
                <circle
                    className="text-white/10"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold font-mono tracking-tighter ${color}`}>
                    {normalizedScore}
                </span>
            </div>
        </div>
    );
};
