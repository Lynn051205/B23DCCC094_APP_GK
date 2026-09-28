import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text} from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import {validate} from './AddStudentScreen';

function EditStudentScreen({navigation, route, onUpdate}) {
  const original = route.params.student;
  const [student, setStudent] = useState({...original});
  const [errors, setErrors] = useState({});
  const update = (key, value) => setStudent(current => ({...current, [key]: value}));
  const submit = () => {
    const nextErrors = validate(student, [], original.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    Alert.alert('Xác nhận cập nhật', 'Bạn có muốn lưu thay đổi không?', [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Lưu', onPress: () => { onUpdate({...student, id: original.id}); Alert.alert('Thành công', 'Đã cập nhật thông tin sinh viên.'); navigation.replace('StudentDetail', {student: {...student, id: original.id}}); }},
    ]);
  };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.container}><Text style={styles.note}>Mã sinh viên không thể thay đổi.</Text>{[['name','Họ tên'],['birthDate','Ngày sinh'],['gender','Giới tính'],['email','Email'],['phone','Số điện thoại'],['className','Lớp'],['faculty','Khoa'],['gpa','GPA']].map(([key, label]) => <CustomInput key={key} label={label} value={student[key]} onChangeText={value => update(key, value)} keyboardType={key === 'phone' || key === 'gpa' ? 'numeric' : 'default'} error={errors[key]} />)}<CustomButton title="Lưu thay đổi" onPress={submit} /></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({flex: {backgroundColor: '#ECECF3', flex: 1}, container: {padding: 20, paddingBottom: 35}, note: {color: '#B790A4', fontSize: 13, marginBottom: 16}});
export default EditStudentScreen;
