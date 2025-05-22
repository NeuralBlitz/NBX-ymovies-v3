// API Test Page 
import React, { useState, useEffect } from 'react';

export default function ApiTest() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'bearer' | 'param'>('bearer');
  const [manualApiKey, setManualApiKey] = useState('');
  // Get API keys from all possible sources
  const tmdbApiKey = 
    import.meta.env.VITE_TMDB_API_KEY || 
    (window as any).TMDB_API_KEY || 
    (window as any).ENV?.TMDB_API_KEY || 
    '';
  
  const tmdbApiKeyV3 = 
    import.meta.env.VITE_TMDB_API_KEY_V3 || 
    (window as any).TMDB_API_KEY_V3 || 
    (window as any).ENV?.TMDB_API_KEY_V3 || 
    '';
  
  // Debug information for all environment variables
  const allEnvVars: Record<string, string> = {};
  // Loop through all environment variables
  Object.keys(import.meta.env).forEach(key => {
    const value = import.meta.env[key];
    if (typeof value === 'string') {
      allEnvVars[key] = key.includes('KEY') || key.includes('TOKEN') || key.includes('SECRET') 
        ? `${value.substring(0, 6)}...` 
        : value;
    } else {
      allEnvVars[key] = String(value);
    }
  });
  // Function to test the API with optional manual key
  async function testApi(manualKey = '') {
    setLoading(true);
    setError(null);
    try {
      let url = 'https://api.themoviedb.org/3/trending/movie/week';
      let options: RequestInit = {};
      
      // Determine which key to use
      const keyToUse = manualKey || (method === 'bearer' ? tmdbApiKey : tmdbApiKeyV3);
      
      if (method === 'bearer') {
        // Using Bearer token authentication
        options = {
          headers: {
            'Authorization': `Bearer ${keyToUse}`,
            'Content-Type': 'application/json'
          }
        };
      } else {
        // Using api_key parameter
        url += `?api_key=${keyToUse}`;
      }
      
      console.log(`Testing API with ${method} method`, url);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err: unknown) {
      console.error("API Test Error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }
  
  // Run the API test when method or API keys change
  useEffect(() => {
    testApi();
  }, [method, tmdbApiKey, tmdbApiKeyV3]);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">TMDB API Test Page</h1>
      
      <div className="bg-amber-500/20 border border-amber-200 p-4 mb-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-1">API Connection Troubleshooting</h2>
        <p className="text-sm mb-2">This page tests your TMDB API connection to help diagnose issues.</p>
        <div className="flex gap-2 mt-3">
          <a href="/" className="px-4 py-2 bg-blue-600 rounded text-white text-sm">Return to Home</a>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gray-600 rounded text-white text-sm"
          >
            Reload Test
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">API Key Information</h2>
        <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
          <p><strong>JWT Token:</strong> {tmdbApiKey ? `${tmdbApiKey.substring(0,10)}...` : 'Not found'}</p>
          <p><strong>API Key:</strong> {tmdbApiKeyV3 ? `${tmdbApiKeyV3.substring(0,10)}...` : 'Not found'}</p>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-sm text-gray-400">API key sources:</p>
            <ul className="text-xs text-gray-500 mt-1 space-y-1">
              <li>import.meta.env: {import.meta.env.VITE_TMDB_API_KEY ? '✅' : '❌'}</li>
              <li>window.TMDB_API_KEY: {(window as any).TMDB_API_KEY ? '✅' : '❌'}</li>
              <li>window.ENV: {(window as any).ENV?.TMDB_API_KEY ? '✅' : '❌'}</li>
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="text-md font-medium mb-2">Manual API Key Input</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="bg-gray-900 px-3 py-2 rounded flex-grow"
                placeholder="Enter your TMDB API key manually..."
                value={manualApiKey}
                onChange={(e) => setManualApiKey(e.target.value)}
              />
              <button 
                className="px-3 py-2 bg-blue-600 rounded" 
                onClick={() => testApi(manualApiKey)}
              >
                Test
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Use this if your environment variables aren't loading properly
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-800 p-4 rounded-lg overflow-auto text-xs">
          <pre>{JSON.stringify(allEnvVars, null, 2)}</pre>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Authentication Method</h2>
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded ${method === 'bearer' ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => setMethod('bearer')}
          >
            Bearer Token
          </button>
          <button 
            className={`px-4 py-2 rounded ${method === 'param' ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => setMethod('param')}
          >
            API Key Parameter
          </button>
        </div>
      </div>
        <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Guide</h2>
        <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
          <p>If you're seeing API errors, try the following steps:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Check that your API keys are correct in the .env file</li>
            <li>Make sure the Vite development server has been restarted after changing .env</li>
            <li>Try the JWT token first, then the API key parameter method</li>
            <li>Check the browser console for additional error messages</li>
            <li>Try the manual input method with your API key</li>
          </ol>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">API Response</h2>
        
        {loading && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-600 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <p className="mt-3">Loading API data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg">
            <h3 className="text-red-400 font-semibold">Error</h3>
            <p className="mb-2">{error}</p>
            
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-amber-400">Troubleshooting Tips</summary>
              <div className="mt-2 pl-4 border-l-2 border-amber-700">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check that your TMDB API key is valid and active</li>
                  <li>Verify that you're using the correct authentication method for your key</li>
                  <li>JWT tokens start with "ey" and should use Bearer authentication</li>
                  <li>API v3 keys are alphanumeric and should use the api_key parameter</li>
                  <li>Check your network connection and CORS settings</li>
                </ul>
              </div>
            </details>
          </div>
        )}
        
        {apiResponse && (
          <div className="bg-green-900/30 border border-green-500 p-4 rounded-lg">
            <h3 className="text-green-400 font-semibold mb-2">Success! ✅</h3>
            <p className="mb-2">Found {apiResponse.results?.length || 0} trending movies</p>
            
            {apiResponse.results?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Sample Movie:</h4>
                <div className="bg-gray-800 p-3 rounded flex items-start gap-4">
                  {apiResponse.results[0].poster_path && (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${apiResponse.results[0].poster_path}`}
                      alt={apiResponse.results[0].title}
                      className="rounded"
                    />
                  )}
                  <div>
                    <p><strong>Title:</strong> {apiResponse.results[0].title}</p>
                    <p><strong>ID:</strong> {apiResponse.results[0].id}</p>
                    <p><strong>Overview:</strong> {apiResponse.results[0].overview.substring(0, 100)}...</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded">
                  <p className="text-green-300">✅ API is working correctly. You should now see real movie data in your app!</p>
                </div>
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-400">View raw JSON</summary>
              <pre className="bg-black p-2 rounded mt-2 text-xs overflow-auto max-h-80">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
} 