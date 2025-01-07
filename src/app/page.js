"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "./firebase/firebase";

const getTimeframeName = (timeframe) => {
    if (timeframe === "1") return '1m';
    if (timeframe === "5") return '5m';
    if (timeframe === "15") return '15m';
    if (timeframe === "30") return '30m';
    return timeframe;
};

export default function Home() {
    const mockData = [{"pairName":"USDJPY","timeframe":"30","date":"2025-01-07T10:49:30Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"5","date":"2025-01-07T10:49:30Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:49:35Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:49:15Z","target":"structure","isBullish":false},{"pairName":"XAUUSD","timeframe":"15S","date":"2025-01-07T10:48:45Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:55Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:48:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:48:45Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:40Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:48:15Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:48:15Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"15S","date":"2025-01-07T10:48:00Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:05Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:00Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:47:45Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:47:45Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:50Z","target":"ma","isBullish":true},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:47:45Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:35Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:47:20Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:15Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:05Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:46:45Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"15S","date":"2025-01-07T10:46:45Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:46:50Z","target":"ma","isBullish":true},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:46:25Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:46:00Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:40:00Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:39:30Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:38:00Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:38:50Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:37:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:37:45Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:36:45Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:36:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:35:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:35:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:33:45Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:33:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:32:15Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:32:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:31:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:31:15Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:30:15Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:29:30Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:28:00Z","target":"ma","isBullish":true}];
    const [screenerData, setScreenerData] = useState({});
    const [alerts, setAlerts] = useState(mockData);
    const [processedData, setProcessedData] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    const fetchAndProcessData = async () => {
        try {
            // Get Data from Firebase
            const q = query(collection(db, "pairScreener"));
            const querySnapshot = await getDocs(q);
            const screenerData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Normalizing
            const normalizedScreenerData = {};
            screenerData.forEach((data) => {
                normalizedScreenerData[data.name] = {...data.timeframe};
            })

            return normalizedScreenerData;
        } catch (error) {
            console.error("Error fetching data from Firebase:", error);
        }
    };

    // Create a Unique Alert list base on pairName, timeframe, target
    const filterAndTransformAlerts = (alerts) => {
        const uniqueCombinations = {};
        const filteredArray = [];
    
        alerts.forEach((alert) => {
            const { pairName, timeframe, target } = alert;
    
            // Create a unique key for each combination of pairName, timeframe, and target
            const key = `${pairName}_${timeframe}_${target}`;
    
            // If the combination doesn't exist in the result, add it
            if (!uniqueCombinations[key]) {
                uniqueCombinations[key] = true;
                filteredArray.push({

                });
            }
        });
    
        return filteredArray;
    };

    useEffect(() => {
        const getData = async () => {
            const result = await fetchAndProcessData();
            setScreenerData(result);
        };

        getData();
    }, [setScreenerData]);

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

        const aaa = filterAndTransformAlerts(alerts);
        processAlerts(aaa);
        // fetchAlerts();
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
                            <div className="timeframe-screener">
                                <div className="timeframe-name">&nbsp;</div>
                                <div className="timeframe-value text-only">Structure</div>
                                <div className="timeframe-value text-only">MA</div>
                                <div className="timeframe-value text-only">CanMan</div>
                            </div>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Validation : </div>
                                <div className="timeframe-value">{renderBar(true)}</div>
                                <div className="timeframe-value last">{renderBar(false)}</div>
                            </div>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Context : </div>
                                <div className="timeframe-value">{renderBar(true)}</div>
                                <div className="timeframe-value last">{renderBar(false)}</div>
                            </div>
                            <div className='divider' />

                            {screenerData.USDJPY && Array.of('1', '5', '15', '30', '1H', '4H', '1D').map((timeframe) => (
                                <div className="timeframe-screener" key={timeframe.toString()}>
                                    <div className="timeframe-name">{getTimeframeName(timeframe)} :</div>
                                    <div className="timeframe-value">{renderBar(screenerData.USDJPY[`tf${timeframe}`].structure)}</div>
                                    <div className="timeframe-value">{renderBar(screenerData.USDJPY[`tf${timeframe}`].ma)}</div>
                                    <div className="timeframe-value last">{renderBar(screenerData.USDJPY[`tf${timeframe}`].candleManipulation)}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
