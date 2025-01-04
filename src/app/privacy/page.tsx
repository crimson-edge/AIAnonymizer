export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>At AI Anonymizer, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us when using our service. This may include:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (if you create an account)</li>
            <li>Usage data</li>
            <li>Communication preferences</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our service</li>
            <li>Improve and optimize our service</li>
            <li>Communicate with you</li>
            <li>Protect against fraud and unauthorized access</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the Internet is 100% secure.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Zero-Logs Policy</h2>
          <p>We maintain a strict zero-logs policy regarding your AI interactions. We do not store:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your AI queries</li>
            <li>Response data</li>
            <li>Usage patterns</li>
            <li>Personal identifiers related to AI interactions</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
          <p>We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
          <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@aianonymizer.com" className="text-blue-600 hover:text-blue-800">support@aianonymizer.com</a></p>
        </div>
      </main>
  );
}
