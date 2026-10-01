import { api } from "./client";
import type { LoginResponse } from "../types/auth";

export async function signIn(email: string, password: string) {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

export async function getInstituteDashboard() {
  return (await api.get("/institute/dashboard")).data.data;
}

export async function getInstituteStudents() {
  return (await api.get("/institute/students")).data.data;
}

export async function getInstituteTests() {
  return (await api.get("/tests/manage")).data.data;
}

export async function getMyTests() {
  return (await api.get("/tests/my")).data.data;
}

export async function getMyAttendance() {
  return (await api.get("/attendance/student/me")).data.data;
}

export async function getAttendanceSessions() {
  return (await api.get("/attendance/sessions")).data.data;
}

export async function getMyFees() {
  return (await api.get("/fees/my")).data.data;
}

export async function getPendingFees() {
  return (await api.get("/fees/pending")).data.data;
}

export async function getParentAttendance() {
  return (await api.get("/attendance/parents/children")).data.data;
}

export async function getSuperAdminDashboard() {
  return (await api.get("/super-admin/dashboard")).data.data;
}

export async function getInstitutes() {
  return (await api.get("/super-admin/institutes")).data.data;
}

export async function getPlans() {
  return (await api.get("/super-admin/plans")).data.data;
}
