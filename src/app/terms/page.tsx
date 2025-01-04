export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>By accessing and using AI Anonymizer's services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
          <p>Permission is granted to temporarily access AI Anonymizer's services for personal, non-commercial transitory viewing only.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
          <p>The materials on AI Anonymizer's website and services are provided on an 'as is' basis. AI Anonymizer makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitations</h2>
          <p>In no event shall AI Anonymizer or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use AI Anonymizer's services.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Privacy</h2>
          <p>Your use of AI Anonymizer's services is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to Terms</h2>
          <p>AI Anonymizer reserves the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: <a href="mailto:support@aianonymizer.com" className="text-blue-600 hover:text-blue-800">support@aianonymizer.com</a></p>
        </div>
      </main>
  );
}
