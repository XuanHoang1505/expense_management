import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../constants/colors";
import Toast from "react-native-toast-message";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { ActivityIndicator } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterScreen({ navigation }: any) {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const res = await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      const { accessToken, user } = res.data.data;
      await setAuth(accessToken, user);

      Toast.show({
        type: "success",
        text1: "Đăng kí tài khoản thành công!",
      })
      
      reset()

    //   navigation.navigate('Login')
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2:
          e.response?.data?.message ||
          "Có lỗi xảy ra, vui lòng thử lại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quản lý chi tiêu</Text>
      <Text style={styles.subTitle}>Đăng ký</Text>

      {/* FULL NAME */}
      <Controller
        control={control}
        name="fullName"
        rules={{
          required: "Vui lòng nhập tên của bạn",
          minLength: {
            value: 2,
            message: "Tên ≥ 2 ký tự",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Tên người dùng"
              style={styles.input}
              value={value}
              onChangeText={onChange}
            />
            {errors.fullName && (
              <Text style={styles.error}>
                {errors.fullName.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{
          required: "Vui lòng nhập email",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Email không hợp lệ",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={value}
              onChangeText={onChange}
            />
            {errors.email && (
              <Text style={styles.error}>
                {errors.email.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{
          required: "Vui lòng nhập mật khẩu",
          minLength: {
            value: 6,
            message: "Mật khẩu tối thiểu 6 ký tự",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Mật khẩu"
              secureTextEntry
              style={styles.input}
              value={value}
              onChangeText={onChange}
            />
            {errors.password && (
              <Text style={styles.error}>
                {errors.password.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: "Vui lòng xác nhận mật khẩu",
          validate: (value, formValues) =>
            value === formValues.password ||
            "Mật khẩu xác nhận không khớp",
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Xác nhận mật khẩu"
              secureTextEntry
              style={styles.input}
              value={value}
              onChangeText={onChange}
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.link}>
            Bạn đã có tài khoản? <Text style={{ fontWeight: 'bold' }}>Đăng nhập</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontWeight: "bold",
    fontSize: 28,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 20,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    color: colors.primary,
    marginTop: 16, fontSize: 18,
    textAlign: "center"
  }
});