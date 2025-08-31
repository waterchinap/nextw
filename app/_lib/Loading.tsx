// app/_lib/Loading.tsx

export default function Loading() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
