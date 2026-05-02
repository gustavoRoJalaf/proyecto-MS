import { useState, useEffect, useRef } from 'react';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  rut: string;
  diagnosis: string;
  address: string;
  phone: string;
  email: string;
  medicalOrderUri?: string;
  medicalOrderName?: string;
  location: { latitude: number; longitude: number };
  assignedDoctorId?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  email: string;
  location: { latitude: number; longitude: number };
  assignedPatients: string[];
  visitStatus: 'available' | 'en_route' | 'visiting' | 'completed';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MedicalExam {
  id: string;
  patientId: string;
  name: string;
  date: string;
  result?: string;
  fileUri?: string;
  status: 'pending' | 'completed' | 'reviewed';
  doctorNotes?: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
}

// --- Mock Data ---

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    firstName: 'Carlos',
    lastName: 'Mendoza García',
    rut: '12.345.678-9',
    diagnosis: 'Hipertensión arterial y diabetes tipo 2',
    address: 'Av. Las Condes 1234, Santiago',
    phone: '+56 9 8765 4321',
    email: 'carlos.mendoza@email.com',
    location: { latitude: -33.4172, longitude: -70.6062 },
    assignedDoctorId: 'd1',
  },
  {
    id: 'p2',
    firstName: 'María',
    lastName: 'López Fernández',
    rut: '9.876.543-2',
    diagnosis: 'Insuficiencia cardíaca leve',
    address: 'Calle Providencia 567, Santiago',
    phone: '+56 9 1234 5678',
    email: 'maria.lopez@email.com',
    location: { latitude: -33.4320, longitude: -70.6150 },
    assignedDoctorId: 'd1',
  },
  {
    id: 'p3',
    firstName: 'Juan',
    lastName: 'Pérez Silva',
    rut: '15.234.567-K',
    diagnosis: 'Artritis reumatoide',
    address: 'Las Flores 890, Ñuñoa',
    phone: '+56 9 5555 6666',
    email: 'juan.perez@email.com',
    location: { latitude: -33.4550, longitude: -70.5950 },
    assignedDoctorId: 'd2',
  },
  {
    id: 'p4',
    firstName: 'Ana',
    lastName: 'Torres Rivas',
    rut: '11.111.111-1',
    diagnosis: 'Asma bronquial',
    address: 'Av. Irarrázaval 2222, Ñuñoa',
    phone: '+56 9 7777 8888',
    email: 'ana.torres@email.com',
    location: { latitude: -33.4480, longitude: -70.6080 },
    assignedDoctorId: 'd2',
  },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    firstName: 'Dra. Patricia',
    lastName: 'Vidal Morales',
    specialty: 'Medicina Interna',
    phone: '+56 9 1111 2222',
    email: 'patricia.vidal@clinica.cl',
    location: { latitude: -33.4280, longitude: -70.6100 },
    assignedPatients: ['p1', 'p2'],
    visitStatus: 'en_route',
  },
  {
    id: 'd2',
    firstName: 'Dr. Roberto',
    lastName: 'Salas Quiroga',
    specialty: 'Reumatología',
    phone: '+56 9 3333 4444',
    email: 'roberto.salas@clinica.cl',
    location: { latitude: -33.4510, longitude: -70.6000 },
    assignedPatients: ['p3', 'p4'],
    visitStatus: 'available',
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2026-05-05',
    time: '09:30',
    status: 'confirmed',
    notes: 'Control rutinario + toma de muestra de sangre',
  },
  {
    id: 'a2',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2026-04-20',
    time: '10:00',
    status: 'completed',
    notes: 'Revisión resultados examen de glucosa',
  },
  {
    id: 'a3',
    patientId: 'p2',
    doctorId: 'd1',
    date: '2026-05-06',
    time: '11:00',
    status: 'pending',
    notes: 'Electrocardiograma domiciliario',
  },
];

export const MOCK_EXAMS: MedicalExam[] = [
  {
    id: 'e1',
    patientId: 'p1',
    name: 'Hemograma completo',
    date: '2026-04-15',
    result: 'Dentro de rangos normales. Leve anemia ferropénica.',
    status: 'reviewed',
    doctorNotes: 'Iniciar suplemento de hierro por 3 meses.',
  },
  {
    id: 'e2',
    patientId: 'p1',
    name: 'Perfil lipídico',
    date: '2026-04-15',
    result: 'Colesterol LDL: 145 mg/dL (elevado). HDL: 42 mg/dL.',
    status: 'reviewed',
    doctorNotes: 'Ajustar dieta y actividad física.',
  },
  {
    id: 'e3',
    patientId: 'p1',
    name: 'Glicemia en ayunas',
    date: '2026-05-02',
    status: 'pending',
  },
  {
    id: 'e4',
    patientId: 'p2',
    name: 'Ecocardiograma',
    date: '2026-04-28',
    result: 'FEVI 50%. Leve dilatación aurícula izquierda.',
    status: 'completed',
  },
];
