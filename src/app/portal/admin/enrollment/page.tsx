'use client';

import React from 'react';
import UserManagementView from '@/components/UserManagementView';

export default function AdminUserEnrollmentPage() {
  return <UserManagementView callerRole="ADMIN" defaultTab="ENROLL" />;
}
