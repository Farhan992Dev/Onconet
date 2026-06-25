"use client";

import UserPanel from '@/components/UserPanel';

export default function UserPage() {
  return (
    <main className="flex-grow">
      <UserPanel onLoginStatusChange={() => {}} />
    </main>
  );
}
