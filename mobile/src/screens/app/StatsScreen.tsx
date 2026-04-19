import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { colors } from '../../constants/colors';
import { transactionApi, CategoryStats } from '../../api/transactionApi';

// ─── Types ────────────────────────────────────────────────────────────────────
type PeriodTab = 'WEEK' | 'MONTH' | 'YEAR';
type TransactionType = 'EXPENSE' | 'INCOME';
type ChartPage = 0 | 1 | 2; // 0 = donut, 1 = line, 2 = bar

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Colour helpers ───────────────────────────────────────────────────────────
const CHART_COLORS = [
  '#F59E0B', '#10B981', '#3B82F6', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

const fmt = (n: number) => n.toLocaleString('vi-VN');

import Svg, { Circle, G } from 'react-native-svg';

interface DonutSlice { pct: number; color: string }

function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const R = 68;
  const cx = 90;
  const cy = 90;
  const stroke = 22;
  const circumference = 2 * Math.PI * R;
  let offset = -circumference * 0.25; // start at top

  return (
    <View style={{ width: 180, height: 180 }}>
      <Svg width={180} height={180}>
        {slices.map((s, i) => {
          const dash = (s.pct / 100) * circumference;
          const gap = circumference - dash;
          const el = (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={R}
              fill="transparent"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
            />
          );
          offset -= dash;
          return el;
        })}
      </Svg>
      <View style={styles.donutCenter} pointerEvents="none">
        <Text style={styles.donutAmount}>{fmt(total)}</Text>
      </View>
    </View>
  );
}

