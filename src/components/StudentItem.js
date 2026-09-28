import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {getRank} from '../utils/rankHelper';

function StudentItem({student, onPress, onEdit, onDelete}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.heading}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.id}>{student.id}</Text>
      </View>
      <Text style={styles.className}>Lớp: {student.className}</Text>
      <View style={styles.footer}>
        <Text style={styles.gpa}>GPA: {student.gpa}</Text>
        <Text style={styles.rank}>{getRank(student.gpa)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityLabel={`Chỉnh sửa ${student.name}`}
            hitSlop={8}
            onPress={onEdit}
            style={styles.iconButton}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={`Xóa ${student.name}`}
            hitSlop={8}
            onPress={onDelete}
            style={[styles.iconButton, styles.deleteButton]}>
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#fff', borderRadius: 14, elevation: 2, marginBottom: 12, padding: 16, shadowColor: '#336397', shadowOpacity: 0.1, shadowRadius: 8},
  heading: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  name: {color: '#336397', flex: 1, fontSize: 17, fontWeight: '700'},
  id: {color: '#B790A4', fontSize: 13, fontWeight: '700'},
  className: {color: '#B790A4', fontSize: 14, marginTop: 8},
  footer: {alignItems: 'center', flexDirection: 'row', marginTop: 14},
  gpa: {color: '#336397', fontWeight: '600'},
  rank: {backgroundColor: '#ECECF3', borderRadius: 8, color: '#336397', fontSize: 13, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5},
  actions: {alignItems: 'center', flexDirection: 'row', marginLeft: 'auto'},
  iconButton: {alignItems: 'center', backgroundColor: '#ECECF3', borderRadius: 18, height: 36, justifyContent: 'center', marginLeft: 8, width: 36},
  deleteButton: {backgroundColor: '#FBC3C8'},
  editIcon: {color: '#336397', fontSize: 22, lineHeight: 24},
  deleteIcon: {color: '#B790A4', fontSize: 25, lineHeight: 24},
});

export default StudentItem;
