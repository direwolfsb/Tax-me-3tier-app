import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importing CSS for styling


const API_URL = process.env.REACT_APP_BACKEND_URL|| 'http://localhost:3500/api/taxes';

function App() {
  const [income, setIncome] = useState('');
  const [tax, setTax] = useState(null);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [isFetching, setIsFetching] = useState(true); // Loading state for fetching records

  // Fetch tax records from the server
  const fetchRecords = async () => {
    setIsFetching(true); // Start fetching
    try {
      const response = await axios.get(API_URL);
      setRecords(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching records.');
      console.error('Error fetching records:', err);
    } finally {
      setIsFetching(false); // Stop fetching
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []); // Empty dependency array means this effect runs only once

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post(API_URL, { income: parseFloat(income) });
      if (response && response.data) {
        setTax(response.data.tax);
        setError('');
        fetchRecords(); // Re-fetch records after a new record is added
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error or server is unreachable.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle record deletion with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchRecords(); // Re-fetch records after deletion
        setError('');
      } catch (err) {
        setError('Error deleting record.');
        console.error('Error deleting record:', err);
      }
    }
  };

  return (
    <div className="container">
      <h1>Income Tax Calculator</h1>

      {/* Form for inputting income and calculating tax */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Enter your income"
          className="input"
          required
        />
        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? 'Calculating...' : 'Calculate & Save Tax'}
        </button>
      </form>

      {/* Display calculated tax */}
      {tax !== null && <h2>Your Tax: ${tax.toFixed(2)}</h2>}
      {error && <p className="error">{error}</p>}

      <h3>Saved Tax Records</h3>

      {/* Show loading state for records fetching */}
      {isFetching ? (
        <p>Loading records...</p>
      ) : (
        <ul className="records">
          {records.length > 0 ? (
            records.map((record) => (
              <li key={record._id}>
                Income: ${record.income}, Tax: ${record.tax.toFixed(2)}
                <button
                  onClick={() => handleDelete(record._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p>No records found.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default App;
