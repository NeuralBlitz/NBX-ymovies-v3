from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import time
from typing import List, Dict, Any, Tuple

app = Flask(__name__)
CORS(app)

# TMDB API configuration
TMDB_API_KEY = os.getenv('TMDB_API_KEY', '32c9dd8c0f9c57b5a40cefb94b2ea9ea')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

# Simple in-memory cache (process-local)
_CACHE: Dict[str, Tuple[float, Any]] = {}
_CACHE_TTL = 60.0  # seconds

def _cache_get(key: str):
    now = time.time()
    v = _CACHE.get(key)
    if not v:
        return None
    ts, data = v
    if now - ts < _CACHE_TTL:
        return data
    _CACHE.pop(key, None)
    return None

def _cache_set(key: str, data: Any):
    _CACHE[key] = (time.time(), data)

def _headers_and_params():
    headers = {}
    params = {}
    if TMDB_API_KEY and TMDB_API_KEY.startswith('ey'):
        headers['Authorization'] = f'Bearer {TMDB_API_KEY}'
        headers['Content-Type'] = 'application/json'
    else:
        params['api_key'] = TMDB_API_KEY
    return headers, params

def tmdb_get(path: str, extra_params: Dict[str, str] | None = None) -> Any:
    cache_key = f"GET:{path}:{str(extra_params or {})}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached
    headers, params = _headers_and_params()
    if extra_params:
        params.update(extra_params)
    url = f"{TMDB_BASE_URL}{path}"
    r = requests.get(url, headers=headers, params=params, timeout=7)
    r.raise_for_status()
    data = r.json()
    _cache_set(cache_key, data)
    return data

def get_movie_details(movie_id: int) -> Dict[str, Any]:
    return tmdb_get(f"/movie/{movie_id}", {'append_to_response': 'credits,keywords'})

def get_movie_similar(movie_id: int) -> List[Dict[str, Any]]:
    return tmdb_get(f"/movie/{movie_id}/similar").get('results', [])

def get_movie_recommendations(movie_id: int) -> List[Dict[str, Any]]:
    return tmdb_get(f"/movie/{movie_id}/recommendations").get('results', [])

def get_tv_details(tv_id: int) -> Dict[str, Any]:
    return tmdb_get(f"/tv/{tv_id}", {'append_to_response': 'aggregate_credits'})

def get_tv_similar(tv_id: int) -> List[Dict[str, Any]]:
    return tmdb_get(f"/tv/{tv_id}/similar").get('results', [])

def get_tv_recommendations(tv_id: int) -> List[Dict[str, Any]]:
    return tmdb_get(f"/tv/{tv_id}/recommendations").get('results', [])

# Feature helpers and scoring
def get_year(item: Dict[str, Any]):
    date_key = 'release_date' if 'release_date' in item else 'first_air_date'
    ds = item.get(date_key)
    if not ds:
        return None
    try:
        return int(ds.split('-')[0])
    except Exception:
        return None

def get_genre_ids(item: Dict[str, Any]) -> List[int]:
    if isinstance(item.get('genre_ids'), list):
        return [int(g) for g in item['genre_ids']]
    if isinstance(item.get('genres'), list):
        return [int(g.get('id')) for g in item['genres'] if isinstance(g, dict) and g.get('id')]
    return []

def genre_overlap(a: List[int], b: List[int]) -> int:
    sa, sb = set(a), set(b)
    return len(sa & sb)

def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def get_keywords(item):
    kws = []
    if isinstance(item.get('keywords'), dict) and 'keywords' in item['keywords']:
        kws = [k.get('name','').lower() for k in item['keywords']['keywords'] if isinstance(k, dict)]
    elif isinstance(item.get('keywords'), list):
        kws = [k.get('name','').lower() for k in item['keywords'] if isinstance(k, dict)]
    return [k for k in kws if k]

def get_cast_ids(item):
    credits = item.get('credits') or item.get('aggregate_credits') or {}
    cast = credits.get('cast') or []
    return [int(c.get('id')) for c in cast if c.get('id')]

def get_director_ids(item):
    credits = item.get('credits') or {}
    crew = credits.get('crew') or []
    return [int(m.get('id')) for m in crew if m.get('job') == 'Director' and m.get('id')]

def get_creator_ids(tv_details):
    creators = tv_details.get('created_by') or []
    return [int(c.get('id')) for c in creators if c.get('id')]

def in_same_collection(a, b):
    ca = (a.get('belongs_to_collection') or {}).get('id')
    cb = (b.get('belongs_to_collection') or {}).get('id')
    return bool(ca and cb and ca == cb)

ADV_WEIGHTS = {
    'genre_overlap': 0.40,
    'keyword_overlap': 0.18,
    'cast_overlap': 0.12,
    'director_creator_overlap': 0.08,
    'year_proximity': 0.08,
    'rating': 0.09,
    'popularity': 0.05,
}

QUALITY_FLOORS = {
    'vote_count': 300,
    'vote_average': 6.2,
}

BOOSTS = {
    'same_collection': 0.08,
}

def jaccard_overlap(a, b):
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    inter = len(sa & sb)
    uni = len(sa | sb)
    return inter / uni if uni else 0.0

