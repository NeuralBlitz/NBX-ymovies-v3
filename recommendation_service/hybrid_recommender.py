"""
Hybrid recommendation engine that blends content-based similarity
with collaborative signals (user ratings, watch history, genre preferences).
"""

import math
from typing import Any, Dict, List, Optional, Tuple


# Scoring weights for the hybrid blend
CONTENT_WEIGHT = 0.45
COLLABORATIVE_WEIGHT = 0.35
POPULARITY_WEIGHT = 0.20

# Quality thresholds
MIN_VOTE_COUNT = 200
MIN_VOTE_AVERAGE = 5.8

# Decay factor for how fast older watch history loses influence (lower = faster decay)
HISTORY_DECAY_RATE = 0.85


def _genre_ids(item: Dict[str, Any]) -> List[int]:
    if isinstance(item.get("genre_ids"), list):
        return [int(g) for g in item["genre_ids"]]
    if isinstance(item.get("genres"), list):
        return [int(g["id"]) for g in item["genres"] if isinstance(g, dict) and g.get("id")]
    return []


def _year(item: Dict[str, Any]) -> Optional[int]:
    date_key = "release_date" if "release_date" in item else "first_air_date"
    ds = item.get(date_key)
    if not ds:
        return None
    try:
        return int(ds.split("-")[0])
    except (ValueError, IndexError):
        return None


def _keywords(item: Dict[str, Any]) -> List[str]:
    kws = item.get("keywords")
    if isinstance(kws, dict):
        kws = kws.get("keywords", [])
    if not isinstance(kws, list):
        return []
    return [k.get("name", "").lower() for k in kws if isinstance(k, dict) and k.get("name")]


def _cast_ids(item: Dict[str, Any]) -> List[int]:
    credits = item.get("credits") or item.get("aggregate_credits") or {}
    cast = credits.get("cast") or []
    return [int(c["id"]) for c in cast if isinstance(c, dict) and c.get("id")]


def _director_ids(item: Dict[str, Any]) -> List[int]:
    credits = item.get("credits") or {}
    crew = credits.get("crew") or []
    return [int(m["id"]) for m in crew if m.get("job") == "Director" and m.get("id")]


def _jaccard(a: list, b: list) -> float:
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


# ---------------------------------------------------------------------------
# Content-based scoring
# ---------------------------------------------------------------------------


def content_score(source: Dict[str, Any], candidate: Dict[str, Any]) -> float:
    """Score a candidate against a single source item using content features."""
    src_genres = _genre_ids(source)
    cand_genres = _genre_ids(candidate)
    genre_sim = _clamp(len(set(src_genres) & set(cand_genres)) / max(len(set(src_genres) | set(cand_genres)), 1))

    src_kw = _keywords(source)
    cand_kw = _keywords(candidate)
    kw_sim = _jaccard(src_kw, cand_kw)

    cast_sim = _jaccard(_cast_ids(source)[:10], _cast_ids(candidate)[:10])
    director_sim = _jaccard(_director_ids(source), _director_ids(candidate))

    src_year = _year(source)
    cand_year = _year(candidate)
    if src_year and cand_year:
        year_sim = 1.0 - _clamp(abs(src_year - cand_year) / 25.0)
    else:
        year_sim = 0.4

    return (
        0.35 * genre_sim
        + 0.20 * kw_sim
        + 0.15 * cast_sim
        + 0.10 * director_sim
        + 0.10 * year_sim
        + 0.10 * _clamp(float(candidate.get("vote_average", 0)) / 10.0)
    )


# ---------------------------------------------------------------------------
# Collaborative scoring (based on user profile)
# ---------------------------------------------------------------------------


