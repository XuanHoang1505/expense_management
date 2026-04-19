import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, RefreshControl,
} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useAuthStore } from '../../store/authStore'
import { useTransactionStore } from '../../store/transactionStore'
import { formatCurrency } from '../../utils/formatCurrency'
import { Transaction } from '../../api/transactionApi'
import { colors } from '../../constants/colors'

dayjs.locale('vi')

export default function HomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false)
  const { user }                    = useAuthStore()
  const {
    transactions, summary,
    fetchByMonth, fetchSummary,
  } = useTransactionStore()

  const now   = dayjs()
  const year  = now.year()
  const month = now.month() + 1

  const loadData = async () => {
    await Promise.all([
      fetchByMonth(year, month),
      fetchSummary(year, month),
    ])
  }

  useEffect(() => { loadData() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const recentTransactions = transactions.slice(0, 5)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Xin chào, {user?.fullName?.split(' ').pop() ?? 'bạn'} 
            </Text>
            <Text style={styles.dateText}>
              {now.format('dddd, DD/MM/YYYY')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('SearchTransaction')}>
            <MaterialCommunityIcons name="magnify" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Card số dư */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư tháng {month}</Text>
          <Text style={[
            styles.balanceAmount,
            { color: (summary?.balance ?? 0) >= 0 ? '#1B5E20' : '#B71C1C' }
          ]}>
            {formatCurrency(summary?.balance ?? 0)}
          </Text>

          {/* Thu / Chi */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <MaterialCommunityIcons name="arrow-down" size={16} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Thu nhập</Text>
                <Text style={[styles.summaryAmount, { color: '#2E7D32' }]}>
                  {formatCurrency(summary?.totalIncome ?? 0)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#FFEBEE' }]}>
                <MaterialCommunityIcons name="arrow-up" size={16} color="#C62828" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Chi tiêu</Text>
                <Text style={[styles.summaryAmount, { color: '#C62828' }]}>
                  {formatCurrency(summary?.totalExpense ?? 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <QuickAction
            icon="plus-circle-outline"
            label="Thêm"
            color={colors.primary}
            onPress={() => navigation.navigate('Add')}
          />
          <QuickAction
            icon="format-list-bulleted"
            label="Giao dịch"
            color="#64B5F6"
            onPress={() => navigation.navigate('Transactions')}
          />
          <QuickAction
            icon="chart-pie"
            label="Thống kê"
            color="#81C784"
            onPress={() => navigation.navigate('Stats')}
          />
          <QuickAction
            icon="magnify"
            label="Tìm kiếm"
            color="#FFB74D"
            onPress={() => navigation.navigate('SearchTransaction')}
          />
        </View>

        {/* Giao dịch gần đây */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0
            ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="inbox-outline" size={48} color="#DDD" />
                <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
              </View>
            )
            : recentTransactions.map((t, idx) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                isLast={idx === recentTransactions.length - 1}
                onPress={() => navigation.navigate('DetailTransaction', { transaction: t })}
              />
            ))
          }
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

// Quick action button
function QuickAction({
  icon, label, color, onPress
}: {
  icon:    string
  label:   string
  color:   string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.quickItem} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

// Transaction item
function TransactionItem({
  transaction, isLast, onPress
}: {
  transaction: Transaction
  isLast:      boolean
  onPress:    () => void
}) {
  const isExpense = transaction.type === 'EXPENSE'

  return (
    <TouchableOpacity onPress={onPress} style={[styles.txItem, isLast && { borderBottomWidth: 0 }]}>
      <View style={[
        styles.txIcon,
        { backgroundColor: transaction.categoryColor ?? '#607D8B' }
      ]}>
        <MaterialCommunityIcons
          name={transaction.categoryIcon ?? 'wallet-outline'}
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txName} numberOfLines={1}>
          {transaction.note ?? transaction.categoryName}
        </Text>
        <Text style={styles.txDate}>
          {dayjs(transaction.date).format('DD/MM')}
          {'  '}{transaction.categoryName}
        </Text>
      </View>
      <Text style={[
        styles.txAmount,
        { color: isExpense ? '#C62828' : '#2E7D32' }
      ]}>
        {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   colors.primary,
    paddingHorizontal: 16,
    paddingTop:        52,
    paddingBottom:     20,
  },
  greeting: {
    fontSize:   20,
    fontWeight: 'bold',
    color:      '#222',
  },
  dateText: {
    fontSize:  13,
    color:     '#555',
    marginTop: 2,
  },
  searchBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent:  'center',
    alignItems:      'center',
  },

  // Balance card
  balanceCard: {
    backgroundColor:   '#fff',
    marginHorizontal:  16,
    marginTop:         10,
    borderRadius:      16,
    padding:           20,
    elevation:         3,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.08,
    shadowRadius:      8,
    marginBottom:      16,
  },
  balanceLabel: {
    fontSize: 13,
    color:    '#888',
  },
  balanceAmount: {
    fontSize:     32,
    fontWeight:   'bold',
    marginTop:    4,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection:  'row',
    alignItems:     'center',
  },
  summaryItem: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  summaryIcon: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#E8F5E9',
    justifyContent:  'center',
    alignItems:      'center',
  },
  summaryLabel: {
    fontSize: 12,
    color:    '#888',
  },
  summaryAmount: {
    fontSize:   15,
    fontWeight: '600',
    marginTop:  2,
  },
  divider: {
    width:           1,
    height:          40,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 8,
  },

  // Quick actions
  quickActions: {
    flexDirection:     'row',
    backgroundColor:   '#fff',
    marginHorizontal:  16,
    borderRadius:      16,
    padding:           16,
    marginBottom:      16,
    elevation:         2,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.06,
    shadowRadius:      4,
  },
  quickItem: {
    flex:       1,
    alignItems: 'center',
    gap:        6,
  },
  quickIcon: {
    width:          48,
    height:         48,
    borderRadius:   24,
    justifyContent: 'center',
    alignItems:     'center',
  },
  quickLabel: {
    fontSize: 11,
    color:    '#555',
    fontWeight: '500',
  },

  // Section
  section: {
    backgroundColor:   '#fff',
    marginHorizontal:  16,
    borderRadius:      16,
    overflow:          'hidden',
    elevation:         2,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.06,
    shadowRadius:      4,
  },
  sectionHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize:   16,
    fontWeight: '600',
    color:      '#222',
  },
  seeAll: {
    fontSize: 13,
    color:    colors.primary,
    fontWeight: '500',
  },

  // Transaction
  txItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  txIcon: {
    width:          40,
    height:         40,
    borderRadius:   20,
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    12,
  },
  txInfo: { flex: 1 },
  txName: {
    fontSize:   14,
    color:      '#222',
    fontWeight: '500',
  },
  txDate: {
    fontSize:  12,
    color:     '#999',
    marginTop: 2,
  },
  txAmount: {
    fontSize:   15,
    fontWeight: '600',
  },

  // Empty
  empty: {
    alignItems:    'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize:  14,
    color:     '#CCC',
    marginTop: 8,
  },
})