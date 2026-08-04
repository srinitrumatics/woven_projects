// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <div className="text-5xl font-bold text-red-500 dark:text-red-400 mb-4">403</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 ">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 truncate" title="You don't have permission to access this resource.">
          You don't have permission to access this resource.
        </p>
        <a
          href="/home"
          className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors truncate"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}