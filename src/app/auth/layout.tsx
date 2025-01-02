export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-white">
          AI Anonymizer
        </h1>
        <h2 className="mt-6 text-center text-xl text-gray-300">
          Secure & Private AI Interactions
        </h2>
      </div>
      {children}
    </div>
  );
}
