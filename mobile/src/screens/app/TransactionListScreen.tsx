import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Transaction } from '../../api/transactionApi';
import { useTransactionStore } from '../../store/transactionStore'; // ← dùng store
import { formatCurrency } from '../../utils/formatCurrency';
import { colors } from '../../constants/colors';

dayjs.locale('vi');

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    const date = t.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function TransactionListScreen({ navigation }: any) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [refreshing, setRefreshing] = useState(false);

  const { transactions, summary, loading, fetchByMonth, fetchSummary } =
    useTransactionStore();

  const year = currentDate.year();
  const month = currentDate.month() + 1;

  // Fetch khi đổi tháng
  useEffect(() => {
    fetchByMonth(year, month);
    fetchSummary(year, month);
  }, [year, month]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchByMonth(year, month);
    await fetchSummary(year, month);
    setRefreshing(false);
  };

  const prevMonth = () => setCurrentDate(d => d.subtract(1, 'month'));
  const nextMonth = () => {
    const next = currentDate.add(1, 'month');
    if (next.isAfter(dayjs(), 'month')) return;
    setCurrentDate(next);
  };

  const grouped = groupByDate(transactions);

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.yearText}>{year}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('SearchTransaction')}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerMiddle}>
        <TouchableOpacity onPress={prevMonth}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.monthText}>Thg {month}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.summaryRow}>
          <SummaryItem label="Chi tiêu" amount={summary?.totalExpense ?? 0} />
          <SummaryItem label="Thu nhập" amount={summary?.totalIncome ?? 0} />
          <SummaryItem label="Số dư" amount={summary?.balance ?? 0} isBalance />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <FlatList
        data={grouped}
        keyExtractor={item => item[0]}
        ListHeaderComponent={<Header />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const [date, txns] = item;
          const dayTotal = txns
            .filter(t => t.type === 'EXPENSE')
            .reduce((s, t) => s + t.amount, 0);

          return (
            <View style={styles.group}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>
                  {dayjs(date).format('D MMM')}
                  {'  '}
                  <Text style={styles.dayOfWeek}>
                    {dayjs(date).format('dddd')}
                  </Text>
                </Text>
                {dayTotal > 0 && (
                  <Text style={styles.dateTotalText}>
                    Chi tiêu: {formatCurrency(dayTotal)}
                  </Text>
                )}
              </View>

              {txns.map((t, idx) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  isLast={idx === txns.length - 1}
                  onPress={() =>
                    navigation.navigate('DetailTransaction', { transaction: t })
                  }
                />
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="inbox-outline"
              size={64}
              color="#DDD"
            />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        }
      />
    </View>
  );
}

function SummaryItem({
  label,
  amount,
  isBalance,
}: {
  label: string;
  amount: number;
  isBalance?: boolean;
}) {
  const color = isBalance ? (amount >= 0 ? '#15c018' : '#C62828') : '#fff';

  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryAmount, { color }]}>
        {amount === 0 ? '0' : formatCurrency(amount)}
      </Text>
    </View>
  );
}

function TransactionItem({
  transaction,
  isLast,
  onPress,
}: {
  transaction: Transaction;
  isLast: boolean;
  onPress: () => {};
}) {
  const isExpense = transaction.type === 'EXPENSE';
  const iconName = transaction.categoryIcon ?? 'wallet-outline';
  const iconColor = transaction.categoryColor ?? '#607D8B';

  return (
    <TouchableOpacity
      style={[styles.txItem, isLast && styles.txItemLast]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.categoryIcon, { backgroundColor: iconColor }]}>
        <MaterialCommunityIcons name={iconName} size={22} color="#fff" />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txCategory}>{transaction.categoryName}</Text>
        <Text style={styles.txName}>
          {transaction.note ?? transaction.categoryName}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={[
            styles.txAmount,
            { color: isExpense ? '#C62828' : '#2E7D32' },
          ]}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.txName}>
          {dayjs(transaction.createdAt).format('HH:mm')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// styles giữ nguyên như trước...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: StatusBar.currentHeight,
  },
  yearText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  headerMiddle: { flexDirection: 'row', alignItems: 'center' },
  monthText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 4,
  },
  summaryRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  summaryItem: { alignItems: 'flex-end' },
  summaryLabel: { fontSize: 11, color: '#fff' },
  summaryAmount: { fontSize: 15, fontWeight: '600' },
  group: { backgroundColor: '#fff', marginBottom: 8 },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateText: { fontSize: 14, color: '#444', fontWeight: '500' },
  dayOfWeek: { fontSize: 13, color: '#888', fontWeight: '400' },
  dateTotalText: { fontSize: 13, color: '#888' },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  txItemLast: { borderBottomWidth: 0 },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txCategory: { fontSize: 15, color: '#222', fontWeight: '500' },
  txName: { fontSize: 12, color: '#999', marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#CCC', marginTop: 12 },
});
