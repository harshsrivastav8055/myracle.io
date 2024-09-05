import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  
  const [context, setContext] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // Handle context change
  const handleContextChange = (event) => {
    setContext(event.target.value);
  };

  // Handle file change
  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (files.length === 0) {
      alert('Please upload at least one screenshot.');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('context', context);
    Array.from(files).forEach((file) => formData.append('screenshots', file));

    try {
      // Make POST request with Axios
      const response = await axios.post('http://localhost:3000/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update result state with the response
      setResult(JSON.stringify(response.data.instructions, null, 2));
      setError('');
    } catch (error) {
      console.error('Error during fetch operation:', error);
      setError('Failed to get data from the server.');
      setResult('');
    }
  };

  return (
    <div className="container">
      <h1>Submit Your Data</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="context">Optional Context:</label>
        <textarea
          id="context"
          value={context}
          onChange={handleContextChange}
          placeholder="Enter any additional context here..."
        />

        <label htmlFor="screenshots">Upload Screenshots:</label>
        <input
          type="file"
          id="screenshots"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />

        <button type="submit">Submit</button>
      </form>

      <div id="result-container">
        {error ? (
          <p>{error}</p>
        ) : (
          <pre>{result || 'Result will be displayed here...'}</pre>
        )}
      </div>
    </div>
  );
};

export default App;
