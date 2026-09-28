import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import mockStudents from './src/data/mockStudents';

function App() {
  const [students, setStudents] = useState(mockStudents);

  const addStudent = student => setStudents(current => [...current, student]);
  const updateStudent = updatedStudent => {
    setStudents(current =>
      current.map(student =>
        student.id === updatedStudent.id ? updatedStudent : student,
      ),
    );
  };
  const deleteStudent = studentId => {
    setStudents(current => current.filter(student => student.id !== studentId));
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7fb" />
      <AppNavigator
        students={students}
        addStudent={addStudent}
        updateStudent={updateStudent}
        deleteStudent={deleteStudent}
      />
    </SafeAreaProvider>
  );
}

export default App;
