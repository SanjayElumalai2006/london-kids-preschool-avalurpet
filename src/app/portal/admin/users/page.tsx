'use client';

import React from 'react';
import UserManagementView from '@/components/UserManagementView';

export default function AdminUsersPage() {
  return <UserManagementView callerRole="ADMIN" />;
}
