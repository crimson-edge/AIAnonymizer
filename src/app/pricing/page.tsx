import PricingUI from '@/components/PricingUI';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose Your Privacy Level
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Start with our free tier and upgrade as your needs grow. All plans include our core privacy features.
          </p>
        </div>

        <PricingUI />
      </div>
    </main>
  );
}
