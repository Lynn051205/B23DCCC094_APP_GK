import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/routes';
import {useFields} from '../context/FieldContext';
import {FormInput} from '../components/FormInput';
import {OptionButton} from '../components/OptionButton';
import {PrimaryButton} from '../components/PrimaryButton';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import type {FieldFormValues, FieldStatus, FieldType} from '../types';
import {hasErrors, validateFieldForm} from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldForm'>;

export function FieldFormScreen({navigation, route}: Props) {
  const fieldId = route.params?.fieldId;
  const {fields, addField, updateField} = useFields();
  const currentField = fields.find(field => field.id === fieldId);
  const isEdit = Boolean(currentField);

  const [values, setValues] = useState<FieldFormValues>({
    name: currentField?.name ?? '',
    type: currentField?.type ?? '5 người',
    pricePerHour: currentField ? String(currentField.pricePerHour) : '',
    status: currentField?.status ?? 'Hoạt động',
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateFieldForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (isEdit ? 'Sửa thông tin sân' : 'Thêm sân mới'),
    [isEdit],
  );

  const handleSave = async () => {
    const nextErrors = validateFieldForm(values, fields, currentField?.id);
    setErrors(nextErrors);
    if (hasErrors(nextErrors) || submitting) {
      return;
    }

    const payload = {
      name: values.name,
      type: values.type,
      pricePerHour: Number(values.pricePerHour.trim().replace(',', '.')),
      status: values.status,
    };

    setSubmitting(true);
    try {
      const saved = isEdit && currentField
        ? await updateField(currentField.id, payload)
        : await addField(payload);
      if (saved) {
        navigation.goBack();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Nhập thông tin sân để quản lý giá thuê và trạng thái vận hành.
          </Text>
          <FormInput
            label="Tên sân"
            value={values.name}
            onChangeText={name => setValues(current => ({...current, name}))}
            placeholder="Sân A1"
            error={errors.name}
          />
          <Text style={styles.groupLabel}>Loại sân</Text>
          <View style={styles.options}>
            {(['5 người', '7 người'] as FieldType[]).map(type => (
              <View key={type} style={styles.optionItem}>
                <OptionButton
                  label={type}
                  selected={values.type === type}
                  onPress={() => setValues(current => ({...current, type}))}
                />
              </View>
            ))}
          </View>
          <FormInput
            label="Giá thuê mỗi giờ"
            value={values.pricePerHour}
            onChangeText={pricePerHour =>
              setValues(current => ({...current, pricePerHour}))
            }
            placeholder="300000"
            keyboardType="numeric"
            error={errors.pricePerHour}
          />
          <Text style={styles.groupLabel}>Trạng thái</Text>
          <View style={styles.options}>
            {(['Hoạt động', 'Bảo trì'] as FieldStatus[]).map(status => (
              <View key={status} style={styles.optionItem}>
                <OptionButton
                  label={status}
                  selected={values.status === status}
                  onPress={() => setValues(current => ({...current, status}))}
                />
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <PrimaryButton
                label="Hủy"
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton
                label={submitting ? 'Đang lưu...' : 'Lưu'}
                disabled={submitting}
                onPress={() => {
                  handleSave().catch(() => undefined);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  groupLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionItem: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionItem: {
    flex: 1,
  },
});
