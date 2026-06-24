import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('hb_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('hb_current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (role === 'admin') {
          if (email === 'admin@healthbook.vn' && password === 'admin123') {
            const adminUser = { role: 'admin', email: 'admin@healthbook.vn', fullName: 'Quản trị viên' };
            setUser(adminUser);
            localStorage.setItem('hb_current_user', JSON.stringify(adminUser));
            resolve({ success: true, user: adminUser });
          } else {
            reject({ message: 'Tài khoản hoặc mật khẩu Admin không chính xác!' });
          }
        } else {
          // Patient login
          const savedUsers = localStorage.getItem('hb_users');
          let users = [];
          if (savedUsers) {
            try { users = JSON.parse(savedUsers); } catch (e) {}
          }

          const found = users.find(u => u.email === email && u.password === password);
          if (found) {
            const patientUser = { role: 'patient', ...found };
            delete patientUser.password; // Do not store password in state

            setUser(patientUser);
            localStorage.setItem('hb_current_user', JSON.stringify(patientUser));
            
            // Sync with Patient Profile Page details
            localStorage.setItem('hb_patient_profile', JSON.stringify({
              fullName: found.fullName,
              email: found.email,
              phone: found.phone,
              dob: found.dob || '1995-10-15',
              gender: found.gender || 'Nam',
              address: found.address || 'Hà Nội',
              bloodType: found.bloodType || 'O+',
              height: found.height || 170,
              weight: found.weight || 60,
              bloodPressure: found.bloodPressure || '120/80',
              heartRate: found.heartRate || 75,
              allergies: found.allergies || 'Không dị ứng'
            }));

            resolve({ success: true, user: patientUser });
          } else {
            reject({ message: 'Email hoặc mật khẩu không chính xác!' });
          }
        }
      }, 500);
    });
  };

  const register = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const savedUsers = localStorage.getItem('hb_users');
        let users = [];
        if (savedUsers) {
          try { users = JSON.parse(savedUsers); } catch (e) {}
        }

        const emailExists = users.some(u => u.email === userData.email);
        if (emailExists) {
          reject({ message: 'Email này đã được đăng ký!' });
          return;
        }

        // Add user with default patient profile indices
        const newUser = {
          ...userData,
          bloodType: 'O+',
          height: 170,
          weight: 60,
          bloodPressure: '120/80',
          heartRate: 75,
          allergies: 'Không dị ứng'
        };

        users.push(newUser);
        localStorage.setItem('hb_users', JSON.stringify(users));

        // Gửi email chào mừng
        authApi.sendRegisterEmail({
          email: newUser.email,
          fullName: newUser.fullName
        }).catch(err => {
          console.error('Không thể gửi email chào mừng:', err);
        });

        resolve({ success: true });
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hb_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
