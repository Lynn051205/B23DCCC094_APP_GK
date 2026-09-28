import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet} from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

const emptyStudent = {id: '', name: '', birthDate: '', gender: '', email: '', phone: '', className: '', faculty: '', gpa: ''};

function validate(student, students = [], editingId) {
  const errors = {};
  Object.entries(student).forEach(([key, value]) => { if (!String(value).trim()) errors[key] = 'Vui lòng nhập thông tin này.'; });
  if (student.email && !/^\S+@\S+\.\S+$/.test(student.email)) errors.email = 'Email không hợp lệ.';
  if (student.phone && !/^\d{10}$/.test(student.phone)) errors.phone = 'Số điện thoại phải gồm 10 chữ số.';
  if (student.gpa && (Number.isNaN(Number(student.gpa)) || Number(student.gpa) < 0 || Number(student.gpa) > 10)) errors.gpa = 'GPA phải nằm trong khoảng 0 đến 10.';
  if (student.id && students.some(item => item.id.toLowerCase() === student.id.toLowerCase() && item.id !== editingId)) errors.id = 'Mã sinh viên đã tồn tại.';
  return errors;
}

function AddStudentScreen({navigation, students, addStudent}) {
  const [student, setStudent] = useState(emptyStudent);
  const [errors, setErrors] = useState({});
  const update = (key, value) => setStudent(current => ({...current, [key]: value}));

  const submit = () => {
    const nextErrors = validate(student, students);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    Alert.alert('Xác nhận thêm', 'Bạn có muốn thêm sinh viên này không?', [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Thêm', onPress: () => { addStudent({...student, id: student.id.trim()}); Alert.alert('Thành công', 'Đã thêm sinh viên.'); navigation.goBack(); }},
    ]);
  };

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.container}>{[['id','Mã sinh viên'],['name','Họ tên'],['birthDate','Ngày sinh'],['gender','Giới tính'],['email','Email'],['phone','Số điện thoại'],['className','Lớp'],['faculty','Khoa'],['gpa','GPA']].map(([key, label]) => <CustomInput key={key} label={label} value={student[key]} onChangeText={value => update(key, value)} keyboardType={key === 'phone' || key === 'gpa' ? 'numeric' : 'default'} error={errors[key]} />)}<CustomButton title="Thêm sinh viên" onPress={submit} /></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({flex: {flex: 1}, container: {padding: 20, paddingBottom: 35}});
export {validate};
export default AddStudentScreen;