// ─── Mini bar chart (pure RN) ─────────────────────────────────────────────────
function BarChart({ data, colors: barColors }: { data: number[][]; colors: string[] }) {
  const maxVal = Math.max(...data.flat(), 1);
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  return (
    <View style={styles.barWrap}>
      {days.map((d, di) => (
        <View key={di} style={styles.barGroup}>
          {data.map((ds, ci) => (
            <View
              key={ci}
              style={[
                styles.barFill,
                {
                  height: Math.max(4, (ds[di] / maxVal) * 100),
                  backgroundColor: barColors[ci] ?? '#ccc',
                },
              ]}
            />
          ))}
          <Text style={styles.barLabel}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

import { Polyline } from 'react-native-svg';

function LineChart({
  datasets,
  labels,
}: {
  datasets: { data: number[]; color: string }[];
  labels: string[];
}) {
  const W = SCREEN_W - 32;
  const H = 140;
  const allVals = datasets.flatMap(d => d.data);
  const maxV = Math.max(...allVals, 1);
  const pts = (data: number[]) =>
    data
      .map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / maxV) * (H - 10)}`)
      .join(' ');

  return (
    <Svg width={W} height={H + 10}>
      {datasets.map((ds, i) => (
        <Polyline
          key={i}
          points={pts(ds.data)}
          fill="none"
          stroke={ds.color}
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
}

export default function StatsScreen({ navigation }: any) {
  const [periodTab, setPeriodTab] = useState<PeriodTab>('MONTH');
  const [transType, setTransType] = useState<TransactionType>('EXPENSE');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [chartPage, setChartPage] = useState<ChartPage>(0);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // swipe support
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) setChartPage(p => Math.min(2, p + 1) as ChartPage);
        else if (g.dx > 40) setChartPage(p => Math.max(0, p - 1) as ChartPage);
      },
    }),
  ).current;

  // months for horizontal scroll
  const monthItems = Array.from({ length: 6 }, (_, i) =>
    dayjs().subtract(5 - i, 'month'),
  );

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getStats(
        selectedDate.year(),
        selectedDate.month() + 1,
        transType,
      );
      setStats(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, transType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── derived data ────────────────────────────────────────────────────────────
  const total = stats.reduce((s, c) => s + c.totalAmount, 0);
  const slices: DonutSlice[] = stats.map((c, i) => ({
    pct: total ? (c.totalAmount / total) * 100 : 0,
    color: c.categoryColor || CHART_COLORS[i % CHART_COLORS.length],
  }));

  // mock daily data for line / bar charts
  const daysInMonth = selectedDate.daysInMonth();
  const lineDatasets = stats.map((c, i) => ({
    color: c.categoryColor || CHART_COLORS[i % CHART_COLORS.length],
    data: Array.from({ length: daysInMonth }, (_, d) =>
      d === 12 ? c.totalAmount : d === 13 ? Math.round(c.totalAmount * 0.3) : 0,
    ),
  }));
  const barDatasets = stats.map(c =>
    Array.from({ length: 7 }, () =>
      Math.round(Math.random() * (c.totalAmount / 4)),
    ),
  );

  // ── render chart area ────────────────────────────────────────────────────────
  const renderChartArea = () => {
    if (loading) {
      return (
        <ActivityIndicator
          style={{ marginVertical: 40 }}
          color={colors.primary}
        />
      );
    }
    if (stats.length === 0) {
      return (
        <Text style={styles.emptyText}>Không có dữ liệu</Text>
      );
    }

    if (chartPage === 0) {
      return (
        <View style={styles.donutWrap}>
          <DonutChart slices={slices} total={total} />
          <View style={styles.legend}>
            {stats.map((c, i) => (
              <View key={c.categoryId} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        (c.categoryColor || CHART_COLORS[i % CHART_COLORS.length]) + '33',
                      borderColor:
                        c.categoryColor || CHART_COLORS[i % CHART_COLORS.length],
                    },
                  ]}
                />
                <Text style={styles.legendName} numberOfLines={1}>
                  {c.categoryName}
                </Text>
                <Text style={styles.legendPct}>
                  {total ? Math.round((c.totalAmount / total) * 100) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (chartPage === 1) {
      const avg = total / daysInMonth;
      return (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.summaryText}>
            Tổng cộng:{' '}
            <Text style={styles.summaryBold}>{fmt(total)}</Text>
            {'   '}Trung bình:{' '}
            <Text style={styles.summaryBold}>
              {fmt(Math.round(avg))}
            </Text>
          </Text>
          <View style={styles.lineWrap}>
            <LineChart
              datasets={lineDatasets}
              labels={Array.from({ length: daysInMonth }, (_, i) =>
                String(i + 1),
              )}
            />
            <View style={styles.lineXAxis}>
              <Text style={styles.axisLabel}>
                1 {selectedDate.format('[thg] M')} 
              </Text>
              <Text style={styles.axisLabel}>15</Text>
              <Text style={styles.axisLabel}>
               {daysInMonth} {selectedDate.format('[thg] M')} 
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // page 2 – bar
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.summaryText}>
          So sánh <Text style={styles.summaryBold}>7 ngày qua</Text>
        </Text>
        <BarChart
          data={barDatasets}
          colors={stats.map(
            (c, i) => c.categoryColor || CHART_COLORS[i % CHART_COLORS.length],
          )}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ width: 36 }} />
          <TouchableOpacity
            style={styles.typeToggle}
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={styles.typeLabel}>
              {transType === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#222"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.calBtn}
            // onPress={() => navigation?.navigate?.('Calendar')}
          >
            <MaterialCommunityIcons
              name="calendar-outline"
              size={24}
              color="#222"
            />
          </TouchableOpacity>
        </View>

        {/* Period tabs */}
        <View style={styles.tabRow}>
          {(['WEEK', 'MONTH', 'YEAR'] as PeriodTab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.periodTab, periodTab === t && styles.periodTabActive]}
              onPress={() => setPeriodTab(t)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  periodTab === t && styles.periodTabTextActive,
                ]}
              >
                {t === 'WEEK' ? 'Tuần' : t === 'MONTH' ? 'Tháng' : 'Năm'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Month scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthScroll}
        >
          {monthItems.map(m => {
            const isSelected = m.isSame(selectedDate, 'month');
            return (
              <TouchableOpacity
                key={m.format('YYYY-MM')}
                style={styles.monthItem}
                onPress={() => setSelectedDate(m)}
              >
                <Text
                  style={[
                    styles.monthText,
                    isSelected && styles.monthTextActive,
                  ]}
                >
                  {m.isSame(dayjs(), 'month')
                    ? 'Tháng này'
                    : m.isSame(dayjs().subtract(1, 'month'), 'month')
                    ? 'Tháng trước'
                    : m.format('[thg] M YYYY')}
                </Text>
                {isSelected && <View style={styles.monthUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Chart area (swipeable) ────────────────────────────────────────── */}
        <View {...panResponder.panHandlers} style={styles.chartArea}>
          {renderChartArea()}
        </View>

        {/* Page dots */}
        <View style={styles.dotsRow}>
          {([0, 1, 2] as ChartPage[]).map(i => (
            <TouchableOpacity key={i} onPress={() => setChartPage(i)}>
              <View style={[styles.pageDot, chartPage === i && styles.pageDotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />
        <View style={styles.catList}>
          {stats.map((c, i) => {
            const pct = total ? Math.round((c.totalAmount / total) * 100) : 0;
            const col = c.categoryColor || CHART_COLORS[i % CHART_COLORS.length];
            return (
              <View key={c.categoryId} style={styles.catItem}>
                <View style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: col }]}>
                    <MaterialCommunityIcons
                      name={c.categoryIcon ?? 'wallet-outline'}
                      size={22}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catNameRow}>
                      <Text style={styles.catName}>{c.categoryName}</Text>
                      <Text style={styles.catPct}>{pct}%</Text>
                    </View>
                  </View>
                  <Text style={styles.catAmount}>{fmt(c.totalAmount)}</Text>
                </View>
                <View style={[styles.progressBar, { marginLeft: 52 }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%` as any, backgroundColor: col },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={showTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.typeModal}>
            {(['EXPENSE', 'INCOME'] as TransactionType[]).map(t => (
              <TouchableOpacity
                key={t}
                style={styles.typeOpt}
                onPress={() => {
                  setTransType(t);
                  setShowTypeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.typeOptText,
                    transType === t && styles.typeOptTextActive,
                  ]}
                >
                  {t === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
                </Text>
                {transType === t && (
                  <MaterialCommunityIcons name="check" size={18} color="#109dd0" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // header
  header: { backgroundColor: colors.primary },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  typeToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeLabel: { fontSize: 18, fontWeight: '700', color: '#222' },
  calBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  // period tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  periodTabActive: { backgroundColor: '#109dd0' },
  periodTabText: { fontSize: 14, fontWeight: '600', color: '#333' },
  periodTabTextActive: { color: '#fff' },

  // month scroll
  monthScroll: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  monthItem: { paddingHorizontal: 12, paddingBottom: 4, alignItems: 'center' },
  monthText: { fontSize: 14, color: '#333' },
  monthTextActive: { fontWeight: '700', color: '#fff' },
  monthUnderline: { height: 2, width: '100%', backgroundColor: '#fff', borderRadius: 1, marginTop: 2 },

  // chart
  chartArea: { paddingVertical: 16, minHeight: 200 },
  donutWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  donutCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutAmount: { fontSize: 14, fontWeight: '700', color: '#222' },
  legend: { flex: 1, paddingLeft: 12, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  legendName: { flex: 1, fontSize: 14, color: '#333' },
  legendPct: { fontSize: 14, fontWeight: '600', color: '#666' },

  // summary
  summaryText: { fontSize: 13, color: '#555', marginBottom: 10 },
  summaryBold: { fontWeight: '700', color: '#222' },

  // line chart
  lineWrap: { overflow: 'hidden' },
  lineXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisLabel: { fontSize: 11, color: '#999' },

  // bar chart
  barWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    gap: 4,
    paddingTop: 10,
  },
  barGroup: { flex: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 },
  barFill: { width: '100%', borderRadius: 3 },
  barLabel: { fontSize: 10, color: '#888', marginTop: 4 },

  // dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 },
  pageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  pageDotActive: { backgroundColor: '#333' },

  // divider / cat list
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 0 },
  catList: { padding: 16, gap: 18 },
  catItem: { gap: 6 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  catInfo: { flex: 1 },
  catNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  catName: { fontSize: 15, fontWeight: '600', color: '#222' },
  catPct: { fontSize: 13, color: '#888' },
  catAmount: { fontSize: 15, fontWeight: '600', color: '#222' },
  progressBar: { height: 5, borderRadius: 3, backgroundColor: '#f0f0f0', overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },

  // empty
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    marginVertical: 40,
  },

  // modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start', alignItems: 'center',
    paddingTop: 120,
  },
  typeModal: {
    backgroundColor: '#fff', borderRadius: 12,
    minWidth: 160, overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  typeOpt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  typeOptText: { fontSize: 15, fontWeight: '600', color: '#333' },
  typeOptTextActive: { color: '#109dd0' },
});