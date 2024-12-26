
const my_api_key = '';
const api_url = 'https://api.themoviedb.org/3';

let _popular_movies = Symbol();
let _searched_results = Symbol();

class FetchMovies {
    constructor(api_url, api_key){
        this.api_url = api_url,
        this.api_key = api_key,
        this._popular_movies = _popular_movies
        this._searched_results = _searched_results
    }

    async fetchPopularMovies(api_url=this.api_url, api_key=this.api_key){
        try {
            const url1 = `${api_url}/movie/popular?api_key=${api_key}&language=en-US&page=1`;
            const response = await fetch(url1);
            const data = await response.json();
            let page_movies = await data.results.slice(0, 19);

            const url2 = `${api_url}/movie/popular?api_key=${api_key}&language=en-US&page=2`;
            const response2 = await fetch(url2);
            const data2 = await response2.json();
            let page_movies2 = await data2.results.slice(0, 19);

            const url3 = `${api_url}/movie/popular?api_key=${api_key}&language=en-US&page=3`;
            const response3 = await fetch(url3);
            const data3 = await response3.json();
            let page_movies3 = await data3.results.slice(0, 19);

            const url4 = `${api_url}/movie/popular?api_key=${api_key}&language=en-US&page=4`;
            const response4 = await fetch(url4);
            const data4 = await response4.json();
            let page_movies4 = await data4.results.slice(0, 19);

            const url5 = `${api_url}/movie/popular?api_key=${api_key}&language=en-US&page=5`;
            const response5 = await fetch(url5);
            const data5 = await response5.json();
            let page_movies5 = await data5.results.slice(0, 19);

            _popular_movies = [...page_movies, ...page_movies2, ...page_movies3, ...page_movies4, ...page_movies5];

        } catch (error) {
            console.error('Error while fetching 20 POPULAR movies...', error);
        }
        return _popular_movies;
    }