def score_candidate_advanced(source: Dict[str, Any], cand: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
    va = float(cand.get('vote_average') or 0.0)
    vc = float(cand.get('vote_count') or 0.0)
    if vc < QUALITY_FLOORS['vote_count'] or va < QUALITY_FLOORS['vote_average']:
        return 0.0, {'floor_filter': 1.0}
    
    src_genres = get_genre_ids(source)
    tgt_genres = get_genre_ids(cand)
    genre_term = clamp(genre_overlap(src_genres, tgt_genres) / 4.0, 0.0, 1.0)
    
    src_year = get_year(source)
    tgt_year = get_year(cand)
    if src_year and tgt_year:
        year_diff = abs(src_year - tgt_year)
        year_term = 1.0 - clamp(year_diff / 20.0, 0.0, 1.0)
    else:
        year_term = 0.5
    
    rating_term = clamp((va - 5.0) / 3.0, 0.0, 1.0)
    pop_term = clamp(float(cand.get('popularity') or 0.0) / 200.0, 0.0, 1.0)
    
    kw_src = get_keywords(source)
    kw_tgt = get_keywords(cand)
    kw_term = clamp(jaccard_overlap(kw_src, kw_tgt), 0.0, 1.0)
    
    cast_src = get_cast_ids(source)
    cast_tgt = get_cast_ids(cand)
    cast_term = clamp(jaccard_overlap(cast_src, cast_tgt), 0.0, 1.0)
    
    # director (movies) or creators (tv)
    if 'title' in source or 'original_title' in source:
        dir_src = get_director_ids(source)
        dir_tgt = get_director_ids(cand)
    else:
        dir_src = get_creator_ids(source) if isinstance(source, dict) else []
        dir_tgt = get_creator_ids(cand) if isinstance(cand, dict) else []
    dir_term = clamp(jaccard_overlap(dir_src, dir_tgt), 0.0, 1.0)
    
    components = {
        'genre_overlap': genre_term,
        'keyword_overlap': kw_term,
        'cast_overlap': cast_term,
        'director_creator_overlap': dir_term,
        'year_proximity': year_term,
        'rating': rating_term,
        'popularity': pop_term,
    }
    score = sum(ADV_WEIGHTS[k] * components[k] for k in ADV_WEIGHTS)
    
    if in_same_collection(source, cand):
        score += BOOSTS['same_collection']
    
    return float(score), components

def mmr_diversify(items: List[Dict[str, Any]], score_key: str = 'score', lambda_weight: float = 0.78, top_k: int = 20):
    def feature_set(x):
        return set(get_genre_ids(x)) | set(get_keywords(x))
    feats = [feature_set(x) for x in items]
    selected = []
    candidates = list(range(len(items)))
    def sim(i, j):
        a, b = feats[i], feats[j]
        if not a or not b:
            return 0.0
        inter = len(a & b)
        uni = len(a | b)
        return inter / uni if uni else 0.0
    while candidates and len(selected) < top_k:
        best_idx, best_val = None, -1e9
        for i in candidates:
            rel = float(items[i].get(score_key, 0.0))
            if not selected:
                val = rel
            else:
                max_sim = max(sim(i, j) for j in selected)
                val = lambda_weight * rel - (1 - lambda_weight) * max_sim
            if val > best_val:
                best_val = val
                best_idx = i
        selected.append(best_idx)
        candidates.remove(best_idx)
    return [items[i] for i in selected]

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


@app.route('/api/reco/v2/movie/<int:movie_id>')
def reco_v2_movie(movie_id: int):
    try:
        src = get_movie_details(movie_id)
        sim = get_movie_similar(movie_id)
        rec = get_movie_recommendations(movie_id)
        pool = {m['id']: m for m in (sim + rec) if isinstance(m, dict) and m.get('id')}
        rows = []
        for cid, cand in pool.items():
            if cid == movie_id:
                continue
            score, _ = score_candidate_advanced(src, cand)
            if score <= 0:
                continue
            rows.append({
                'id': cid,
                'title': cand.get('title') or cand.get('name'),
                'poster_path': cand.get('poster_path'),
                'backdrop_path': cand.get('backdrop_path'),
                'overview': cand.get('overview'),
                'release_date': cand.get('release_date'),
                'vote_average': cand.get('vote_average'),
                'vote_count': cand.get('vote_count'),
                'popularity': cand.get('popularity'),
                'score': float(score),
            })
        rows = sorted(rows, key=lambda r: r['score'], reverse=True)[:150]
        rows = mmr_diversify(rows, score_key='score', lambda_weight=0.78, top_k=30)
        return jsonify(rows)
    except Exception as e:
        print('reco_v2_movie error:', e)
        return jsonify([])


@app.route('/api/reco/v2/tv/<int:tv_id>')
def reco_v2_tv(tv_id: int):
    try:
        src = get_tv_details(tv_id)
        sim = get_tv_similar(tv_id)
        rec = get_tv_recommendations(tv_id)
        pool = {m['id']: m for m in (sim + rec) if isinstance(m, dict) and m.get('id')}
        rows = []
        for cid, cand in pool.items():
            if cid == tv_id:
                continue
            score, _ = score_candidate_advanced(src, cand)
            if score <= 0:
                continue
            rows.append({
                'id': cid,
                'name': cand.get('name') or cand.get('title'),
                'poster_path': cand.get('poster_path'),
                'backdrop_path': cand.get('backdrop_path'),
                'overview': cand.get('overview'),
                'first_air_date': cand.get('first_air_date'),
                'vote_average': cand.get('vote_average'),
                'vote_count': cand.get('vote_count'),
                'popularity': cand.get('popularity'),
                'score': float(score),
            })
        rows = sorted(rows, key=lambda r: r['score'], reverse=True)[:150]
        rows = mmr_diversify(rows, score_key='score', lambda_weight=0.78, top_k=30)
        return jsonify(rows)
    except Exception as e:
        print('reco_v2_tv error:', e)
        return jsonify([])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting recommendation service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
