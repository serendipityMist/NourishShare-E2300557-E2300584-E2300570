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
  Tooltip,
  Legend,
  Title
);

const DATE_RANGES = [
  { value: 'all', label: 'All time' },
  { value: 'monthly', label: 'Last 30 days' },
  { value: 'weekly', label: 'Last 7 days' },
];

const LABEL_COLORS = {
  used: 'rgba(59, 130, 246, 0.8)',
  donated: 'rgba(16, 185, 129, 0.8)',
};

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
  const counts = dateKeys.map(() => 0);

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

export default function FoodAnalytics() {
  const { items } = useInventory();
  const { myDonations, claimedDonations } = useDonations();
  const [dateRange, setDateRange] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      if (isDetached) {
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

  const donationItems = useMemo(
    () => myDonations || [],
    [myDonations]
  );

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
          : item.category ||
            item.food?.category?.name ||
            'Uncategorized',
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
    () => Object.keys(categoriesSummary),
    [categoriesSummary]
  );

  const usedByCategory = useMemo(
    () => categoryLabels.map((label) => categoriesSummary[label]?.used || 0),
    [categoryLabels, categoriesSummary]
  );

  const donatedByCategory = useMemo(
    () => categoryLabels.map((label) => categoriesSummary[label]?.donated || 0),
    [categoryLabels, categoriesSummary]
  );

  const timeSeriesLabels = useMemo(
    () => buildDateKeys(dateRange),
    [dateRange]
  );

  const timeSeriesCounts = useMemo(
    () => groupByDate(filteredEvents, dateRange),
    [filteredEvents, dateRange]
  );

  useEffect(() => {
    const canvas = timeChartRef.current;
    if (!canvas || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = {
      type: 'line',
      data: {
        labels: timeSeriesLabels.map((label) => formatDateKey(label, dateRange)),
        datasets: [
          {
            label: 'Saved items',
            data: timeSeriesCounts,
            borderColor: LABEL_COLORS.used,
            backgroundColor: 'rgba(59, 130, 246, 0.24)',
            fill: true,
            tension: 0.25,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Food saved over time' },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    };

    createOrUpdateChart(timeChartInstance, canvas, config);
  }, [timeSeriesLabels, timeSeriesCounts, dateRange]);

  useEffect(() => {
    const canvas = categoryChartRef.current;
    if (!canvas || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = {
      type: 'bar',
      data: {
        labels: categoryLabels,
        datasets: [
          {
            label: 'Used',
            data: usedByCategory,
            backgroundColor: LABEL_COLORS.used,
          },
          {
            label: 'Donated',
            data: donatedByCategory,
            backgroundColor: LABEL_COLORS.donated,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Saved items by category' },
        },
        scales: {
          x: {
            stacked: false,
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    };

    createOrUpdateChart(categoryChartInstance, canvas, config);
  }, [categoryLabels, usedByCategory, donatedByCategory]);

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
      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-lg mb-xl">
        <div className="space-y-lg">
          <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-label-md uppercase tracking-[0.24em] text-on-surface-variant">
                  Impact summary
                </p>
                <h1 className="font-headline-xl text-headline-xl text-primary mt-sm">
                  Your food-saving progress
                </h1>
                <p className="font-body-md text-on-surface-variant mt-xs max-w-2xl">
                  Visualize the value of your household food use and donation activity.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 w-full max-w-md">
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.16em]">
                    Total saved
                  </p>
                  <p className="font-headline-md text-headline-md text-primary mt-xs">
                    {totalSaved}
                  </p>
                </div>
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.16em]">
                    Donations
                  </p>
                  <p className="font-headline-md text-headline-md text-primary mt-xs">
                    {totalDonations}
                  </p>
                </div>
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.16em]">
                    Used items
                  </p>
                  <p className="font-headline-md text-headline-md text-primary mt-xs">
                    {totalUsed}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex flex-col gap-sm sm:flex-row sm:items-end sm:justify-between mb-lg">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">
                  Track and filter your impact
                </h2>
                <p className="font-body-md text-on-surface-variant mt-xs">
                  Use the date and category controls to refine your report.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 w-full max-w-xl">
                <Select
                  label="Date range"
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                >
                  {DATE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All categories' : category}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-lg">
              <div className="bg-surface-container-low p-md rounded-xl">
                <div className="h-72">
                  <canvas ref={timeChartRef} />
                </div>
              </div>
              <div className="bg-surface-container-low p-md rounded-xl">
                <div className="h-72">
                  <canvas ref={categoryChartRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-lg">
          <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-sm">Community Reach</h3>
            <p className="font-body-md text-on-surface-variant mb-md">
              Your donations are part of the broader community impact. This summarizes your contributions and how many have been claimed.
            </p>
            <div className="space-y-sm">
              <div className="rounded-xl bg-surface-container-low p-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.16em]">
                  Community pickups
                </p>
                <p className="font-headline-lg text-headline-lg text-primary mt-xs">
                  {totalClaims}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.16em]">
                  Recent data
                </p>
                <p className="font-body-md text-on-surface-variant mt-xs">
                  Viewing {dateRange === 'all' ? 'all activity' : DATE_RANGES.find((r) => r.value === dateRange)?.label.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg text-center">
            <h3 className="font-headline-md text-headline-md text-primary mb-sm">Keep saving</h3>
            <p className="font-body-md text-on-surface-variant mb-md">
              Mark items as used or donate more food to grow your sustainability score and make your next report even more powerful.
            </p>
            <Link to="/inventory">
              <Button icon="inventory_2">Go to pantry</Button>
            </Link>
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}
