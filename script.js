const API_KEY = '59086a6a85134fe30e54746039a65ba6';
const movieGallery = document.getElementById('movie-gallery');
const movieDetailsOverlay = document.getElementById('movie-details-overlay');
const detailsTitle = document.getElementById('details-title');
const detailsPoster = document.getElementById('details-poster');
const detailsDescription = document.getElementById('details-description');
const castInfo = document.getElementById('cast-info');
const detailsCast = document.getElementById('details-cast');
const searchBar = document.getElementById('search-bar');
const genreSelect = document.getElementById('genre-select');

// Buttons for movie actions
const watchTrailerBtn = document.getElementById('watch-trailer-btn');
const castBtn = document.getElementById('cast-btn');
const watchMovieBtn = document.getElementById('watch-movie-btn');

// Lazy load images by adding loading="lazy"
function displayMovies(movies) {
    movieGallery.innerHTML = '';
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie';
        movieDiv.innerHTML = `
            <img loading="lazy" src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
        `;
        movieDiv.addEventListener('click', () => showMovieDetails(movie));
        movieGallery.appendChild(movieDiv);
    });
}

// Fetch genres and cache them locally
async function fetchGenres() {
    if (!localStorage.getItem('genres')) {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        localStorage.setItem('genres', JSON.stringify(data.genres));
        populateGenreSelect(data.genres);
    } else {
        const cachedGenres = JSON.parse(localStorage.getItem('genres'));
        populateGenreSelect(cachedGenres);
    }
}

// Populate the genre dropdown
function populateGenreSelect(genres) {
    genreSelect.innerHTML = `<option value="">🎭 Select Genre</option>`;
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    });
}

// Fetch movies by genre or popular movies if no genre is selected
async function fetchMovies(genreId = '') {
    const url = genreId 
        ? `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
}

// Search movies based on input
async function searchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
}

// Show movie details in an overlay
function showMovieDetails(movie) {
    movieDetailsOverlay.style.display = 'flex';
    detailsTitle.textContent = movie.title;
    detailsPoster.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    detailsDescription.textContent = movie.overview;

    // Fetch cast information for the selected movie
    castBtn.onclick = () => {
        fetchCast(movie.id);
    };

    // Set movie watch button
    watchMovieBtn.onclick = () => {
        addToWatchlist(movie);
    };

    // Set trailer watch button
    watchTrailerBtn.onclick = () => {
        watchTrailer(movie.id);
    };
}

// Fetch movie cast
async function fetchCast(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const castList = data.cast.slice(0, 5).map(cast => cast.name).join(', ');
    castInfo.textContent = castList;
    detailsCast.style.display = 'block';
}

// Watch trailer by movie ID
async function watchTrailer(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const trailer = data.results.find(video => video.type === 'Trailer');
    if (trailer) {
        const trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
        window.open(trailerUrl, '_blank');
    } else {
        alert('Trailer not available');
    }
}

// New feature: Watchlist
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Add movie to watchlist and store in localStorage
function addToWatchlist(movie) {
    watchlist.push(movie);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert('Movie added to watchlist!');
}

// Event listeners
searchBar.addEventListener('input', () => {
    const query = searchBar.value;
    if (query) {
        searchMovies(query);
    } else {
        fetchMovies(); 
    }
});

genreSelect.addEventListener('change', () => {
    const genreId = genreSelect.value;
    fetchMovies(genreId);
});

// Close overlay when clicking outside of movie details
movieDetailsOverlay.addEventListener('click', (e) => {
    if (e.target === movieDetailsOverlay) {
        movieDetailsOverlay.style.display = 'none';
        detailsCast.style.display = 'none'; // Hide cast section when closing overlay
    }
});

// Initial fetch
fetchGenres();
fetchMovies();
