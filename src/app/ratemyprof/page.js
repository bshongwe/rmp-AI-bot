"use client";
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
    const [url, setUrl] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log("submitting url")
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            console.log(response)
            const result = await response.json();
            console.log('Response received:', result);
            setData(result);
        } catch (err) {
            console.error('Error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data) {
            console.log('Data state updated:', data);
        }
    }, [data]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 to-black text-white">
            <div className="w-full max-w-lg p-8 bg-gray-900 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center">Professor Review Scraper</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="url" className="block text-lg font-medium mb-2">Enter Professor URL:</label>
                        <input
                            type="text"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.ratemyprofessors.com/professor/286017"
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md"
                    >
                        {loading ? 'Loading...' : 'Fetch Data'}
                    </button>
                </form>

                {error && <p className="mt-4 text-red-400">{error}</p>}

                {data && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold mb-2">Professor Information</h2>
                        <p className="text-lg mb-1"><strong>Name:</strong> {data.professorName}</p>
                        <p className="text-lg mb-4"><strong>Overall Rating:</strong> {data.overallRating}</p>
                        <h3 className="text-xl font-medium mb-2">Summary:</h3>
                        <div className="prose prose-invert">
                            <ReactMarkdown>{data.summary}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
