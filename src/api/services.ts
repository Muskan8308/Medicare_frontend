import api from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  bloodGroup?: string
  address?: string
  medicalHistory?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: number
  firstName: string
  lastName: string
  specialization: string
  email: string
  phone: string
  qualification?: string
  experienceYears?: number
  consultationFee?: number
  bio?: string
  availableDays?: string
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'ON_LEAVE'
  createdAt: string
}

export interface Appointment {
  id: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  doctorSpecialization: string
  appointmentDate: string
  appointmentTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  reason?: string
  notes?: string
  createdAt: string
}

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  scheduledAppointments: number
  todayAppointments: number
  activePatients: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export const patientApi = {
  getAll: (search?: string) =>
    api.get<Patient[]>('/patients', { params: search ? { search } : {} }),

  getById: (id: number) =>
    api.get<Patient>(`/patients/${id}`),

  create: (data: Omit<Patient, 'id' | 'status' | 'createdAt' | 'updatedAt'>) =>
    api.post<Patient>('/patients', data),

  update: (id: number, data: Omit<Patient, 'id' | 'status' | 'createdAt' | 'updatedAt'>) =>
    api.put<Patient>(`/patients/${id}`, data),

  delete: (id: number) =>
    api.delete(`/patients/${id}`),
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

export const doctorApi = {
  getAll: (search?: string) =>
    api.get<Doctor[]>('/doctors', { params: search ? { search } : {} }),

  getById: (id: number) =>
    api.get<Doctor>(`/doctors/${id}`),

  create: (data: Omit<Doctor, 'id' | 'status' | 'createdAt'>) =>
    api.post<Doctor>('/doctors', data),

  update: (id: number, data: Omit<Doctor, 'id' | 'status' | 'createdAt'>) =>
    api.put<Doctor>(`/doctors/${id}`, data),

  delete: (id: number) =>
    api.delete(`/doctors/${id}`),

  getSpecializations: () =>
    api.get<string[]>('/doctors/specializations'),
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointmentApi = {
  getAll: (date?: string) =>
    api.get<Appointment[]>('/appointments', { params: date ? { date } : {} }),

  getById: (id: number) =>
    api.get<Appointment>(`/appointments/${id}`),

  getByPatient: (patientId: number) =>
    api.get<Appointment[]>(`/appointments/patient/${patientId}`),

  getByDoctor: (doctorId: number) =>
    api.get<Appointment[]>(`/appointments/doctor/${doctorId}`),

  book: (data: {
    patientId: number
    doctorId: number
    appointmentDate: string
    appointmentTime: string
    reason?: string
    notes?: string
  }) => api.post<Appointment>('/appointments', data),

  updateStatus: (id: number, status: Appointment['status'], notes?: string) =>
    api.put<Appointment>(`/appointments/${id}/status`, { status, notes }),

  cancel: (id: number) =>
    api.put(`/appointments/${id}/cancel`),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),
}
