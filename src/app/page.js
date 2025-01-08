"use client";

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { collection, getDoc, doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebase";

const getTimeframeName = (timeframe) => {
    if (timeframe === "1") return '1m';
    if (timeframe === "5") return '5m';
    if (timeframe === "15") return '15m';
    if (timeframe === "30") return '30m';
    return timeframe;
};

const parseToBoolean = (value) => {
    // Check if the value is already a boolean
    if (typeof value === 'boolean') {
        return value;
    }
    
    // If it's a string, check for 'false' (case insensitive)
    if (typeof value === 'string') {
        return value.toLowerCase() !== 'false';
    }
    
    // For all other types, use standard truthy/falsy conversion
    return Boolean(value);
}


const USE_STRUCTURE_SCREENER = false;

export default function Home() {
    const counter = useRef(0);
    // {
    //     "pairName": "{{ticker}}",
    //     "timeframe": "{{interval}}",
    //     "date": "{{time}}",
    //     "target": "candleManipulation",
    //     "isBullish": true
    //   }
    const [screenerData, setScreenerData] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
                newScreenerData[pairName][`tf${timeframe}`][target] = parseToBoolean(isBullish);
            }
        });
    
        return newScreenerData;
    };

    // Update Firebase Firestore Document
    const updateFirestoreObject = async (newScreenerData, documentId) => {
        const docRef = doc(db, "pairScreener", documentId);

        try {
            // Check if the document exists
            const existingDoc = await getDoc(docRef);

            if (existingDoc.exists()) {
                const existingData = existingDoc.data();

                // Check if newScreenerData is different
                const isDataChanged = JSON.stringify(newScreenerData) !== JSON.stringify(existingData);

                if (!isDataChanged) {
                    console.log(`Document ${documentId} is up-to-date, no update needed.`);
                    return;
                }

                // Update document if data is different
                await updateDoc(docRef, newScreenerData);
                console.log(`Document ${documentId} successfully updated!`);
            } else {
                // Create new document if it doesn't exist
                await setDoc(docRef, newScreenerData);
                console.log(`New document ${documentId} successfully created!`);
            }
        } catch (error) {
            console.error(`Error updating or creating document ${documentId}:`, error);
        }
    };


    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "pairScreener"), (snapshot) => {
            const screenerData = {};
            snapshot.forEach((doc) => {
                screenerData[doc.id] = { id: doc.id, ...doc.data() };
            });
            setScreenerData(screenerData);
            console.error("Fetching again succeed", screenerData);

        }, (error) => {
            console.error("Error fetching live data from Firestore:", error);
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('https://tradingview-backend-2nd.vercel.app/api/alerts');
                let newScreenerData = {};
                if (screenerData && response.data) {
                    newScreenerData = createUniquenessAlert(response.data, screenerData);
                    Object.entries(newScreenerData).forEach(([pair, data]) => {
                        updateFirestoreObject(data, pair);
                    });
                }
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAlerts();
        const interval = setInterval(() => {
            counter.current = counter.current + 1
            console.log('>>>> counter', counter);
            if (counter.current > 6) {
                window.location.reload();
            }
            fetchAlerts();
          }, 10000);
    
        return () => clearInterval(interval);
    }, [screenerData]);

    const renderBar = (isBullish, isDisabled = false) => isDisabled ? <span className='gray-bar' /> : isBullish ? <span className='bullish-bar' /> : <span className='bearish-bar' />;

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
                    {filteredPairs.map((pair) => (
                        <div className="card" key={pair}>
                            <h2 className="card-title">{pair}</h2>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Entry Status : </div>
                                <div className="">-</div>
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
                                {USE_STRUCTURE_SCREENER && <div className="timeframe-value">{renderBar(true, true)}</div>}
                                <div className="timeframe-value">{renderBar(true, true)}</div>
                                <div className="timeframe-value last">{renderBar(false, true)}</div>
                            </div>
                            <div className="timeframe-screener">
                                <div className="timeframe-name">Context : </div>
                                {USE_STRUCTURE_SCREENER && <div className="timeframe-value">{renderBar(true, true)}</div>}
                                <div className="timeframe-value">{renderBar(true, true)}</div>
                                <div className="timeframe-value last">{renderBar(false, true)}</div>
                            </div>

                            <div className='divider' />

                            {Array.of('30S', '1', '5', '15', '30', '1H', '4H', '1D', '1W', '1M').map((timeframe) => {
                                if (
                                    (pair === 'USDIDR' || pair === 'BBRI' || pair === 'DOGEUSDT')
                                    && (timeframe === '30S' || timeframe === '1' || timeframe === '5' || timeframe === '15' || timeframe === '30' || timeframe === '1H' || timeframe === '4H')
                                )
                                    return;
                                const tfKey = `tf${timeframe}`;
                                const tfData = screenerData[pair][tfKey] || {}; // Safely access tfData, defaulting to an empty object

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
