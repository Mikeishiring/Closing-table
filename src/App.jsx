/**
 * Main App Component
 * Hash-based routing between Company, Candidate, and Result views
 */

import React from 'react';
import { useHashRoute } from './hooks';
import { SignatureSlider } from './components/SignatureSlider';
import { AnimatedSubmitButton } from './components/AnimatedSubmitButton';

function App() {
  const route = useHashRoute();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          The Closing Table
        </h1>

        {route.type === 'result' ? (
          <ResultViewPlaceholder resultId={route.id} />
        ) : route.type === 'offer' ? (
          <CandidateViewPlaceholder offerId={route.id} />
        ) : (
          <CompanyViewPlaceholder />
        )}
      </div>
    </div>
  );
}

// Placeholder components to demonstrate structure
function CompanyViewPlaceholder() {
  const [value, setValue] = React.useState(100000);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Company View</h2>
      <p className="text-gray-600 mb-4">
        Set your maximum offer. This demonstrates the refactored slider with perfect centering.
      </p>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Total Compensation
        </label>
        <div className="text-3xl font-bold mb-4">
          ${value.toLocaleString()}
        </div>
        <SignatureSlider
          value={value}
          min={50000}
          max={300000}
          step={5000}
          onChange={(e) => setValue(e.target.value)}
          variant="company"
          label="Company maximum offer"
        />
      </div>

      <AnimatedSubmitButton
        onClick={() => alert('This would generate a link!')}
        buttonText="Lock it in & Get Link"
      />

      <div className="mt-6 text-sm text-gray-500">
        <p>✅ Slider thumb now perfectly centered at all positions</p>
        <p>✅ Coordinate system fix applied (thumb inside track)</p>
        <p>✅ Reusable components with clean separation</p>
        <p>✅ Custom hooks for state management</p>
      </div>
    </div>
  );
}

function CandidateViewPlaceholder({ offerId }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Candidate View</h2>
      <p className="text-gray-600">
        Viewing offer: <code className="bg-gray-100 px-2 py-1 rounded">{offerId}</code>
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Full candidate view to be implemented using extracted views
      </p>
    </div>
  );
}

function ResultViewPlaceholder({ resultId }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Result View</h2>
      <p className="text-gray-600">
        Viewing result: <code className="bg-gray-100 px-2 py-1 rounded">{resultId}</code>
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Full result view to be implemented using extracted views
      </p>
    </div>
  );
}

export default App;

