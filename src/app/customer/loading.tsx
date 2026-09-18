import { Spinner } from '@/components/ui/Spinner';

export default function CustomerLoading() {
  return (
    <div className="flex flex-grow items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-surface-500 font-medium animate-pulse">Loading Your Dashboard...</p>
      </div>
    </div>
  );
}
