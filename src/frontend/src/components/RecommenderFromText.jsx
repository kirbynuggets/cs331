import React, { useState } from 'react';

const RecommenderFromText = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // Add user message to chat history
    const newChatHistory = [...chatHistory, { type: 'user', message: query }];
    setChatHistory(newChatHistory);
    
    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `query=${encodeURIComponent(query)}`
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setChatHistory([...newChatHistory, { type: 'bot', message: `Error: ${data.error}` }]);
      } else if (data.images && data.images.length > 0) {
        setImages(data.images);
        setChatHistory([...newChatHistory, { 
          type: 'bot', 
          message: 'Here are some recommendations based on your search:',
          images: data.images
        }]);
      } else {
        setImages([]);
        setChatHistory([...newChatHistory, { type: 'bot', message: 'No results found for your query.' }]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while fetching results.');
      setChatHistory([...newChatHistory, { type: 'bot', message: 'An error occurred while fetching results.' }]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 shadow">
        <div className="max-w-4xl mx-auto flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Westside Image Recommender</h1>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden max-w-4xl mx-auto w-full flex flex-col">
        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Ask me to find some images for you!</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div 
                key={index} 
                className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 p-3 rounded-lg ${
                    chat.type === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 shadow rounded-bl-none'
                  }`}
                >
                  <p>{chat.message}</p>
                  
                  {chat.images && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {chat.images.map((image, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <div className="overflow-hidden rounded-lg bg-gray-100 border">
                            <img 
                              src={image.image} 
                              alt={`Image ID: ${image.id}`}
                              className="w-full h-32 object-cover transform transition duration-200 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg">
                            Similarity: {(1 - image.distance).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-lg shadow rounded-bl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for images..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={performSearch}
              disabled={loading || !query.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecommenderFromText;