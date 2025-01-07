"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [alerts, setAlerts] = useState([]);
    const [processedData, setProcessedData] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    useEffect(() => {
        // Fetch alerts from the backend
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('https://tradingview-backend-2nd.vercel.app/api/alerts');
                setAlerts(response.data);
                processAlerts(response.data); // Process the data for display
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    // Function to process alerts
    const processAlerts = (alertData) => {
        const organizedData = {};

        alertData.forEach(alert => {
            const { pairName, timeframe, isBullish, date } = alert;

            // Initialize pair object if not exists
            if (!organizedData[pairName]) {
                organizedData[pairName] = {};
            }

            // Initialize timeframe array if not exists
            if (!organizedData[pairName][timeframe]) {
                organizedData[pairName][timeframe] = [];
            }

            // Add alert to the respective timeframe
            organizedData[pairName][timeframe].push({ isBullish, date });
        });

        // Sort alerts by date in descending order (newest first)
        Object.keys(organizedData).forEach(pair => {
            Object.keys(organizedData[pair]).forEach(timeframe => {
                organizedData[pair][timeframe].sort((a, b) => new Date(b.date) - new Date(a.date));
            });
        });

        setProcessedData(organizedData);
    };

    const renderBar = (isBullish) => isBullish ? <span className='bullish-bar' /> : <span className='bearish-bar' />;

    // Filter processed data based on search query
    const filteredPairs = Object.keys(processedData).filter(pair =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='content'>
            <h1 className='title'>FractalizeND Screener</h1>

            {/* Search Bar */}
            <div className='search-container'>
                <input
                    className="search-field"
                    type='text'
                    placeholder='Search pairs...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='search-bar'
                />
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filteredPairs.length === 0 ? (
                <p>No alerts available for your search.</p>
            ) : (
                <div className="pairs">
                    {filteredPairs.map(pair => (
                        <div className="card" key={pair}>
                            <h2 className="card-title">{pair}</h2>
                            {Object.keys(processedData[pair]).map(timeframe => (
                                <div className="timeframe-screener" key={timeframe}>
                                    <div className="timeframe-name">{timeframe}: </div>
                                    <div className="timeframe-value">
                                        {renderBar(processedData[pair][timeframe][0].isBullish)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
