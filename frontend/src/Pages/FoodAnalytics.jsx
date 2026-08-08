import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  LineController,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Select from '../components/ui/Select.jsx';
import { useDonations } from '../hooks/useDonations';
import { useInventory } from '../hooks/useInventory';
import { formatDate } from '../utils/dateUtils';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  LineController,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  Title
);

const DATE_RANGES = [
  { value: 'all', label: 'All time', short: '6mo' },
  { value: 'monthly', label: 'Last 30 days', short: '30d' },
  { value: 'weekly', label: 'Last 7 days', short: '7d' },
];

const SERIES_LINE = 'rgba(37, 99, 235, 1)';
const SERIES_BAR = 'rgba(37, 99, 235, 0.65)';
const USED_COLOR = 'rgba(37, 99, 235, 0.8)';
const DONATED_COLOR = 'rgba(16, 185, 129, 0.8)';
const PALETTE = [
  { solid: '#2563EB', soft: 'rgba(37, 99, 235, 0.12)' },
  { solid: '#10B981', soft: 'rgba(16, 185, 129, 0.12)' },
  { solid: '#F59E0B', soft: 'rgba(245, 158, 11, 0.12)' },
  { solid: '#8B5CF6', soft: 'rgba(139, 92, 246, 0.12)' },
  { solid: '#EC4899', soft: 'rgba(236, 72, 153, 0.12)' },
  { solid: '#14B8A6', soft: 'rgba(20, 184, 166, 0.12)' },
  { solid: '#F97316', soft: 'rgba(249, 115, 22, 0.12)' },
  { solid: '#6366F1', soft: 'rgba(99, 102, 241, 0.12)' },
];

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function addDays(date, delta) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + delta);
  return copy;
}

