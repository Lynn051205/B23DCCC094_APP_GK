import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {getRank} from '../utils/rankHelper';

function StudentDetailScreen({route}) {
  const {student} = route.params;
  const fields = [['Mã sinh viên', student.id], ['Họ tên', student.name], ['Ngày sinh', student.birthDate], ['Giới tính', student.gender], ['Email', student.email], ['Số điện thoại', student.phone], ['Lớp', student.className], ['Khoa', student.faculty], ['GPA', student.gpa], ['Xếp loại', getRank(student.gpa)]];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>{fields.map(([label, value]) => <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20},
  card: {backgroundColor: '#fff', borderRadius: 14, padding: 18},
  row: {borderBottomColor: '#eef2f6', borderBottomWidth: 1, paddingVertical: 13},
  label: {color: '#B790A4', fontSize: 13, marginBottom: 4},
  value: {color: '#336397', fontSize: 16, fontWeight: '600'},
});

export default StudentDetailScreen;
