import React, {useMemo, useState} from 'react';
import {Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import StudentItem from '../components/StudentItem';

function StudentListScreen({navigation, students, deleteStudent}) {
  const [query, setQuery] = useState('');
  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students;
    return students.filter(student =>
      student.id.toLowerCase().includes(normalizedQuery) || student.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, students]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Danh sách sinh viên</Text>
        <Text style={styles.subtitle}>{students.length} sinh viên đang được quản lý</Text>
        <View style={styles.searchRow}>
          <TextInput value={query} onChangeText={setQuery} placeholder="Tìm theo mã hoặc họ tên" placeholderTextColor="#B790A4" style={styles.search} />
          <TouchableOpacity
            accessibilityLabel="Thêm sinh viên"
            accessibilityRole="button"
            onPress={() => navigation.navigate('AddStudent', {students})}
            style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <StudentItem
              student={item}
              onPress={() => navigation.navigate('StudentDetail', {student: item})}
              onEdit={() => navigation.navigate('EditStudent', {student: item})}
              onDelete={() => Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa sinh viên này không?', [
                {text: 'Hủy', style: 'cancel'},
                {text: 'Xóa', style: 'destructive', onPress: () => { deleteStudent(item.id); Alert.alert('Thành công', 'Đã xóa sinh viên.'); }},
              ])}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sinh viên phù hợp.</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1},
  container: {backgroundColor: '#ECECF3', flex: 1, padding: 20},
  title: {color: '#336397', fontSize: 28, fontWeight: '800'},
  subtitle: {color: '#B790A4', fontSize: 14, marginBottom: 18, marginTop: 5},
  searchRow: {alignItems: 'center', flexDirection: 'row', marginBottom: 4},
  search: {backgroundColor: '#fff', borderColor: '#B790A4', borderRadius: 10, borderWidth: 1, color: '#336397', flex: 1, fontSize: 14, minHeight: 42, paddingHorizontal: 12},
  addButton: {alignItems: 'center', backgroundColor: '#FBC3C8', borderRadius: 21, elevation: 3, height: 42, justifyContent: 'center', marginLeft: 10, shadowColor: '#336397', shadowOpacity: 0.18, shadowRadius: 5, width: 42},
  addIcon: {color: '#336397', fontSize: 28, fontWeight: '300', lineHeight: 32},
  list: {paddingTop: 18, paddingBottom: 24},
  empty: {color: '#B790A4', paddingTop: 35, textAlign: 'center'},
});

export default StudentListScreen;
