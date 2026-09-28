import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import StudentListScreen from '../screens/StudentListScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import AddStudentScreen from '../screens/AddStudentScreen';
import EditStudentScreen from '../screens/EditStudentScreen';

const Stack = createNativeStackNavigator();

function AppNavigator({students, addStudent, updateStudent, deleteStudent}) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerTintColor: '#336397', headerTitleStyle: {color: '#336397', fontWeight: '700'}, contentStyle: {backgroundColor: '#ECECF3'}}}>
        <Stack.Screen name="StudentList" options={{title: 'Quản lý sinh viên'}}>
          {props => <StudentListScreen {...props} students={students} deleteStudent={deleteStudent} />}
        </Stack.Screen>
        <Stack.Screen name="StudentDetail" options={{title: 'Thông tin sinh viên'}}>
          {props => <StudentDetailScreen {...props} onDelete={deleteStudent} />}
        </Stack.Screen>
        <Stack.Screen name="AddStudent" options={{title: 'Thêm sinh viên'}}>
          {props => <AddStudentScreen {...props} students={students} addStudent={addStudent} />}
        </Stack.Screen>
        <Stack.Screen name="EditStudent" options={{title: 'Chỉnh sửa sinh viên'}}>
          {props => <EditStudentScreen {...props} onUpdate={updateStudent} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