    async fetchSearchedMovie(movie_name) {
        const url = `${this.api_url}/search/movie?api_key=${this.api_key}&query=${encodeURIComponent(movie_name)}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.results && data.results.length > 0) {
                const results = data.results.map(movie => movie.title).slice(0, 5);
                console.log(results);
                return results; 
            } else {
                console.log('No matched movie for your search');
                return []; 
            }
        } catch (error) {
            console.error('Error fetching searched movies:', error);
            return [];
        }
    }

    async fetchGenreMovies(selectedGenreName, genreIdMapping) {
        try {
            const all_movies = await this.fetchPopularMovies(); 
    
            if (selectedGenreName) {
                const selectedGenreId = genreIdMapping[selectedGenreName]; 
                if (!selectedGenreId) {
                    console.warn(`Genre "${selectedGenreName}" not found in mapping.`);
                    return [];
                }
    
                const filtered_movies = all_movies.filter(movie => {
                    if (Array.isArray(movie.genre_ids)) {
                        return movie.genre_ids.includes(selectedGenreId);
                    }
                    return false; 
                });
    
                console.log(filtered_movies); 
                return filtered_movies;
            }

            return all_movies; 
        } catch (error) {
            console.error("Error fetching genre movies:", error);
            return []; 
        }
    }  
}

class DisplayMovie{
    constructor(api_url, api_key){
        this.api_url = api_url,
        this.api_key = api_key 
    }

    displayMovies(movies_list, container_id){
        const movie_container = document.getElementById(container_id);
        movie_container.innerHTML = ''; 

        movies_list.forEach(movie => {
            const movie_element = document.createElement('div');
            movie_element.classList.add('movie-card');

            function format_date(date_string) {
                const date = new Date(date_string);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString(undefined, options);
            }

            movie_element.innerHTML = `
                <div class="poster" title="${movie.title}">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                </div>
                <div class="movie-details">
                    <div>
                        <p class="movie-title"><strong>${movie.title}</strong></p>
                        <p class="release-year"><strong>Released: </strong><span>${format_date(movie.release_date)}</span></p>
                    </div>
                    <p class="movie-rating"> <strong>Rating: </strong><span>${movie.vote_average}</span></p>
                </div>
            `;
            movie_container.appendChild(movie_element);
        });
    }

    async displayMovieDetails(movie_name) {
        const searchUrl = `${this.api_url}/search/movie?api_key=${this.api_key}&query=${encodeURIComponent(movie_name)}&language=en-US`;
    
        try {
            const searchResponse = await fetch(searchUrl);
            if (!searchResponse.ok) {
                throw new Error('Failed to fetch movie search results');
            }
    
            const searchResults = await searchResponse.json();

            if (searchResults.results.length === 0) {
                console.log('No movie found with the name:', movie_name);
                return;
            }
    
            const movie = searchResults.results[0]; 
    
            const movieDetailsUrl = `${this.api_url}/movie/${movie.id}?api_key=${this.api_key}&language=en-US`;
            const movieDetailsResponse = await fetch(movieDetailsUrl);

            const similarResponse = await fetch(`${this.api_url}/movie/${movie.id}/similar?api_key=${this.api_key}`);
            const similarMovies = await similarResponse.json();

            const videosResponse = await fetch(`${this.api_url}/movie/${movie_name.id}/videos?api_key=${this.api_key}`);
            const videos = await videosResponse.json();

            const creditsResponse = await fetch(`${this.api_url}/movie/${movie.id}/credits?api_key=${this.api_key}`);
            const credits = await creditsResponse.json();
    
            if (!movieDetailsResponse.ok) {
                throw new Error('Failed to fetch movie details');
            }
    
            const movieDetails = await movieDetailsResponse.json();
            const movie_container = document.getElementById('main-container');
            movie_container.innerHTML = ''; 
    
            function format_date(date_string) {
                const date = new Date(date_string);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString(undefined, options);
            }
    
            const movieDetailsHTML = `
                <section class="detailed-section">
                    <div class="detailed-container">
                        <div class="top-details">
                            <img src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" alt="${movieDetails.title}">
                        </div>
                        <div class="bottom-details">
                            <h1>${movieDetails.title}</h1>
                            <p class="overview">${movieDetails.overview}</p>
                            <p><strong>Release Date:</strong> ${format_date(movieDetails.release_date)}</p>
                            <p><strong>Rating:</strong> ${movieDetails.vote_average} / 10</p>
                            <p><strong>Genres:</strong> ${movieDetails.genres?.map(genre => genre.name).join(', ') || 'N/A'}</p>
                            <p><strong>Runtime:</strong> ${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m</p>
                            <p><strong>Budget:</strong> $${movieDetails.budget.toLocaleString()}</p>
                            <p><strong>Revenue:</strong> $${movieDetails.revenue.toLocaleString()}</p>
                            <p><strong>Director:</strong> ${credits.crew.find(c => c.job === 'Director')?.name || 'N/A'}</p>
                        </div>
                        <div class="similar-movies">
                            <h1>Similar Movies</h1>
                            <div>
                                    ${similarMovies.results.map(movie => 
                                        `
                                            <ul class="similar-card">
                                                <li class="similar-img">
                                                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                                                </li>
                                                <li class="similar-movie-title">${movie.title}</li>
                                                <li><strong>Release Date:</strong> ${format_date(movie.release_date)}</li>
                                                <li><strong>Rating:</strong> ${movieDetails.vote_average} / 10</li>
                                            </ul>
                                        `
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            `;
    
            movie_container.innerHTML = movieDetailsHTML;


            const similar_movies = document.querySelectorAll('.similar-card');
    

            similar_movies.forEach(similar_movie => {
                similar_movie.addEventListener("click", () => {
                    const title = similar_movie.querySelector(".similar-movie-title");
                    
                    if (title) {
                        const title_text = title.innerText;
                        console.log(title_text);
            
                        displaying.displayMovieDetails(title_text);
            
                    }
                })
            })


            return movie_container.innerHTML;
        } catch (error) {
            console.error('Error while fetching movie details:', error);
        }
    }
}


const fetchPopular = new FetchMovies(api_url, my_api_key);
const displaying = new DisplayMovie(api_url, my_api_key);
const search_input = document.getElementById('search');
const suggestions_container = document.querySelector(".search-suggestions");
const movie_form = document.getElementById("movie-search-form");
const genre_select = document.querySelector("#genre-select");
const genreIdMapping = {
    "Action": 28,
    "Adventure": 12,
    "Animation": 16,
    "Comedy": 35,
    "Crime": 80,
    "Drama": 18,
    "Family": 10751,
    "Horror": 27,
    "Romance": 10749,
    "Science Fiction": 878
};

genre_select.addEventListener("change", async (e) => {
    e.preventDefault();

    try {
        
        const selected_genre = genre_select.value;

        const genre_array = await fetchPopular.fetchGenreMovies(selected_genre, genreIdMapping);
        console.log(Array.isArray(genre_array))
        console.log(genre_array)

        displaying.displayMovies(genre_array, "movies-container");  
        const movies_container = document.querySelectorAll(".movie-card");
        console.log(movies_container)
    
        movies_container.forEach(movie_card => {
            movie_card.addEventListener("click", () => {
                const title = movie_card.querySelector(".movie-title");
            
                if (title) {
                    const title_text = title.innerText;
                    console.log(title_text);
    
                    displaying.displayMovieDetails(title_text);
    
                }
                
            });
        }); 
    } catch (error) {
        console.error('Error displaying genred movies:', error);
        
    }
})

search_input.addEventListener("input", async function() {
    const query = this.value.trim();

    if (query.length > 1) {
        try {
            const searched_movie = await fetchPopular.fetchSearchedMovie(query);

            suggestions_container.innerHTML = "";
            if (searched_movie.length > 0) {
                suggestions_container.style.display = "block";

                searched_movie.forEach(movie_name => {
                    const suggestion = document.createElement("div");
                    suggestion.classList.add("suggestion-item");
                    suggestion.textContent = movie_name;

                    suggestion.addEventListener("click", function() {
                        search_input.value = movie_name;
                        suggestions_container.innerHTML = "";
                        suggestions_container.style.display = "none";
                    });

                    suggestions_container.appendChild(suggestion);
                });
            } else {
                suggestions_container.style.display = "none";
            }
        } catch (error) {
            console.error("Error fetching movies suggestions:", error);
            suggestions_container.style.display = "none";
        }
    } else {
        suggestions_container.style.display = "none";
    }
});

movie_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searched = search_input.value;

    try {
        const searched_display = await displaying.displayMovieDetails(searched);
        return searched_display;
    } catch (error) {
        console.error('Error displaying searched movies:', error);
        
    }
})

const popularArray = fetchPopular.fetchPopularMovies().then(popularArray => {
    console.log(popularArray);
    console.log(typeof popularArray);

    displaying.displayMovies(popularArray, "movies-container");

    const movies_container = document.querySelectorAll(".movie-card");
    console.log(movies_container)

    movies_container.forEach(movie_card => {
        movie_card.addEventListener("click", () => {
            const title = movie_card.querySelector(".movie-title");
        
            if (title) {
                const title_text = title.innerText;
                console.log(title_text);

                displaying.displayMovieDetails(title_text);

            }
            
        });
    });
})
.catch(error => {
    console.error('Error fetching movies:', error);
});