def build_user_profile(
    watch_history: List[Dict[str, Any]],
    rated_movies: List[Dict[str, Any]],
    liked_genres: List[int],
) -> Dict[str, Any]:
    """
    Build a compact user taste profile from their history and preferences.
    Returns aggregated genre weights, preferred decades, average rating, etc.
    """
    genre_counts: Dict[int, float] = {}
    decade_counts: Dict[int, float] = {}
    avg_rating = 0.0
    total_rated = 0

    # Process watch history (more recent = higher weight via decay)
    for i, item in enumerate(watch_history):
        weight = HISTORY_DECAY_RATE ** i
        for gid in _genre_ids(item):
            genre_counts[gid] = genre_counts.get(gid, 0.0) + weight
        year = _year(item)
        if year:
            decade = (year // 10) * 10
            decade_counts[decade] = decade_counts.get(decade, 0.0) + weight

    # Boost explicitly liked genres
    for gid in liked_genres:
        if isinstance(gid, str):
            try:
                gid = int(gid)
            except ValueError:
                continue
        genre_counts[gid] = genre_counts.get(gid, 0.0) + 3.0

    # Factor in ratings
    for item in rated_movies:
        rating = item.get("rating")
        if rating and isinstance(rating, (int, float)):
            total_rated += 1
            avg_rating += rating
            # High-rated movies boost their genres more
            boost = (rating - 3.0) / 2.0  # range -1.0 to +1.0
            for gid in _genre_ids(item):
                genre_counts[gid] = genre_counts.get(gid, 0.0) + boost

    if total_rated > 0:
        avg_rating /= total_rated

    # Normalize genre weights
    max_weight = max(genre_counts.values()) if genre_counts else 1.0
    genre_weights = {gid: w / max_weight for gid, w in genre_counts.items()}

    return {
        "genre_weights": genre_weights,
        "decade_counts": decade_counts,
        "avg_rating": avg_rating,
        "total_watched": len(watch_history),
    }


def collaborative_score(profile: Dict[str, Any], candidate: Dict[str, Any]) -> float:
    """Score a candidate against the user's taste profile."""
    genre_weights = profile.get("genre_weights", {})
    if not genre_weights:
        return 0.0

    # Genre affinity: weighted sum of user's genre preferences
    cand_genres = _genre_ids(candidate)
    if cand_genres:
        genre_affinity = sum(genre_weights.get(gid, 0.0) for gid in cand_genres) / len(cand_genres)
    else:
        genre_affinity = 0.0

    # Decade preference
    decade_counts = profile.get("decade_counts", {})
    cand_year = _year(candidate)
    decade_affinity = 0.0
    if cand_year and decade_counts:
        decade = (cand_year // 10) * 10
        max_decade = max(decade_counts.values()) if decade_counts else 1.0
        decade_affinity = decade_counts.get(decade, 0.0) / max_decade

    # Rating alignment: prefer candidates whose rating aligns with user's average
    cand_rating = float(candidate.get("vote_average", 0))
    user_avg = profile.get("avg_rating", 7.0)
    if user_avg > 0:
        rating_alignment = 1.0 - _clamp(abs(cand_rating - user_avg) / 4.0)
    else:
        rating_alignment = _clamp(cand_rating / 10.0)

    return 0.55 * genre_affinity + 0.25 * decade_affinity + 0.20 * rating_alignment


# ---------------------------------------------------------------------------
# Popularity scoring
# ---------------------------------------------------------------------------


def popularity_score(candidate: Dict[str, Any]) -> float:
    """Normalized popularity/quality score."""
    vote_avg = float(candidate.get("vote_average", 0))
    vote_count = float(candidate.get("vote_count", 0))
    popularity = float(candidate.get("popularity", 0))

    quality = _clamp(vote_avg / 10.0)
    confidence = _clamp(math.log10(max(vote_count, 1)) / 5.0)  # log scale, cap at 100k
    trend = _clamp(popularity / 200.0)

    return 0.45 * quality + 0.30 * confidence + 0.25 * trend


# ---------------------------------------------------------------------------
# Quality gate
# ---------------------------------------------------------------------------


def passes_quality_gate(candidate: Dict[str, Any]) -> bool:
    vc = float(candidate.get("vote_count", 0))
    va = float(candidate.get("vote_average", 0))
    return vc >= MIN_VOTE_COUNT and va >= MIN_VOTE_AVERAGE


# ---------------------------------------------------------------------------
# MMR diversification (re-ranks to reduce redundancy)
# ---------------------------------------------------------------------------


def mmr_rerank(
    items: List[Dict[str, Any]],
    score_key: str = "hybrid_score",
    lambda_w: float = 0.75,
    top_k: int = 25,
) -> List[Dict[str, Any]]:
    """Maximal Marginal Relevance: balances relevance with diversity."""
    if not items:
        return []

    def _feature_set(item: Dict[str, Any]) -> set:
        return set(_genre_ids(item)) | set(_keywords(item)[:10])

    features = [_feature_set(x) for x in items]
    selected: List[int] = []
    remaining = list(range(len(items)))

    def _sim(i: int, j: int) -> float:
        a, b = features[i], features[j]
        if not a or not b:
            return 0.0
        return len(a & b) / len(a | b)

    while remaining and len(selected) < top_k:
        best_idx = None
        best_val = -1e9

        for i in remaining:
            relevance = float(items[i].get(score_key, 0.0))
            if not selected:
                val = relevance
            else:
                max_sim = max(_sim(i, s) for s in selected)
                val = lambda_w * relevance - (1.0 - lambda_w) * max_sim

            if val > best_val:
                best_val = val
                best_idx = i

        if best_idx is None:
            break
        selected.append(best_idx)
        remaining.remove(best_idx)

    return [items[i] for i in selected]


# ---------------------------------------------------------------------------
# Main hybrid recommendation function
# ---------------------------------------------------------------------------


def hybrid_recommend(
    candidates: List[Dict[str, Any]],
    source_items: List[Dict[str, Any]],
    user_profile: Dict[str, Any],
    already_seen_ids: Optional[set] = None,
    top_k: int = 25,
) -> List[Dict[str, Any]]:
    """
    Produce hybrid recommendations by blending content-based, collaborative,
    and popularity scores.

    Args:
        candidates: Pool of candidate movies/shows from TMDB (similar, recommendations, etc.)
        source_items: The specific item(s) the user interacted with (for content similarity)
        user_profile: Output of build_user_profile()
        already_seen_ids: Set of TMDB IDs the user has already watched
        top_k: Number of results to return

    Returns:
        Ranked and diversified list of recommendation dicts.
    """
    if already_seen_ids is None:
        already_seen_ids = set()

    scored: List[Dict[str, Any]] = []

    for cand in candidates:
        cand_id = cand.get("id")
        if not cand_id or cand_id in already_seen_ids:
            continue

        if not passes_quality_gate(cand):
            continue

        # Content score: max similarity against all source items
        c_score = 0.0
        if source_items:
            c_score = max(content_score(src, cand) for src in source_items)

        # Collaborative score
        collab = collaborative_score(user_profile, cand)

        # Popularity score
        pop = popularity_score(cand)

        hybrid = (CONTENT_WEIGHT * c_score + COLLABORATIVE_WEIGHT * collab + POPULARITY_WEIGHT * pop)

        scored.append({
            **cand,
            "hybrid_score": round(hybrid, 4),
            "content_score": round(c_score, 4),
            "collaborative_score": round(collab, 4),
            "popularity_score": round(pop, 4),
        })

    # Sort by hybrid score, then diversify
    scored.sort(key=lambda x: x["hybrid_score"], reverse=True)
    top_pool = scored[: top_k * 5]  # take wider pool for MMR to work with
    return mmr_rerank(top_pool, score_key="hybrid_score", top_k=top_k)
