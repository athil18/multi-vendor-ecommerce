import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex flex-grow items-center justify-center min-h-[75vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-surface-500 font-medium animate-pulse">Loading experience...</p>
      </div>
    </div>
  );
}
