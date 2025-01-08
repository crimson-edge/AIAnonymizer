'use client';

import { useState } from 'react';

export default function TestPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnonymize = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/anonymize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          // Hardcoded test values
          userId: 'test-user',
          tier: 'FREE'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error);
        return;
      }

      setResult(data.result);
    } catch (err) {
      setError('Failed to anonymize text');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Anonymizer</h1>
      
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to anonymize..."
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        onClick={handleAnonymize}
        disabled={loading || !text}
      >
        {loading ? 'Processing...' : 'Anonymize'}
      </button>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Result:</h2>
          <div className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}