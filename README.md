# Movie Recommendation System

## Technical Documentation

### Custom Algorithms and Business Logic

####  Mood-Based Recommendation Engine
Custom scoring algorithms for 6 distinct moods, each with unique weighting criteria:

- **"Need a Good Cry"**: Prioritizes Drama/Romance (+0.8), penalizes Comedy/Action (-0.5)
- **"Brain Food"**: Boosts Documentary/Mystery/Sci-Fi (+0.9), requires runtime >90min
- **"Mindless Fun"**: Favors Action/Comedy/Adventure (+1.0), penalizes 3+ hour movies (-0.15)
- **"Edge of Seat"**: Emphasizes Thriller/Horror/Action (+1.0), minimum runtime enforcement
- **"Feel Good Vibes"**: Promotes Comedy/Musical/Family (+1.0), penalizes R-rated content (-0.3)
- **"Deep Thoughts"**: Enhances Drama/Sci-Fi/Documentary (+0.9), requires runtime >100min

**Business Logic Features:**
- Recent movies (last 2 years) receive +20% mood-match bonus
- Genre diversity: 25% score boost for unwatched genres in last 30 days
- Social context integration with custom filtering rules

####  Proprietary Fuzzy Search Algorithm

**Features:**
- Handles typos, partial matches, and word order variations
- Contextual relevance scoring for real-time search

####  Dynamic Pricing Engine
Multi-factor pricing algorithm considering:

- **Time-based pricing**: +25% during prime time (7-10 PM)
- **Weekend surcharge**: +15% on Saturday/Sunday
- **Popularity scaling**: Variable pricing for movies rated >7.5/10
- **User history discounts**: 10% discount for previously watched content

####  Master Recommendation Scoring
Weighted combination algorithm:

```
Final Score = (Mood × 40%) + (Social Context × 25%) + (Price × 20%) + (Recency × 15%) + (Search Relevance × 5%)

Genre Diversity Multiplier: ×1.25 if new genre
```

### Performance Optimization Strategies

####  API Call Optimization
- **Debounced Search**: 500ms delay prevents excessive API calls during typing
- **Progressive Data Loading**: Basic movie data → detailed info → pricing (staged approach)

####  Memory Management
- **Ref-based Tracking**: Prevents memory leaks in async operations
- **Selective Re-renders**: `useCallback` and dependency arrays minimize unnecessary renders
- **Immutable State Updates**: Proper Redux-pattern state management

####  Caching Strategy
- **Movie Details Cache**: Persistent storage in global state
- **Smart Re-fetching**: Only fetches missing data, never duplicates requests

####  Computational Efficiency
- **Batch Processing**: Movie scoring happens in single useEffect cycle
- **Lazy Loading**: Pricing fetched only for filtered/visible results (300ms delay)

### State Management Architecture

####  Custom useReducer Implementation
Pure React state management without external dependencies

####  Action-Based Updates
Comprehensive action system handling:
- `SET_SEARCH_QUERY`: Query updates with automatic filtering
- `SET_MOVIES`: Batch movie data with detail slot preparation
- `ADD_MOVIE_DETAILS`: Individual movie detail integration
- `SET_DYNAMIC_PRICE`: Real-time price updates per movie
- `SET_FILTERED_MOVIES`: Processed and scored results
- `SET_SOCIAL_CONTEXT`/`SET_SELECTED_MOOD`: Preference updates



### API Design Decisions

####  Next.js Edge Runtime Integration
Dynamic pricing API built on Edge Runtime for:
- **Global Distribution**: Low-latency price calculations
- **Serverless Scaling**: Automatic scaling for demand spikes
- **Real-time Processing**: Sub-100ms response times

####  RESTful Endpoint Design
```typescript
GET /api/dynamic-price?imdbID={id}&timeOfDay={hour}&dayOfWeek={day}&moviePopularity={rating}

Response: {
  rentalPrice: number;
  bestTimeToRentSuggestion: string;
}
```

####  Error Handling
- **API Failure Resilience**: Fallback scoring for missing movie details
- **Network Error Recovery**: Error state management with user feedback
- **Progressive Enhancement**: App functionality maintained during partial API failures

####  Data Flow Architecture
```
User Input → Debounced Search → OMDB API → Detail Fetching → 
Mood/Social Filtering → Scoring Engine → Price Integration → 
Sorted Results Display
```
