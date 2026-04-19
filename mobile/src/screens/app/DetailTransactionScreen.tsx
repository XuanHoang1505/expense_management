import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTransactionStore } from '../../store/transactionStore';

export default function DetailTransactionScreen({ navigation, route }: any) {
  const { transaction } = route.params;
  const type = transaction.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập';
  const catName = transaction.categoryName;
  const amount = transaction.amount ?? 0;
  const date = dayjs(transaction.date).format('D [thg] M, YYYY');
  const createdAtFormatted = dayjs(transaction.createdAt).format(
    '( [Thêm] dd D [thg] M, YYYY HH:mm:ss )',
  );
  const note = transaction.note ?? 'Không có';

  const { deleteTransaction } = useTransactionStore();

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa giao dịch này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
            ToastAndroid.show('Đã xóa giao dịch', ToastAndroid.SHORT);
            navigation.goBack();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết giao dịch</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.body}>
          <View style={styles.cateRow}>
            <View
              style={[
                styles.catIcon,
                { backgroundColor: transaction.categoryColor ?? '#222' },
              ]}
            >
              <MaterialCommunityIcons
                name={transaction.categoryIcon}
                size={20}
                color="#fff"
              />
            </View>
            <Text style={styles.catTitle}>{catName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.rowTitle}>Loại</Text>
            <Text style={styles.rowInfo}>{type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.rowTitle}>Số tiền</Text>
            <Text style={styles.rowInfo}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.rowTitle}>Ngày</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowInfo}>{date}</Text>
              <Text style={styles.subText}>{createdAtFormatted}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.rowTitle}>Ghi chú</Text>
            <Text style={styles.rowInfo}>{note}</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() =>
            navigation.navigate('EditTransaction', { transaction })
          }
        >
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.footerBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  body: {
    marginHorizontal: 25,
    marginTop: 30,
  },
  cateRow: {
    flexDirection: 'row',
    gap: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rowTitle: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  rowInfo: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  subText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  footerBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    width: 1,
    backgroundColor: '#eee',
  },

  editText: {
    fontSize: 16,
    color: '#000',
  },

  deleteText: {
    fontSize: 16,
    color: 'red',
  },
});