function buildDateKeys(range) {
  const today = new Date();
  if (range === 'weekly') {
    return Array.from({ length: 7 }, (_, index) =>
      toIsoDate(addDays(today, index - 6))
    );
  }

  if (range === 'monthly') {
    return Array.from({ length: 30 }, (_, index) =>
      toIsoDate(addDays(today, index - 29))
    );
  }

  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(start);
    monthDate.setMonth(start.getMonth() + index);
    return `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  });
}

function formatDateKey(label, range) {
  if (range === 'all') {
    const [year, month] = label.split('-');
    return new Date(year, Number(month) - 1).toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });
  }

  if (!label) return '';
  return formatDate(label);
}

function groupByDate(events, range) {
  const dateKeys = buildDateKeys(range);

  if (range === 'all') {
    const monthCounts = {};
    events.forEach((event) => {
      const key = event.date ? event.date.slice(0, 7) : null;
      if (!key) return;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });
    return dateKeys.map((key) => monthCounts[key] || 0);
  }

  const eventCounts = events.reduce((acc, event) => {
    if (!event.date) return acc;
    acc[event.date] = (acc[event.date] || 0) + 1;
    return acc;
  }, {});

  return dateKeys.map((key) => eventCounts[key] || 0);
}

function getEventDate(item) {
  return (
    toIsoDate(item.updatedAt) ||
    toIsoDate(item.createdAt) ||
    toIsoDate(item.statusUpdatedAt) ||
    toIsoDate(item.expiryDate)
  );
}

function StatCard({ icon, label, value, sublabel, accent }) {
  return (
    <div className="group rounded-2xl bg-white border border-outline-variant px-lg py-md transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-sm mb-sm">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: accent ? `${accent}1A` : undefined }}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color: accent || undefined }}
          >
            {icon}
          </span>
        </span>
        <p className="font-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
          {label}
        </p>
      </div>
      <p className="font-headline-lg text-headline-lg text-primary">{value}</p>
      {sublabel ? (
        <p className="font-body-sm text-on-surface-variant mt-xs">{sublabel}</p>
      ) : null}
    </div>
  );
}

function NoFilteredData() {
  return (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-sm text-on-surface-variant">
      <span className="material-symbols-outlined text-[28px] opacity-60">
        filter_alt_off
      </span>
      <p className="font-body-sm max-w-[220px]">
        Nothing matches this filter yet. Try a wider date range or another category.
      </p>
    </div>
  );
}

// Small pill of icon buttons for switching view/graph type without eating layout space.
function IconToggle({ options, value, onChange, ariaLabel }) {
  return (
    <div
      className="inline-flex rounded-full bg-surface-container-low border border-outline-variant p-xs"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`inline-flex items-center justify-center h-7 w-7 rounded-full transition-colors ${
            value === opt.value
              ? 'bg-primary text-white'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
        </button>
      ))}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="max-h-[280px] overflow-y-auto rounded-xl border border-outline-variant">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-surface-container-low">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`font-label-sm uppercase tracking-[0.1em] text-on-surface-variant px-md py-sm ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.key ?? rowIndex}
              className={rowIndex % 2 === 1 ? 'bg-surface-container-low/40' : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`font-body-sm text-on-surface px-md py-sm border-t border-outline-variant/60 ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FoodAnalytics() {
  const { items } = useInventory();
  const { myDonations, claimedDonations } = useDonations();
  const [dateRange, setDateRange] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // View + graph-type controls
  const [trendView, setTrendView] = useState('chart'); // 'chart' | 'table'
  const [trendChartType, setTrendChartType] = useState('line'); // 'line' | 'bar'
  const [categoryView, setCategoryView] = useState('chart'); // 'chart' | 'table'
  const [categoryChartType, setCategoryChartType] = useState('doughnut'); // 'doughnut' | 'bar'

  const timeChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const timeChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);

  function createOrUpdateChart(chartRef, canvas, config) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      const existingCanvas = chartRef.current.canvas;
      const isDetached = !existingCanvas?.ownerDocument || !existingCanvas.isConnected;
      const typeChanged = chartRef.current.config.type !== config.type;
      if (isDetached || typeChanged) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    }

    if (chartRef.current) {
      chartRef.current.data = config.data;
      chartRef.current.options = config.options;
      chartRef.current.update();
    } else {
      chartRef.current = new Chart(ctx, config);
    }
  }

  const usedItems = useMemo(
    () => items.filter((item) => item.status === 'Used'),
    [items]
  );

  const donationItems = useMemo(() => myDonations || [], [myDonations]);

  const savedEvents = useMemo(() => {
    const used = usedItems.map((item) => ({
      type: 'used',
      category:
        typeof item.category === 'object'
          ? item.category?.name
          : item.category || 'Uncategorized',
      date: getEventDate(item),
    }));

    const donated = donationItems.map((item) => ({
      type: 'donated',
      category:
        typeof item.category === 'object'
          ? item.category?.name
          : item.category || item.food?.category?.name || 'Uncategorized',
      date: getEventDate(item),
    }));

    return [...used, ...donated];
  }, [usedItems, donationItems]);

  const categories = useMemo(() => {
    const categorySet = new Set(
      savedEvents.map((event) => event.category || 'Uncategorized')
    );
    return ['all', ...Array.from(categorySet).filter(Boolean)];
  }, [savedEvents]);

  const filteredEvents = useMemo(() => {
    return savedEvents.filter((event) => {
      if (categoryFilter !== 'all' && event.category !== categoryFilter) {
        return false;
      }

      if (dateRange === 'weekly') {
        const cutoff = addDays(new Date(), -6);
        return event.date && new Date(event.date) >= cutoff;
      }

      if (dateRange === 'monthly') {
        const cutoff = addDays(new Date(), -29);
        return event.date && new Date(event.date) >= cutoff;
      }

      return true;
    });
  }, [savedEvents, categoryFilter, dateRange]);

  const categoriesSummary = useMemo(() => {
    const summary = {};
    filteredEvents.forEach((event) => {
      summary[event.category] = summary[event.category] || {
        used: 0,
        donated: 0,
        total: 0,
      };
      summary[event.category][event.type] += 1;
      summary[event.category].total += 1;
    });
    return summary;
  }, [filteredEvents]);

  const categoryLabels = useMemo(
    () =>
      Object.keys(categoriesSummary).sort(
        (a, b) => categoriesSummary[b].total - categoriesSummary[a].total
      ),
    [categoriesSummary]
  );

  const categoryTotals = useMemo(
    () => categoryLabels.map((label) => categoriesSummary[label]?.total || 0),
    [categoryLabels, categoriesSummary]
  );

  const usedByCategory = useMemo(
    () => categoryLabels.map((label) => categoriesSummary[label]?.used || 0),
    [categoryLabels, categoriesSummary]
  );

  const donatedByCategory = useMemo(
    () => categoryLabels.map((label) => categoriesSummary[label]?.donated || 0),
    [categoryLabels, categoriesSummary]
  );

  const maxCategoryTotal = Math.max(1, ...categoryTotals);
  const grandTotal = categoryTotals.reduce((a, b) => a + b, 0);

  const timeSeriesLabels = useMemo(() => buildDateKeys(dateRange), [dateRange]);

  const timeSeriesCounts = useMemo(
    () => groupByDate(filteredEvents, dateRange),
    [filteredEvents, dateRange]
  );

  // Compare the second half of the selected period against the first half.
  const trend = useMemo(() => {
    if (timeSeriesCounts.length < 2) return null;
    const mid = Math.floor(timeSeriesCounts.length / 2);
    const firstHalf = timeSeriesCounts.slice(0, mid).reduce((a, b) => a + b, 0);
    const secondHalf = timeSeriesCounts.slice(mid).reduce((a, b) => a + b, 0);
    if (firstHalf === 0 && secondHalf === 0) return { pct: 0, direction: 'flat' };
    if (firstHalf === 0) return { pct: 100, direction: 'up' };
    const pct = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    return { pct: Math.abs(pct), direction: pct === 0 ? 'flat' : pct > 0 ? 'up' : 'down' };
  }, [timeSeriesCounts]);

  const topCategory = categoryLabels[0] || null;

  // Trend chart (line or bar)
  useEffect(() => {
    const canvas = timeChartRef.current;

    if (trendView !== 'chart' || filteredEvents.length === 0) {
      timeChartInstance.current?.destroy();
      timeChartInstance.current = null;
      return;
    }
    if (!canvas || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let backgroundColor = SERIES_BAR;
    if (trendChartType === 'line') {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 280);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.32)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
      backgroundColor = gradient;
    }

    const config = {
      type: trendChartType,
      data: {
        labels: timeSeriesLabels.map((label) => formatDateKey(label, dateRange)),
        datasets: [
          {
            label: 'Items saved',
            data: timeSeriesCounts,
            borderColor: SERIES_LINE,
            backgroundColor,
            fill: trendChartType === 'line',
            tension: 0.35,
            pointRadius: trendChartType === 'line' ? 0 : undefined,
            pointHoverRadius: trendChartType === 'line' ? 5 : undefined,
            pointHoverBackgroundColor: SERIES_LINE,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            borderWidth: trendChartType === 'line' ? 2.5 : 0,
            borderRadius: trendChartType === 'bar' ? 6 : undefined,
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: dateRange === 'monthly' ? 8 : undefined,
              font: { size: 11 },
              color: '#8A93A6',
            },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 11 }, color: '#8A93A6' },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
        },
      },
    };

    createOrUpdateChart(timeChartInstance, canvas, config);
  }, [
    timeSeriesLabels,
    timeSeriesCounts,
    dateRange,
    filteredEvents.length,
    trendView,
    trendChartType,
  ]);

  // Category chart (doughnut or grouped bar)
  useEffect(() => {
    const canvas = categoryChartRef.current;

    if (categoryView !== 'chart' || filteredEvents.length === 0) {
      categoryChartInstance.current?.destroy();
      categoryChartInstance.current = null;
      return;
    }
    if (!canvas || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let config;

    if (categoryChartType === 'doughnut') {
      const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return;
          const x = (chartArea.left + chartArea.right) / 2;
          const y = (chartArea.top + chartArea.bottom) / 2;
          c.save();
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillStyle = '#111827';
          c.font = '600 22px system-ui, sans-serif';
          c.fillText(String(grandTotal), x, y - 8);
          c.fillStyle = '#8A93A6';
          c.font = '500 11px system-ui, sans-serif';
          c.fillText('items', x, y + 14);
          c.restore();
        },
      };

      config = {
        type: 'doughnut',
        data: {
          labels: categoryLabels,
          datasets: [
            {
              data: categoryTotals,
              backgroundColor: categoryLabels.map(
                (_, index) => PALETTE[index % PALETTE.length].solid
              ),
              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1F2937',
              padding: 10,
              cornerRadius: 8,
              displayColors: false,
            },
          },
        },
        plugins: [centerTextPlugin],
      };
    } else {
      config = {
        type: 'bar',
        data: {
          labels: categoryLabels,
          datasets: [
            {
              label: 'Used',
              data: usedByCategory,
              backgroundColor: USED_COLOR,
              borderRadius: 4,
              maxBarThickness: 22,
            },
            {
              label: 'Donated',
              data: donatedByCategory,
              backgroundColor: DONATED_COLOR,
              borderRadius: 4,
              maxBarThickness: 22,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { size: 11 } },
            },
            tooltip: {
              backgroundColor: '#1F2937',
              padding: 10,
              cornerRadius: 8,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#8A93A6' },
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0, font: { size: 11 }, color: '#8A93A6' },
              grid: { color: 'rgba(0,0,0,0.05)' },
            },
          },
        },
      };
    }

    createOrUpdateChart(categoryChartInstance, canvas, config);
  }, [
    categoryLabels,
    categoryTotals,
    usedByCategory,
    donatedByCategory,
    grandTotal,
    filteredEvents.length,
    categoryView,
    categoryChartType,
  ]);

  useEffect(() => {
    return () => {
      timeChartInstance.current?.destroy();
      categoryChartInstance.current?.destroy();
    };
  }, []);

  const totalSaved = usedItems.length + donationItems.length;
  const totalDonations = donationItems.length;
  const totalUsed = usedItems.length;
  const totalClaims = claimedDonations.length;
  const donationRate = totalSaved === 0 ? 0 : Math.round((totalDonations / totalSaved) * 100);
  const claimRate = totalDonations === 0 ? 0 : Math.round((totalClaims / totalDonations) * 100);

  const insightSentence = useMemo(() => {
    const parts = [];
    if (trend && trend.direction !== 'flat') {
      parts.push(
        `you're saving ${trend.pct}% ${trend.direction === 'up' ? 'more' : 'less'} than earlier this period`
      );
    }
    if (topCategory) {
      parts.push(`${topCategory.toLowerCase()} leads your savings`);
    }
    if (parts.length === 0) return 'Keep logging activity to unlock trends and insights.';
    return `Right now, ${parts.join(', and ')}.`;
  }, [trend, topCategory]);

  // Table data
  const trendTableRows = useMemo(
    () =>
      timeSeriesLabels.map((label, index) => ({
        key: label ?? index,
        date: formatDateKey(label, dateRange),
        count: timeSeriesCounts[index] ?? 0,
      })),
    [timeSeriesLabels, timeSeriesCounts, dateRange]
  );

  const categoryTableRows = useMemo(
    () =>
      categoryLabels.map((label) => {
        const summary = categoriesSummary[label];
        const share = grandTotal === 0 ? 0 : Math.round((summary.total / grandTotal) * 100);
        return {
          key: label,
          category: label,
          used: summary.used,
          donated: summary.donated,
          total: summary.total,
          share: `${share}%`,
        };
      }),
    [categoryLabels, categoriesSummary, grandTotal]
  );

  if (totalSaved === 0) {
    return (
      <AppLayout title="Food Analytics">
        <EmptyState
          icon="query_stats"
          title="No impact data yet"
          message="Mark food as used or donate items to start tracking your food-saving progress. Your activity will appear here in charts and summaries."
          action={
            <Link to="/inventory">
              <Button icon="inventory_2">Add food to your pantry</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Food Analytics">
      <section className="space-y-lg">
        {/* Hero: gradient insight header */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary to-emerald-700 p-lg shadow-sm">
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="font-label-md uppercase tracking-[0.24em] text-white/70 mb-sm">
              Impact summary
            </p>
            <h1 className="font-headline-xl text-headline-xl text-white max-w-2xl">
              Your food-saving progress
            </h1>
            <p className="font-body-md text-white/85 mt-sm max-w-xl">
              {insightSentence}
            </p>
          </div>
        </div>

        {/* Top-line stats — each number appears exactly once on the page */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm">
          <StatCard icon="inventory_2" label="Total saved" value={totalSaved} accent="#2563EB" />
          <StatCard icon="volunteer_activism" label="Donated" value={totalDonations} accent="#10B981" />
          <StatCard icon="skillet" label="Used at home" value={totalUsed} accent="#F59E0B" />
          <StatCard
            icon="percent"
            label="Donation rate"
            value={`${donationRate}%`}
            sublabel="of items saved"
            accent="#8B5CF6"
          />
        </div>

        {/* Main analytics */}
        <div className="bg-white border border-outline-variant rounded-[28px] p-lg shadow-sm">
          <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between mb-lg">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">
                Trends &amp; breakdown
              </h2>
              <p className="font-body-sm text-on-surface-variant mt-xs">
                Filter by period and category, and switch between chart and table views.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-sm">
              <div className="inline-flex rounded-full bg-surface-container-low border border-outline-variant p-xs">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setDateRange(range.value)}
                    className={`px-md py-xs rounded-full font-label-sm transition-colors ${
                      dateRange === range.value
                        ? 'bg-primary text-white'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    aria-pressed={dateRange === range.value}
                  >
                    {range.short}
                  </button>
                ))}
              </div>

              <Select
                label="Category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="min-w-[170px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All categories' : category}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-lg xl:grid-cols-[1.3fr_1fr]">
            {/* Trend panel */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-sm mb-sm">
                <div className="flex items-center gap-sm">
                  <p className="font-label-sm uppercase tracking-[0.16em] text-on-surface-variant">
                    Saved over time
                  </p>
                  {trend && trend.direction !== 'flat' && filteredEvents.length > 0 && (
                    <span
                      className={`font-label-sm inline-flex items-center gap-xs rounded-full px-sm py-xs ${
                        trend.direction === 'up'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {trend.direction === 'up' ? 'trending_up' : 'trending_down'}
                      </span>
                      {trend.pct}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-xs">
                  {trendView === 'chart' && (
                    <IconToggle
                      ariaLabel="Trend chart type"
                      value={trendChartType}
                      onChange={setTrendChartType}
                      options={[
                        { value: 'line', label: 'Line chart', icon: 'show_chart' },
                        { value: 'bar', label: 'Bar chart', icon: 'bar_chart' },
                      ]}
                    />
                  )}
                  <IconToggle
                    ariaLabel="Trend view"
                    value={trendView}
                    onChange={setTrendView}
                    options={[
                      { value: 'chart', label: 'Chart view', icon: 'insights' },
                      { value: 'table', label: 'Table view', icon: 'table_rows' },
                    ]}
                  />
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="h-[280px] rounded-2xl bg-surface-container-low/40">
                  <NoFilteredData />
                </div>
              ) : trendView === 'table' ? (
                <DataTable
                  columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'count', label: 'Items saved', align: 'right' },
                  ]}
                  rows={trendTableRows}
                />
              ) : (
                <div className="h-[280px] rounded-2xl bg-surface-container-low/40">
                  <canvas ref={timeChartRef} />
                </div>
              )}
            </div>

            {/* Category panel */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-sm mb-sm">
                <p className="font-label-sm uppercase tracking-[0.16em] text-on-surface-variant">
                  By category
                </p>
                <div className="flex items-center gap-xs">
                  {categoryView === 'chart' && (
                    <IconToggle
                      ariaLabel="Category chart type"
                      value={categoryChartType}
                      onChange={setCategoryChartType}
                      options={[
                        { value: 'doughnut', label: 'Doughnut chart', icon: 'donut_large' },
                        { value: 'bar', label: 'Bar chart', icon: 'bar_chart' },
                      ]}
                    />
                  )}
                  <IconToggle
                    ariaLabel="Category view"
                    value={categoryView}
                    onChange={setCategoryView}
                    options={[
                      { value: 'chart', label: 'Chart view', icon: 'insights' },
                      { value: 'table', label: 'Table view', icon: 'table_rows' },
                    ]}
                  />
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="h-[280px]">
                  <NoFilteredData />
                </div>
              ) : categoryView === 'table' ? (
                <DataTable
                  columns={[
                    { key: 'category', label: 'Category' },
                    { key: 'used', label: 'Used', align: 'right' },
                    { key: 'donated', label: 'Donated', align: 'right' },
                    { key: 'total', label: 'Total', align: 'right' },
                    { key: 'share', label: 'Share', align: 'right' },
                  ]}
                  rows={categoryTableRows}
                />
              ) : categoryChartType === 'bar' ? (
                <div className="h-[280px]">
                  <canvas ref={categoryChartRef} />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row xl:flex-col gap-md">
                  <div className="h-[180px] sm:w-[180px] sm:h-[180px] xl:w-full mx-auto">
                    <canvas ref={categoryChartRef} />
                  </div>
                  {/* Ranked leaderboard — signature element for this page */}
                  <ul className="flex-1 space-y-xs">
                    {categoryLabels.slice(0, 5).map((label, index) => {
                      const total = categoriesSummary[label]?.total || 0;
                      const pct = Math.round((total / maxCategoryTotal) * 100);
                      const color = PALETTE[index % PALETTE.length];
                      return (
                        <li key={label} className="flex items-center gap-sm">
                          <span className="font-label-sm w-4 text-on-surface-variant text-right">
                            {index + 1}
                          </span>
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: color.solid }}
                          />
                          <span className="font-body-sm text-on-surface flex-1 truncate">
                            {label}
                          </span>
                          <div className="hidden sm:block w-16 h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color.solid }}
                            />
                          </div>
                          <span className="font-label-sm text-on-surface-variant w-6 text-right">
                            {total}
                          </span>
                        </li>
                      );
                    })}
                    {categoryLabels.length > 5 && (
                      <li className="font-body-sm text-on-surface-variant pl-6">
                        +{categoryLabels.length - 5} more categories
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Community impact + CTA */}
        <div className="grid gap-lg lg:grid-cols-[1fr_auto]">
          <div className="bg-white border border-outline-variant rounded-[28px] p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-xs">
              Community reach
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-lg max-w-md">
              How your donations turn into meals for others.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
              <StatCard icon="groups" label="Community pickups" value={totalClaims} accent="#14B8A6" />
              <StatCard
                icon="task_alt"
                label="Claim rate"
                value={`${claimRate}%`}
                sublabel="of donations claimed"
                accent="#F97316"
              />
              <StatCard
                icon="emoji_events"
                label="Top category"
                value={topCategory || '—'}
                sublabel={topCategory ? `${categoriesSummary[topCategory].total} items` : null}
                accent="#6366F1"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-emerald-700 p-lg text-center flex flex-col items-center justify-center gap-sm lg:w-[260px]">
            <div
              className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <span className="material-symbols-outlined text-white text-[28px] relative">
              eco
            </span>
            <h3 className="font-headline-md text-headline-md text-white relative">
              Keep saving
            </h3>
            <p className="font-body-sm text-white/80 relative">
              Mark items used or donate more to grow your impact.
            </p>
            <Link to="/inventory" className="relative">
              <Button icon="inventory_2" variant="secondary">
                Go to pantry
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}