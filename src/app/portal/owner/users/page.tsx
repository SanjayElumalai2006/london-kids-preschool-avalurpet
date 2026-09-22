'use client';

import React from 'react';
import UserManagementView from '@/components/UserManagementView';

export default function OwnerUsersPage() {
  return <UserManagementView callerRole="OWNER" />;
}
