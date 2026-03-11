'use client';

import OccasionForm from '@/components/OccasionForm';
import { useRouter } from 'next/navigation';

export default function NewOccasionPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate to a page that lists occasions
    router.push('/occasions');
  };

  return (
    <div className="container mx-auto p-4">
      <OccasionForm onSuccess={handleSuccess} />
    </div>
  );
}
