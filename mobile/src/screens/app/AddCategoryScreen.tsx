import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RadioButton, TextInput } from 'react-native-paper';

import { useCategoryStore } from '../../store/categoryStore';
import { COLORS, ICON_GROUPS } from '../../constants/categoryIcons';
import { colors } from '../../constants/colors';

type TabType = 'EXPENSE' | 'INCOME';

export default function AddCategoryScreen({ navigation }: any) {
  const [type, setType] = useState<TabType>('EXPENSE');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_GROUPS[0].icons[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const { createCategory } = useCategoryStore();

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show('Vui lòng nhập tên danh mục', ToastAndroid.TOP);
      return;
    }
    try {
      setSaving(true);
      await createCategory({
        name: name,
        type: type,
        icon: selectedIcon,
        color: selectedColor,
      });
      Alert.alert('Thành công', 'Đã thêm danh mục', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      ToastAndroid.show(
        e.response?.data?.message ?? 'Thêm thất bại',
        ToastAndroid.SHORT,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm danh mục</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="check" size={26} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.radioRow}>
          <RadioButton.Group
            onValueChange={value => setType(value as TabType)}
            value={type}
          >
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setType('EXPENSE')}
              >
                <RadioButton
                  value="EXPENSE"
                  color={selectedColor}
                  uncheckedColor="#CCC"
                />
                <Text style={styles.radioLabel}>Chi tiêu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setType('INCOME')}
              >
                <RadioButton
                  value="INCOME"
                  color={selectedColor}
                  uncheckedColor="#CCC"
                />
                <Text style={styles.radioLabel}>Thu nhập</Text>
              </TouchableOpacity>
            </View>
          </RadioButton.Group>
        </View>

        {/* Tên danh mục + preview icon */}
        <View style={styles.nameRow}>
          <View
            style={[styles.previewIcon, { backgroundColor: selectedColor }]}
          >
            <MaterialCommunityIcons
              name={selectedIcon}
              size={28}
              color="#fff"
            />
          </View>
          <TextInput
            style={styles.nameInput}
            placeholder="Vui lòng nhập tên danh mục"
            placeholderTextColor="#BBB"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </View>

        <View style={styles.colorGrid}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setSelectedColor(c)}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                selectedColor === c && styles.colorDotSelected,
              ]}
            >
              {selectedColor === c && (
                <MaterialCommunityIcons name="check" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {ICON_GROUPS.map(group => (
          <View key={group.group}>
            <Text style={styles.groupTitle}>{group.group}</Text>
            <View style={styles.iconGrid}>
              {group.icons.map(icon => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconBtn,
                    selectedIcon === icon && {
                      backgroundColor: selectedColor,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={26}
                    color={selectedIcon === icon ? '#fff' : '#555'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  cancelText: {
    fontSize: 16,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  radioRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 32,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 20,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 15
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 8,
    marginLeft: 15
  },
  iconBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
