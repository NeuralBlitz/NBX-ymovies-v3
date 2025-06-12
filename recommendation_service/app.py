from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# TMDB API configuration
TMDB_API_KEY = os.getenv('TMDB_API_KEY', '32c9dd8c0f9c57b5a40cefb94b2ea9ea')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Recommendation service is running"})

@app.route('/recommendations/personalized', methods=['POST'])
def get_personalized_recommendations():
    """Get personalized recommendations"""
    try:
        data = request.get_json() or {}
        
        # Get popular movies as basic recommendations
        url = f"{TMDB_BASE_URL}/movie/popular"
        params = {'api_key': TMDB_API_KEY, 'page': 1}
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            movies = response.json().get('results', [])[:10]
            
            recommendations = []
            for movie in movies:
                recommendations.append({
                    'id': movie['id'],
                    'title': movie['title'],
                    'overview': movie.get('overview', ''),
                    'poster_path': movie.get('poster_path'),
                    'release_date': movie.get('release_date', ''),
                    'vote_average': movie.get('vote_average', 0),
                    'reason': 'Popular recommendation'
                })
            
            return jsonify({
                'recommendation_categories': [{
                    'category': 'Recommended for You',
                    'movies': recommendations
                }],
                'recommendation_count': len(recommendations)
            })
        
        return jsonify({'error': 'Failed to fetch recommendations'}), 500
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting recommendation service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
