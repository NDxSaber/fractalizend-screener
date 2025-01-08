"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { collection, getDocs, query, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";

const getTimeframeName = (timeframe) => {
    if (timeframe === "1") return '1m';
    if (timeframe === "5") return '5m';
    if (timeframe === "15") return '15m';
    if (timeframe === "30") return '30m';
    return timeframe;
};

const isEmptyObject = (obj = {}) => Object.keys(obj).length <= 0;

const USE_STRUCTURE_SCREENER = false;

export default function Home() {
    
    // {
    //     "pairName": "{{ticker}}",
    //     "timeframe": "{{interval}}",
    //     "date": "{{time}}",
    //     "target": "candleManipulation",
    //     "isBullish": true
    //   }
    const mockData = [{"pairName":"USDJPY","timeframe":"30","date":"2025-01-07T10:49:30Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"5","date":"2025-01-07T10:49:30Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:49:35Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:49:15Z","target":"structure","isBullish":false},{"pairName":"XAUUSD","timeframe":"15S","date":"2025-01-07T10:48:45Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:55Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:48:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:48:45Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:40Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:48:30Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:48:15Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:48:15Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"15S","date":"2025-01-07T10:48:00Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:05Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:48:00Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:47:45Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:47:45Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:50Z","target":"ma","isBullish":true},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:47:45Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:35Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:47:20Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:15Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:47:05Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:46:45Z","target":"ma","isBullish":false},{"pairName":"XAUUSD","timeframe":"15S","date":"2025-01-07T10:46:45Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:46:50Z","target":"ma","isBullish":true},{"pairName":"XAUUSD","timeframe":"5S","date":"2025-01-07T10:46:25Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:46:00Z","target":"ma","isBullish":false},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:40:00Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"15S","date":"2025-01-07T10:39:30Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:38:00Z","target":"ma","isBullish":true},{"pairName":"US100","timeframe":"5S","date":"2025-01-07T10:38:50Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:37:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:37:45Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:36:45Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:36:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:35:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:35:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:33:45Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:33:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:32:15Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:32:00Z","target":"ma","isBullish":false},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:31:00Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:31:15Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:30:15Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"15S","date":"2025-01-07T10:29:30Z","target":"ma","isBullish":true},{"pairName":"USDJPY","timeframe":"1","date":"2025-01-07T10:28:00Z","target":"ma","isBullish":true}];
    const [screenerData, setScreenerData] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
                normalizedScreenerData[data.id] = {...data};
            })

            return normalizedScreenerData;
        } catch (error) {
            console.error("Error fetching data from Firebase:", error);
        }
    };

    // Create a Unique Alert list base on pairName, timeframe, target
    const createUniquenessAlert = (alerts, screenerData) => {
        const uniqueCombinations = {};
        const newScreenerData = JSON.parse(JSON.stringify(screenerData));
    
        alerts.forEach((alert) => {
            const { pairName, timeframe, target, isBullish } = alert;
            const key = `${pairName}_${timeframe}_${target}`;
    
            if (!uniqueCombinations[key]) {
                uniqueCombinations[key] = true;
    
                if (!newScreenerData[pairName]) {
                    newScreenerData[pairName] = {};
                }
                if (!newScreenerData[pairName][`tf${timeframe}`]) {
                    newScreenerData[pairName][`tf${timeframe}`] = {};
                }
                newScreenerData[pairName][`tf${timeframe}`][target] = isBullish;
            }
        });
    
        return newScreenerData;
    };

    // Update Firebase Firestore Document
    const updateFirestoreObject = async (newScreenerData, documentId) => {
        const docRef = doc(db, "pairScreener", documentId);
    
        try {
            const flatData = {};
            Object.entries(newScreenerData).forEach(([key, value]) => {
                flatData[key] = value; // Flatten nested objects if needed
            });
    
            await updateDoc(docRef, flatData);
            console.log("Document successfully updated!");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    useEffect(() => {
        const getData = async () => {
            const result = await fetchAndProcessData();
            setScreenerData(result);
        };

        getData();
        const interval = setInterval(getData(), 15000); // Refresh every 15 seconds

        return () => clearInterval(interval);
    }, [setScreenerData]);

    useEffect(() => {
        // Fetch alerts from the backend
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('https://tradingview-backend-2nd.vercel.app/api/alerts');
                let newScreenerData = {};
                // save data to firebase
                if (screenerData && response.data) {
                    newScreenerData = createUniquenessAlert(response.data, screenerData);
                    Object.entries(newScreenerData).forEach(([pair, data]) => {
                        updateFirestoreObject(data, pair);
                    })
                }                
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [screenerData]);


    const renderBar = (isBullish) => isBullish ? <span className='bullish-bar' /> : <span className='bearish-bar' />;

    // Filter processed data based on search query
    const filteredPairs = Object.keys(screenerData).filter(pair =>
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
                <p>No screener available for your search.</p>
            ) : (
                <div className="pairs">
                    {Object.entries(screenerData).map(([pair, data]) => (
                        <div className="card" key={pair}>
                            <h2 className="card-title">{pair}</h2>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Entry Status : </div>
                                <div className="">Ready</div>
                            </div>

                            <div className='divider' />

                            <div className="timeframe-screener">
                                <div className="timeframe-name">&nbsp;</div>
                                {USE_STRUCTURE_SCREENER && <div className="timeframe-value text-only">Structure</div>}
                                <div className="timeframe-value text-only">MA</div>
                                <div className="timeframe-value text-only">CanMan</div>
                            </div>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Validation : </div>
                                {USE_STRUCTURE_SCREENER && <div className="timeframe-value">{renderBar(true)}</div>}
                                <div className="timeframe-value">{renderBar(true)}</div>
                                <div className="timeframe-value last">{renderBar(false)}</div>
                            </div>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Context : </div>
                                {USE_STRUCTURE_SCREENER && <div className="timeframe-value">{renderBar(true)}</div>}
                                <div className="timeframe-value">{renderBar(true)}</div>
                                <div className="timeframe-value last">{renderBar(false)}</div>
                            </div>

                            <div className='divider' />

                            {Array.of('30S', '1', '5', '15', '30', '1H', '4H', '1D').map((timeframe) => {
                                const tfKey = `tf${timeframe}`;
                                const tfData = data[tfKey] || {}; // Safely access tfData, defaulting to an empty object

                                return (
                                    <div className="timeframe-screener" key={timeframe}>
                                        <div className="timeframe-name">{getTimeframeName(timeframe)} :</div>
                                        {USE_STRUCTURE_SCREENER && <div className="timeframe-value">{renderBar(tfData.structure)}</div>}
                                        <div className="timeframe-value">{renderBar(tfData.ma)}</div>
                                        <div className="timeframe-value last">{renderBar(tfData.candleManipulation)}</div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
