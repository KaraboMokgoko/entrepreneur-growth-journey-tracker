import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";

// data: [{ dimension, score, baseline? }] score 0-100
export default function ScoreRadar({ data, height = 320, showBaseline = false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#64748b" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
        {showBaseline && (
          <Radar name="Baseline" dataKey="baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
        )}
        <Radar name="Latest" dataKey="score" stroke="#0f766e" fill="#0f766e" fillOpacity={0.35} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}