"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch alerts from the backend
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('https://tradingview-backend-2nd.vercel.app/api/alerts');
                setAlerts(response.data);
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000); // Refresh every second

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    return (
        <div>
            <h1>TradingView Alerts Screener</h1>
            {loading ? (
                <p>Loading...</p>
            ) : alerts.length === 0 ? (
                <p>No alerts available.</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>Price</th>
                            <th>Time</th>
                            <th>Condition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((alert, index) => (
                            <tr key={index}>
                                <td>{alert.ticker}</td>
                                <td>{alert.price}</td>
                                <td>{new Date(alert.time).toLocaleString()}</td>
                                <td>{alert.condition}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
