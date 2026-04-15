import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { cn } from "@/lib/utils";

// Professional color palette
const COLORS = {
  primary: '#3b82f6',   // blue
  success: '#10b981',   // emerald
  warning: '#f59e0b',   // amber
  danger: '#ef4444',    // red
  purple: '#8b5cf6',    // purple
  gray: '#94a3b8',      // slate
  lightGray: '#e2e8f0'  // slate-200
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

/**
 * Custom Tooltip Component
 * Clean, professional tooltip with consistent styling
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 min-w-[140px]">
      {label && <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}</span>
          </div>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * AnalyticsChart Component
 * Professional Recharts-based charts for analytics data
 * Supports line, bar, area, pie, donut, and radar charts
 */
const AnalyticsChart = ({
  type = "line",
  data = [],
  dataKey = "value",
  xAxisKey = "name",
  title,
  subtitle,
  colors = CHART_COLORS,
  showLegend = true,
  showGrid = true,
  height = 300,
  className,
  stacked = false,
  curve = "monotone",
  animationDuration = 750
}) => {
  const gridProps = showGrid ? {
    strokeDasharray: "3 3",
    stroke: "#f1f5f9",
    vertical: false
  } : { stroke: "none" };

  const xAxisProps = {
    dataKey: xAxisKey,
    stroke: COLORS.gray,
    tick: { fill: '#64748b', fontSize: 12 },
    axisLine: { stroke: COLORS.lightGray }
  };

  const yAxisProps = {
    stroke: COLORS.gray,
    tick: { fill: '#64748b', fontSize: 12 },
    axisLine: { stroke: COLORS.lightGray }
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Line
                  key={key}
                  type={curve}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={animationDuration}
                />
              ))
            ) : (
              <Line
                type={curve}
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={animationDuration}
              />
            )}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                  stackId={stacked ? "stack" : undefined}
                  animationDuration={animationDuration}
                />
              ))
            ) : (
              <Bar
                dataKey={dataKey}
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? "stack" : undefined}
                animationDuration={animationDuration}
              />
            )}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Area
                  key={key}
                  type={curve}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fillOpacity={1}
                  fill={`url(#color${index})`}
                  strokeWidth={2}
                  animationDuration={animationDuration}
                />
              ))
            ) : (
              <Area
                type={curve}
                dataKey={dataKey}
                stroke={colors[0]}
                fillOpacity={1}
                fill="url(#color0)"
                strokeWidth={2}
                animationDuration={animationDuration}
              />
            )}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart width={height} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.2}
              outerRadius={height * 0.4}
              paddingAngle={4}
              dataKey={dataKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              animationDuration={animationDuration}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      case "donut":
        return (
          <PieChart width={height} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.32}
              outerRadius={height * 0.42}
              paddingAngle={3}
              dataKey={dataKey}
              label={false}
              animationDuration={animationDuration}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey={xAxisKey}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "dataMax"]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  animationDuration={animationDuration}
                />
              ))
            ) : (
              <Radar
                name={dataKey}
                dataKey={dataKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ r: 3 }}
                animationDuration={animationDuration}
              />
            )}
          </RadarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Pre-configured chart variants
 */

export const ViewsOverTimeChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="area"
    data={data}
    dataKey={["views", "completions"]}
    xAxisKey="date"
    title="Views Over Time"
    subtitle="Daily views and completions"
    colors={[COLORS.primary, COLORS.success]}
    height={height}
  />
);

export const CompletionRateChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="bar"
    data={data}
    dataKey="completionRate"
    xAxisKey="name"
    title="Completion Rates"
    subtitle="Percentage of students who completed each video"
    colors={[COLORS.primary]}
    height={height}
  />
);

export const StudentDemographicsChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="donut"
    data={data}
    dataKey="value"
    title="Student Engagement"
    subtitle="Distribution by engagement level"
    colors={[COLORS.success, COLORS.primary, COLORS.warning, COLORS.gray]}
    height={height}
  />
);

export const EngagementRadarChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="radar"
    data={data}
    dataKey={["course", "average"]}
    xAxisKey="skill"
    title="Skills Distribution"
    subtitle="Student performance across different skills"
    colors={[COLORS.primary, COLORS.success]}
    height={height}
  />
);

export const WeeklyActivityChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="bar"
    data={data}
    dataKey={["hours", "students"]}
    xAxisKey="day"
    title="Weekly Activity Pattern"
    subtitle="Watch hours and active students by day"
    colors={[COLORS.primary, COLORS.success]}
    height={height}
  />
);

export const RevenueTrendChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="area"
    data={data}
    dataKey="revenue"
    xAxisKey="month"
    title="Revenue Trend"
    subtitle="Monthly revenue over time"
    colors={[COLORS.success]}
    height={height}
  />
);

export const QuizPerformanceChart = ({ data, height = 280 }) => (
  <AnalyticsChart
    type="bar"
    data={data}
    dataKey={["avgScore", "passRate"]}
    xAxisKey="name"
    title="Quiz Performance"
    subtitle="Average scores and pass rates"
    colors={[COLORS.primary, COLORS.success]}
    height={height}
    stacked={false}
  />
);

export default AnalyticsChart;
