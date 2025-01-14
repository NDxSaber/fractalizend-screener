"use client";

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { collection, getDoc, doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebase";

const getTimeframeName = (timeframe) => {
    '1', '5', '15', '30', '60', '240', 'D', 'W', 'M'
    if (timeframe === "1") return '1m';
    if (timeframe === "5") return '5m';
    if (timeframe === "15") return '15m';
    if (timeframe === "30") return '30m';
    if (timeframe === "60") return '1H';
    if (timeframe === "240") return '4H';
    if (timeframe === "D") return '1D';
    if (timeframe === "W") return '1W';
    if (timeframe === "M") return '1M';
    return timeframe;
};

const getQueryStringValue = (key) => {
    if (typeof location !== 'undefined' && location.search) {
        return new URLSearchParams(location.search).get(key) ?? '';
    }
    return '';  // Return empty string if location is not available
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

const swingPair = ['DOGEUSDT'];


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
    const [searchQuery, setSearchQuery] = useState(getQueryStringValue("search"));
    const [isSwingOn, setIsSwingOn] = useState(getQueryStringValue("swing") === "1" ? true : false);

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

    const updateQueryString = (key, value) => {
        const url = new URL(window.location.href);
    
        if (value) {
            // Add or update the query parameter
            url.searchParams.set(key, value);
        } else {
            // Remove the query parameter if value is empty
            url.searchParams.delete(key);
        }
    
        // Update the URL without reloading the page
        window.history.replaceState({}, '', url);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        updateQueryString('search', value);
    };

    const handleSwingToggle = () => {
        const newValue = !isSwingOn;
        setIsSwingOn(newValue);
        updateQueryString('swing', newValue ? '1' : '0');
    };


    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "pairScreener"), (snapshot) => {
            const screenerData = {};
            snapshot.forEach((doc) => {
                screenerData[doc.id] = { id: doc.id, ...doc.data() };
            });
            setScreenerData(screenerData);
            console.log("Fetching again succeed", screenerData);

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
                        let newData = {...data};
                        Object.entries(data).forEach(([timeframeKey, modelObj]) => {
                            if (timeframeKey !== 'id') {
                                Object.entries(modelObj).forEach(([target, value]) => {
                                    // if (target === 'candleManipulation' && newData[timeframeKey][target] === value) {
                                    //     newData[timeframeKey][totalCandleManipulation] += 1;
                                    // }
                                    newData[timeframeKey][target] = value
                                });
                            }
                        });
                        console.log('>>>> newData', newData);
                        updateFirestoreObject(newData, pair);
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

    const renderBar = (isBullish, isDisabled = false, counter = 0) => isDisabled ? <span className='gray-bar' /> : isBullish ? <span className='bullish-bar'>{counter > 0 ? counter : ''}</span> : <span className='bearish-bar'>{counter > 0 ? counter : ''}</span>;

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
                    onChange={handleSearchChange}
                    className='search-bar'
                />
                <div className="switcher">
                    <label className="switch">
                        <input type="checkbox" checked={isSwingOn} onClick={handleSwingToggle} />
                        <span className="slider round"></span>
                    </label>
                    Swing is {isSwingOn ? 'ON' : 'OFF'}
                </div>
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
                                <div className="timeframe-name">&nbsp;</div>
                                <div className="timeframe-value text-only">Structure</div>
                                <div className="timeframe-value med text-only">MA</div>
                                <div className="timeframe-value low text-only">Can</div>
                            </div>
                            {!isSwingOn && !swingPair.includes(pair) && (
                                <>
                                    <div className="timeframe-screener">
                                        <div className="timeframe-name">Val : </div>
                                        <div className="timeframe-value">{renderBar(true, true)}</div>
                                        <div className="timeframe-value med">{renderBar(true, true)}</div>
                                        <div className="timeframe-value low last">{renderBar(false, true)}</div>
                                    </div>
                                    <div className="timeframe-screener">
                                        <div className="timeframe-name">Con : </div>
                                        <div className="timeframe-value">{renderBar(true, true)}</div>
                                        <div className="timeframe-value med">{renderBar(true, true)}</div>
                                        <div className="timeframe-value low last">{renderBar(false, true)}</div>
                                    </div>
                                    <div className='divider' />
                                </>
                            )}


                            {Array.of('30S', '1', '5', '15', '30', '60', '240', 'D', 'W', 'M').map((timeframe) => {
                                if (
                                    (isSwingOn || swingPair.includes(pair))
                                    && (timeframe === '30S' || timeframe === '1' || timeframe === '5' || timeframe === '15' || timeframe === '30' || timeframe === '60' || timeframe === '240')
                                )
                                    return;
                                
                                const tfKey = `tf${timeframe}`;
                                const tfData = screenerData[pair][tfKey] || {}; // Safely access tfData, defaulting to an empty object

                                return (
                                    <div className="timeframe-screener" key={timeframe}>
                                        <div className="timeframe-name">{getTimeframeName(timeframe)} :</div>
                                        <div className="timeframe-value">{!Array.of('30S', '1', '5').includes(timeframe) ? renderBar(tfData.structure) : ' '}</div>
                                        <div className="timeframe-value med">{renderBar(tfData.ma)}</div>
                                        <div className="timeframe-value low last">{renderBar(tfData.candleManipulation, false, tfData.totalCandleManipulation)}</div>
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
