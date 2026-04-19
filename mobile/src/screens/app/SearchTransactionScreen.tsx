import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import dayjs from 'dayjs';

import { colors } from '../../constants/colors';
import { useEffect, useState } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useCategoryStore } from '../../store/categoryStore';
import { Transaction } from '../../api/transactionApi';
import { formatCurrency } from '../../utils/formatCurrency';

type TypeFilter = 'ALL' | 'EXPENSE' | 'INCOME';

dayjs.locale('vi') 

const TYPE_OPTIONS: { label: string; value: TypeFilter }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chi tiêu', value: 'EXPENSE' },
  { label: 'Thu nhập', value: 'INCOME' },
];

export default function SearchTransactionScreen({ navigation }: any) {
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [results, setResults] = useState<Transaction[]>([]);

  const { transactions, fetchByMonth } = useTransactionStore();
  const { categories, fetchByType } = useCategoryStore();

  useEffect(() => {
    const now = dayjs();
    fetchByMonth(now.year(), now.month() + 1);
    fetchByType('EXPENSE');
  }, []);

  // Load category của cả 2 loại
  useEffect(() => {
    fetchByType('EXPENSE');
    fetchByType('INCOME');
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...transactions];

    // Filter theo keyword
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.note?.toLowerCase().includes(kw) ||
          t.categoryName.toLowerCase().includes(kw),
      );
    }

    // Filter theo loại
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Filter theo category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t =>
        selectedCategories.includes(t.categoryId),
      );
    }

    setResults(filtered);
  }, [keyword, typeFilter, selectedCategories, transactions]);

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  };

  const handleReset = () => {
    setKeyword('');
    setTypeFilter('ALL');
    setSelectedCategories([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={{ backgroundColor: colors.primary }}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm giao dịch..."
            placeholderTextColor="#BBB"
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="search"
          />
          {keyword.trim().length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#BBB"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        {/* filter loại  */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Loại</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {TYPE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  typeFilter === option.value && styles.chipSelected,
                ]}
                onPress={() => setTypeFilter(option.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    typeFilter === option.value && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CategoryFilter */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Danh mục</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {/* Nút Tất cả */}
            <TouchableOpacity
              style={[
                styles.chip,
                selectedCategories.length === 0 && styles.chipSelected,
              ]}
              onPress={() => setSelectedCategories([])}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategories.length === 0 && styles.chipTextSelected,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {/* Danh sách category */}
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  selectedCategories.includes(cat.id) && styles.chipSelected,
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <MaterialCommunityIcons
                  name={cat.icon ?? 'wallet-outline'}
                  size={14}
                  color={selectedCategories.includes(cat.id) ? '#333' : '#888'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.chipText,
                    selectedCategories.includes(cat.id) &&
                      styles.chipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <MaterialCommunityIcons name="refresh" size={22} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={() => {}}>
            <MaterialCommunityIcons name="check" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Kết quả tìm kiếm */}
        {results.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.resultCount}>{results.length} kết quả</Text>
            {results.map((t, idx) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                isLast={idx === results.length - 1}
                keyword={keyword}
                onPress={() =>
                  navigation.navigate('DetailTransaction', {
                    transaction: t,
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Empty state — có search nhưng không có kết quả */}
        {keyword.trim().length > 0 && results.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={56}
              color="#DDD"
            />
            <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function TransactionItem({
  transaction,
  isLast,
  keyword,
  onPress,
}: {
  transaction: Transaction;
  isLast: boolean;
  keyword: string;
  onPress: () => {};
}) {
  const isExpense = transaction.type === 'EXPENSE';

  // Highlight keyword trong text
  const highlight = (text: string) => {
    if (!keyword.trim()) return <Text style={styles.txName}>{text}</Text>;
    const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (idx === -1) return <Text style={styles.txName}>{text}</Text>;
    return (
      <Text style={styles.txName}>
        {text.slice(0, idx)}
        <Text style={styles.highlight}>
          {text.slice(idx, idx + keyword.length)}
        </Text>
        {text.slice(idx + keyword.length)}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.txItem, isLast && { borderBottomWidth: 0 }]}
    >
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: transaction.categoryColor ?? '#607D8B' },
        ]}
      >
        <MaterialCommunityIcons
          name={transaction.categoryIcon ?? 'wallet-outline'}
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.txInfo}>
        {highlight(transaction.note ?? transaction.categoryName)}
        <Text style={styles.txDate}>
          {dayjs(transaction.date).format('DD/MM/YYYY')}
          {'  '}
          {transaction.categoryName}
        </Text>
      </View>
      <Text
        style={[styles.txAmount, { color: isExpense ? '#C62828' : '#2E7D32' }]}
      >
        {isExpense ? '-' : '+'}
        {formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  body: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#333',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  resetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  applyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFF3B0',
  },

  // Kết quả
  resultSection: {
    marginTop: 16,
  },
  resultCount: {
    fontSize: 13,
    color: '#999',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txName: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  highlight: {
    backgroundColor: '#FFF3B0',
    color: '#333',
    fontWeight: '700',
  },
  txDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#CCC',
    marginTop: 12,
  },
});
