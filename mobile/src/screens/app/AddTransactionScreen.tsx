import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';
import { Category } from '../../api/categoryApi';
import { colors } from '../../constants/colors';

type TabType = 'EXPENSE' | 'INCOME';

export default function AddTransactionScreen({ navigation }: any) {
  const [tab, setTab] = useState<TabType>('EXPENSE');
  const [selectedCategory, setSelected] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [saving, setSaving] = useState(false);

  const { expenseCategories, incomeCategories, loading, fetchByType } =
    useCategoryStore();
  const { addTransaction } = useTransactionStore();

  const categories = tab === 'EXPENSE' ? expenseCategories : incomeCategories;

  const categoriesWithAdd = [
    ...categories,
    {
      id: -1,
      name: 'Cài đặt',
      icon: 'plus',
      color: '#999',
      type: tab,
      isDefault: false,
    },
  ];

  useEffect(() => {
    setSelected(null);
    fetchByType(tab);
  }, [tab]);

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmount(numeric);
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      ToastAndroid.show('Vui lòng chọn danh mục', ToastAndroid.SHORT);
      return;
    }
    if (!amount || Number(amount) === 0) {
      ToastAndroid.show('Vui lòng nhập số tiền', ToastAndroid.SHORT);
      return;
    }
    try {
      setSaving(true);
      await addTransaction({
        amount: Number(amount),
        note: note.trim() || undefined,
        type: tab,
        date,
        categoryId: selectedCategory.id,
      });
      Alert.alert('Thành công', 'Đã thêm giao dịch', [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
            setNote('');
            setSelected(null);
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message ?? 'Thêm thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5C518" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setAmount('');
            setNote('');
            setSelected(null);
          }}
        >
          <Text style={styles.cancelText}>Huỷ</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thêm giao dịch</Text>

        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="check" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Chi tiêu / Thu nhập */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'EXPENSE' && styles.tabActive]}
          onPress={() => setTab('EXPENSE')}
        >
          <Text
            style={[styles.tabText, tab === 'EXPENSE' && styles.tabTextActive]}
          >
            Chi tiêu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'INCOME' && styles.tabActive]}
          onPress={() => setTab('INCOME')}
        >
          <Text
            style={[styles.tabText, tab === 'INCOME' && styles.tabTextActive]}
          >
            Thu nhập
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView>
          {loading ? (
            <ActivityIndicator
              style={{ marginTop: 32 }}
              color={colors.primary}
            />
          ) : (
            <FlatList
              data={categoriesWithAdd}
              keyExtractor={item => String(item.id)}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => {
                if (item.id === -1) {
                  return (
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => navigation.navigate('AddCategory')}
                    >
                      <View style={styles.categoryIcon}>
                        <MaterialCommunityIcons
                          name="plus"
                          size={28}
                          color="#555"
                        />
                      </View>
                      <Text style={styles.categoryName}>Thêm</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <CategoryItem
                    category={item}
                    isSelected={selectedCategory?.id === item.id}
                    onPress={() => setSelected(item)}
                  />
                );
              }}
            />
          )}

          {selectedCategory && (
            <View style={styles.form}>
              {/* Category đã chọn */}
              <View style={styles.selectedCategory}>
                <View
                  style={[
                    styles.selectedIcon,
                    { backgroundColor: selectedCategory.color ?? '#607D8B' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={selectedCategory.icon ?? 'wallet-outline'}
                    size={20}
                    color="#fff"
                  />
                </View>
                <Text style={styles.selectedName}>{selectedCategory.name}</Text>
              </View>

              {/* Nhập số tiền */}
              <View style={styles.amountRow}>
                <Text style={styles.currency}>₫</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  value={amount ? Number(amount).toLocaleString('vi-VN') : ''}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholderTextColor="#CCC"
                />
              </View>

              {/* Ngày */}
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color="#888"
                />
                <Text style={styles.rowLabel}>Ngày</Text>
                <Text style={styles.rowValue}>
                  {dayjs(date).format('DD/MM/YYYY')}
                </Text>
              </View>

              {/* Ghi chú */}
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color="#888"
                />
                <Text style={styles.rowLabel}>Ghi chú</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Thêm ghi chú..."
                  value={note}
                  onChangeText={setNote}
                  placeholderTextColor="#CCC"
                />
              </View>

              {/* Nút Lưu */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: tab === 'EXPENSE' ? '#C62828' : '#2E7D32',
                  },
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {tab === 'EXPENSE' ? 'Thêm chi tiêu' : 'Thêm thu nhập'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function CategoryItem({
  category,
  isSelected,
  onPress,
}: {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.categoryIcon, isSelected && styles.categoryIconSelected]}
      >
        <MaterialCommunityIcons
          name={category.icon ?? 'wallet-outline'}
          size={28}
          color={isSelected ? '#fff' : '#555'}
        />
      </View>
      <Text
        style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
        numberOfLines={2}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  tabActive: {
    backgroundColor: '#109dd0',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tabTextActive: {
    color: '#fff',
  },

  // Grid
  grid: {
    padding: 16,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconSelected: {
    backgroundColor: colors.primary,
  },
  categoryName: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  form: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: 16,
    paddingBottom: 8,
  },
  currency: {
    fontSize: 28,
    color: '#888',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
  },

  // Row (ngày, ghi chú)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: '#888',
    width: 60,
  },
  rowValue: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    textAlign: 'right',
  },
  noteInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    textAlign: 'right',
    padding: 0,
  },

  // Save button
  saveBtn: {
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
