import React, { createContext, useContext, useState } from 'react';
import {
  Patient, Doctor, Appointment, MedicalExam,
  MOCK_PATIENTS, MOCK_DOCTORS, MOCK_APPOINTMENTS, MOCK_EXAMS,
} from './appStore';

export interface ClinicalNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  text: string;
  date: string;
  attachmentName?: string;
  attachmentUri?: string;
}

let _uid = 100;
const uid = () => String(++_uid);

interface AppDataContextValue {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  exams: MedicalExam[];
  notes: ClinicalNote[];
  addPatient: (data: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addDoctor: (data: Omit<Doctor, 'id' | 'location' | 'assignedPatients' | 'visitStatus'>) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  assignPatient: (doctorId: string, patientId: string) => void;
  unassignPatient: (doctorId: string, patientId: string) => void;
  addNote: (note: Omit<ClinicalNote, 'id'>) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [exams] = useState<MedicalExam[]>(MOCK_EXAMS);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);

  const addPatient = (data: Omit<Patient, 'id'>) =>
    setPatients(prev => [...prev, { ...data, id: uid() }]);

  const updatePatient = (id: string, data: Partial<Patient>) =>
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setDoctors(prev => prev.map(d => ({
      ...d,
      assignedPatients: d.assignedPatients.filter(pid => pid !== id),
    })));
  };

  const addDoctor = (data: Omit<Doctor, 'id' | 'location' | 'assignedPatients' | 'visitStatus'>) =>
    setDoctors(prev => [...prev, {
      ...data,
      id: uid(),
      location: { latitude: -33.44 + (Math.random() - 0.5) * 0.1, longitude: -70.6 + (Math.random() - 0.5) * 0.1 },
      assignedPatients: [],
      visitStatus: 'available',
    }]);

  const updateDoctor = (id: string, data: Partial<Doctor>) =>
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));

  const deleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
    setPatients(prev => prev.map(p => p.assignedDoctorId === id ? { ...p, assignedDoctorId: undefined } : p));
  };

  const assignPatient = (doctorId: string, patientId: string) => {
    setDoctors(prev => prev.map(d =>
      d.id === doctorId && !d.assignedPatients.includes(patientId)
        ? { ...d, assignedPatients: [...d.assignedPatients, patientId] }
        : d
    ));
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, assignedDoctorId: doctorId } : p
    ));
  };

  const unassignPatient = (doctorId: string, patientId: string) => {
    setDoctors(prev => prev.map(d =>
      d.id === doctorId
        ? { ...d, assignedPatients: d.assignedPatients.filter(pid => pid !== patientId) }
        : d
    ));
    setPatients(prev => prev.map(p =>
      p.id === patientId && p.assignedDoctorId === doctorId ? { ...p, assignedDoctorId: undefined } : p
    ));
  };

  const addNote = (note: Omit<ClinicalNote, 'id'>) =>
    setNotes(prev => [{ ...note, id: uid() }, ...prev]);

  return (
    <AppDataContext.Provider value={{
      patients, doctors, appointments, exams, notes,
      addPatient, updatePatient, deletePatient,
      addDoctor, updateDoctor, deleteDoctor,
      assignPatient, unassignPatient, addNote,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
