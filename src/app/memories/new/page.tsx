'use client';

import MemoryForm from '@/components/MemoryForm';
import { useRouter } from 'next/navigation'; // Use next/navigation for client-side navigation

export default function NewMemoryPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate to a page that lists memories, or back to the dashboard
    // For now, let's navigate to a placeholder 'memories' page.
    router.push('/memories');
  };

  return (
    <div className="container mx-auto p-4">
      <MemoryForm onSuccess={handleSuccess} />
    </div>
  );
}
