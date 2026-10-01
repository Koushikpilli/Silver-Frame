// =====================================================
// SILVERFRAME JAVASCRIPT
// =====================================================


// =====================================================
// TMDB
// =====================================================

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlYjBjZmIzMzMyMzkwN2YyZGZkMjBlOGVkN2UxYTQ0NiIsIm5iZiI6MTc4NzczNzEwMi44NjA5OTk4LCJzdWIiOiI2YThlYjQwZTcxZDg5ODNiYzVjODU4MTIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.imYHPeTVu5xQpl6r4Lhb4K8YmhCWtOQCHAOgHbZEGEg";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/";


// =====================================================
// HELPER — TMDB REQUEST
// =====================================================

async function tmdbRequest(url) {

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.status_message || "TMDB request failed"
        );
    }

    return data;
}


// =====================================================
// FILMS PAGE
// =====================================================

const movieGrid =
    document.getElementById("movieGrid");

const loadingText =
    document.getElementById("loadingText");


async function loadMovies(category = "popular") {

    if (!movieGrid) {
        return;
    }

    if (loadingText) {
        loadingText.style.display = "block";
    }

    movieGrid.innerHTML = "";

    let url;

    if (category === "trending") {

        url =
            `${TMDB_IMAGE}`; // temporary overwrite below

        url =
            "https://api.themoviedb.org/3/trending/movie/week";

    } else {

        url =
            `https://api.themoviedb.org/3/movie/${category}`;

    }

    try {

        const data =
            await tmdbRequest(url);

        displayMovies(data.results);

    } catch (error) {

        console.error("TMDB Error:", error);

        movieGrid.innerHTML =
            "<p>Unable to load movies.</p>";

    } finally {

        if (loadingText) {
            loadingText.style.display = "none";
        }

    }
}


// =====================================================
// DISPLAY MOVIE CARDS
// =====================================================

function displayMovies(movies) {

    if (!movieGrid) {
        return;
    }

    movieGrid.innerHTML = "";

    movies.forEach(movie => {

        if (!movie.poster_path) {
            return;
        }

        const movieCard =
            document.createElement("div");

        movieCard.classList.add("movie-card");

        const year =
            movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A";

        const rating =
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A";

        movieCard.innerHTML = `

            <div class="movie-poster">

                <div class="movie-poster-inner">

                    <img
                        src="${TMDB_IMAGE}w500${movie.poster_path}"
                        alt="${movie.title}"
                        class="poster-img"
                    >

                </div>

                <div class="movie-overlay">

                    <button
                        class="overlay-btn"
                        type="button"
                    >
                        ${isMovieInList(movie.id) ? "✓ In List" : "+ Add to List"}
                    </button>

                </div>

            </div>

            <div class="movie-info">

                <p class="movie-title">
                    ${movie.title}
                </p>

                <div class="movie-meta">

                    <span class="movie-rating">
                        ★ ${rating}
                    </span>

                    <span class="movie-dot"></span>

                    <span>
                        ${year}
                    </span>

                </div>

            </div>

        `;


        // ---------------------------------------------
        // OPEN MOVIE
        // ---------------------------------------------

        movieCard.addEventListener("click", () => {

            openMovieModal(movie);

        });


        // ---------------------------------------------
        // ADD TO LIST
        // ---------------------------------------------

        const watchlistButton =
            movieCard.querySelector(".overlay-btn");

        if (watchlistButton) {

            watchlistButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    if (isMovieInList(movie.id)) {
                        removeMovieFromList(movie.id);
                        watchlistButton.textContent = "+ Add to List";
                    } else {
                        addMovieToList(movie);
                        watchlistButton.textContent = "✓ In List";
                    }

                }
            );

        }


        movieGrid.appendChild(movieCard);

    });

}


// =====================================================
// FILM FILTER BUTTONS
// =====================================================

const filterButtons =
    document.querySelectorAll(".filter-btn");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        const category =
            button.dataset.category;

        loadMovies(category);

    });

});


// =====================================================
// SEARCH
// =====================================================

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");


async function searchMovies() {

    if (!searchInput || !movieGrid) {
        return;
    }

    const query =
        searchInput.value.trim();

    if (!query) {

        loadMovies("popular");

        return;

    }

    if (loadingText) {
        loadingText.style.display = "block";
    }

    movieGrid.innerHTML = "";

    try {

        const url =
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`;

        const data =
            await tmdbRequest(url);

        displayMovies(data.results);

    } catch (error) {

        console.error("Search Error:", error);

        movieGrid.innerHTML =
            "<p>Something went wrong while searching.</p>";

    } finally {

        if (loadingText) {
            loadingText.style.display = "none";
        }

    }

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchMovies
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                searchMovies();
            }

        }
    );

}


// Load Films page
if (movieGrid) {
    loadMovies("popular");
}


// =====================================================
// TRENDING MOVIES — HOME PAGE
// =====================================================

const trendingMovies =
    document.getElementById("trendingMovies");


async function loadTrendingMovies() {

    if (!trendingMovies) {
        return;
    }

    try {

        const data =
            await tmdbRequest(
                "https://api.themoviedb.org/3/trending/movie/week"
            );

        trendingMovies.innerHTML = "";

        data.results.forEach(movie => {

            if (!movie.poster_path) {
                return;
            }

            const movieCard =
                document.createElement("div");

            movieCard.classList.add("movie-card");

            const year =
                movie.release_date
                    ? movie.release_date.substring(0, 4)
                    : "N/A";

            const rating =
                movie.vote_average
                    ? movie.vote_average.toFixed(1)
                    : "N/A";

            movieCard.innerHTML = `

                <div class="movie-poster">

                    <img
                        src="${TMDB_IMAGE}w500${movie.poster_path}"
                        alt="${movie.title}"
                    >

                    <div class="movie-overlay">

                        <button
                            class="overlay-btn"
                            type="button"
                        >
                        ${isMovieInList(movie.id) ? "✓ In List" : "+ Add to List"}
                        </button>

                    </div>

                </div>

                <div class="movie-info">

                    <p class="movie-title">
                        ${movie.title}
                    </p>

                    <div class="movie-meta">

                        <span class="movie-rating">
                            ★ ${rating}
                        </span>

                        <span class="movie-dot"></span>

                        <span>
                            ${year}
                        </span>

                    </div>

                </div>

            `;


            // Open modal
            movieCard.addEventListener(
                "click",
                () => {

                    openMovieModal(movie);

                }
            );


            // Add to list
            const button =
                movieCard.querySelector(".overlay-btn");

            if (button) {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        if (isMovieInList(movie.id)) {
                            removeMovieFromList(movie.id);
                            button.textContent = "+ Add to List";
                        } else {
                            addMovieToList(movie);
                            button.textContent = "✓ In List";
                        }

                    }
                );

            }


            trendingMovies.appendChild(
                movieCard
            );

        });

    } catch (error) {

        console.error(
            "Trending Error:",
            error
        );

        trendingMovies.innerHTML =
            "<p>Unable to load trending films.</p>";

    }

}


loadTrendingMovies();


// =====================================================
// MOVIE MODAL
// =====================================================

const movieModal =
    document.getElementById("movieModal");

const movieModalClose =
    document.getElementById("movieModalClose");

const movieModalBackdrop =
    document.getElementById("movieModalBackdrop");

const movieModalPoster =
    document.getElementById("movieModalPoster");

const movieModalTitle =
    document.getElementById("movieModalTitle");

const movieModalMeta =
    document.getElementById("movieModalMeta");

const movieModalOverview =
    document.getElementById("movieModalOverview");

const movieReviews =
    document.getElementById("movieReviews");

const addToListBtn =
    document.getElementById("addToListBtn");

const modalRateBtn =
    document.getElementById("modalRateBtn");

const ratingPanel =
    document.getElementById("ratingPanel");

const ratingValue =
    document.getElementById("ratingValue");

const ratingStars =
    document.querySelectorAll(
        ".rating-stars button"
    );


let selectedMovie = null;


// =====================================================
// OPEN MOVIE MODAL
// =====================================================

function openMovieModal(movie) {

    if (!movieModal) {
        return;
    }

    selectedMovie = movie;


    const year =
        movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";


    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A";


    // ---------------------------------------------
    // POSTER
    // ---------------------------------------------

    if (movieModalPoster) {

        movieModalPoster.src =
            `${TMDB_IMAGE}w500${movie.poster_path}`;

        movieModalPoster.alt =
            movie.title;

    }


    // ---------------------------------------------
    // BACKDROP
    // ---------------------------------------------

    if (movieModalBackdrop) {

        const backdropPath =
            movie.backdrop_path ||
            movie.poster_path;

        movieModalBackdrop.style.backgroundImage =
            `url("${TMDB_IMAGE}w1280${backdropPath}")`;

    }


    // ---------------------------------------------
    // TITLE
    // ---------------------------------------------

    if (movieModalTitle) {

        movieModalTitle.textContent =
            movie.title;

    }


    // ---------------------------------------------
    // META
    // ---------------------------------------------

    if (movieModalMeta) {

        movieModalMeta.innerHTML = `

            <span>Movie</span>

            <span>•</span>

            <span>${year}</span>

            <span>•</span>

            <span>★ ${rating}</span>

        `;

    }


    // ---------------------------------------------
    // OVERVIEW
    // ---------------------------------------------

    if (movieModalOverview) {

        movieModalOverview.textContent =
            movie.overview ||
            "No overview available for this film.";

    }


    // ---------------------------------------------
    // RESET RATING PANEL
    // ---------------------------------------------

    if (ratingPanel) {

        ratingPanel.classList.remove("active");

    }

    if (ratingValue) {

        ratingValue.textContent =
            "Select a rating";

    }

    ratingStars.forEach(star => {

        star.classList.remove("selected");

    });


    // ---------------------------------------------
    // LOAD SAVED RATING
    // ---------------------------------------------

    const savedRating =
        getMovieRating(movie.id);

    if (savedRating) {

        if (ratingValue) {

            ratingValue.textContent =
                `Your rating: ${savedRating}/5`;

        }

        ratingStars.forEach(star => {

            if (
                Number(star.dataset.rating)
                <= savedRating
            ) {

                star.classList.add("selected");

            }

        });

    }


    // ---------------------------------------------
    // CHECK LIST
    // ---------------------------------------------

    if (addToListBtn) {

        if (isMovieInList(movie.id)) {

            addToListBtn.textContent =
                "Remove from List";

            addToListBtn.classList.add("added");

        } else {

            addToListBtn.textContent =
                "+ Add to List";

            addToListBtn.classList.remove("added");

        }

    }


    // ---------------------------------------------
    // SHOW MODAL
    // ---------------------------------------------

    movieModal.classList.add("active");

    document.body.style.overflow =
        "hidden";


    // ---------------------------------------------
    // LOAD REVIEWS
    // ---------------------------------------------

    loadMovieReviews(movie.id);

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeMovieModal() {

    if (!movieModal) {
        return;
    }

    movieModal.classList.remove("active");

    document.body.style.overflow = "";

}


if (movieModalClose) {

    movieModalClose.addEventListener(
        "click",
        closeMovieModal
    );

}


if (movieModal) {

    movieModal.addEventListener(
        "click",
        event => {

            if (event.target === movieModal) {

                closeMovieModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            movieModal &&
            movieModal.classList.contains("active")
        ) {

            closeMovieModal();

        }

    }
);


// =====================================================
// RATE BUTTON
// =====================================================

if (modalRateBtn) {

    modalRateBtn.addEventListener(
        "click",
        () => {

            if (ratingPanel) {

                ratingPanel.classList.toggle(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// SELECT RATING
// =====================================================

ratingStars.forEach(star => {

    star.addEventListener(
        "click",
        () => {

            if (!selectedMovie) {
                return;
            }

            const rating =
                Number(star.dataset.rating);


            saveMovieRating(
                selectedMovie.id,
                rating
            );


            ratingStars.forEach(
                otherStar => {

                    otherStar.classList.toggle(
                        "selected",
                        Number(
                            otherStar.dataset.rating
                        ) <= rating
                    );

                }
            );


            if (ratingValue) {

                ratingValue.textContent =
                    `Your rating: ${rating}/5`;

            }

        }
    );

});


// =====================================================
// ADD TO LIST
// =====================================================

if (addToListBtn) {

    addToListBtn.addEventListener(
        "click",
        () => {

            if (!selectedMovie) {
                return;
            }

            if (isMovieInList(selectedMovie.id)) {
                removeMovieFromList(selectedMovie.id);
                addToListBtn.textContent = "+ Add to List";
                addToListBtn.classList.remove("added");
            } else {
                addMovieToList(selectedMovie);
                addToListBtn.textContent = "Remove from List";
                addToListBtn.classList.add("added");
            }

        }
    );

}


// =====================================================
// LOCAL STORAGE — RATINGS
// =====================================================

function saveMovieRating(movieId, rating) {

    const ratings =
        JSON.parse(
            localStorage.getItem(
                "silverframeRatings"
            )
        ) || {};

    ratings[movieId] =
        rating;

    localStorage.setItem(
        "silverframeRatings",
        JSON.stringify(ratings)
    );

}


function getMovieRating(movieId) {

    const ratings =
        JSON.parse(
            localStorage.getItem(
                "silverframeRatings"
            )
        ) || {};

    return ratings[movieId] || null;

}


// =====================================================
// LOCAL STORAGE — WATCHLIST
// =====================================================

function addMovieToList(movie) {

    const list =
        JSON.parse(
            localStorage.getItem(
                "silverframeWatchlist"
            )
        ) || [];


    const alreadyExists =
        list.some(
            item =>
                item.id === movie.id
        );


    if (!alreadyExists) {

        list.push({

            id: movie.id,

            title: movie.title,

            poster_path:
                movie.poster_path,

            release_date:
                movie.release_date

        });


        localStorage.setItem(
            "silverframeWatchlist",
            JSON.stringify(list)
        );

    }

}


function isMovieInList(movieId) {

    const list =
        JSON.parse(
            localStorage.getItem(
                "silverframeWatchlist"
            )
        ) || [];


    return list.some(
        movie =>
            movie.id === movieId
    );

}


// =====================================================
// TMDB COMMUNITY REVIEWS
// =====================================================

async function loadMovieReviews(movieId) {

    if (!movieReviews) {
        return;
    }


    movieReviews.innerHTML = `

        <p class="review-loading">
            Loading community reviews...
        </p>

    `;


    try {

        const data =
            await tmdbRequest(
                `https://api.themoviedb.org/3/movie/${movieId}/reviews`
            );


        if (
            !data.results ||
            data.results.length === 0
        ) {

            movieReviews.innerHTML = `

                <p class="review-loading">
                    No community reviews available yet.
                </p>

            `;

            return;

        }


        movieReviews.innerHTML = "";


        data.results
            .slice(0, 3)
            .forEach(review => {

                const reviewCard =
                    document.createElement("div");

                reviewCard.classList.add(
                    "review-card"
                );


                const author =
                    review.author ||
                    "Anonymous";


                const content =
                    review.content.trim();


                const words =
                    content
                        .split(/\s+/)
                        .slice(0, 35)
                        .join(" ");


                const excerpt =
                    words +
                    (
                        content.split(/\s+/).length > 35
                            ? "..."
                            : ""
                    );


                reviewCard.innerHTML = `

                    <div class="review-user">
                        ${author}
                    </div>

                    <p class="review-text">
                        “${excerpt}”
                    </p>

                `;


                movieReviews.appendChild(
                    reviewCard
                );

            });


    } catch (error) {

        console.error(
            "Review Error:",
            error
        );


        movieReviews.innerHTML = `

            <p class="review-loading">
                Unable to load community reviews.
            </p>

        `;

    }

}


// =====================================================
// HERO — TRENDING MOVIES
// =====================================================

const heroSlides =
    document.getElementById("heroSlides");

const heroTitle =
    document.getElementById("heroTitle");

const heroMeta =
    document.getElementById("heroMeta");

const heroDescription =
    document.getElementById("heroDescription");

const heroDots =
    document.getElementById("heroDots");

const heroPrev =
    document.getElementById("heroPrev");

const heroNext =
    document.getElementById("heroNext");


let heroMovies = [];

let currentHero = 0;

let heroTimer;


// =====================================================
// LOAD HERO MOVIES
// =====================================================

async function loadHeroMovies() {

    if (!heroSlides) {
        return;
    }


    try {

        const data =
            await tmdbRequest(
                "https://api.themoviedb.org/3/trending/movie/week"
            );


        heroMovies =
            data.results
                .filter(movie =>
                    movie.backdrop_path
                )
                .slice(0, 7);


        if (!heroMovies.length) {
            return;
        }


        createHeroSlides();

        createHeroDots();

        showHeroSlide(0);

        startHeroAutoPlay();


    } catch (error) {

        console.error(
            "Hero TMDB Error:",
            error
        );

        if (heroTitle) {

            heroTitle.textContent =
                "SilverFrame";

        }

    }

}


// =====================================================
// CREATE HERO SLIDES
// =====================================================

function createHeroSlides() {

    heroSlides.innerHTML = "";


    heroMovies.forEach(
        (movie, index) => {

            const slide =
                document.createElement("div");


            slide.className =
                "hero-slide";


            slide.style.backgroundImage =
                `url("${TMDB_IMAGE}original${movie.backdrop_path}")`;


            if (index === 0) {

                slide.classList.add(
                    "active"
                );

            }


            heroSlides.appendChild(
                slide
            );

        }
    );

}


// =====================================================
// CREATE HERO DOTS
// =====================================================

function createHeroDots() {

    if (!heroDots) {
        return;
    }


    heroDots.innerHTML = "";


    heroMovies.forEach(
        (_, index) => {

            const dot =
                document.createElement("button");


            dot.className =
                "hero-dot";


            dot.type =
                "button";


            dot.setAttribute(
                "aria-label",
                `Show movie ${index + 1}`
            );


            dot.addEventListener(
                "click",
                () => {

                    showHeroSlide(index);

                    restartHeroAutoPlay();

                }
            );


            heroDots.appendChild(
                dot
            );

        }
    );

}


// =====================================================
// SHOW HERO SLIDE
// =====================================================

function showHeroSlide(index) {

    if (!heroMovies.length) {
        return;
    }


    currentHero = index;


    const slides =
        heroSlides.querySelectorAll(
            ".hero-slide"
        );


    const dots =
        heroDots
            ? heroDots.querySelectorAll(
                ".hero-dot"
            )
            : [];


    slides.forEach(slide => {

        slide.classList.remove(
            "active"
        );

    });


    dots.forEach(dot => {

        dot.classList.remove(
            "active"
        );

    });


    if (slides[index]) {

        slides[index].classList.add(
            "active"
        );

    }


    if (dots[index]) {

        dots[index].classList.add(
            "active"
        );

    }


    updateHeroInfo(
        heroMovies[index]
    );

}


// =====================================================
// UPDATE HERO INFO
// =====================================================

function updateHeroInfo(movie) {

    if (!movie) {
        return;
    }


    // Movie name
    if (heroTitle) {

        heroTitle.textContent =
            movie.title ||
            movie.original_title ||
            "Untitled";

    }


    // Meta
    if (heroMeta) {

        const year =
            movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A";


        const rating =
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A";


        heroMeta.innerHTML = `

            <span>Movie</span>

            <span class="hero-separator">•</span>

            <span>${year}</span>

            <span class="hero-separator">•</span>

            <span>★ ${rating}</span>

        `;

    }


    // Description
    if (heroDescription) {

        heroDescription.textContent =
            movie.overview ||
            "Discover what's trending on SilverFrame.";

    }

}


// =====================================================
// NEXT HERO
// =====================================================

function nextHero() {

    if (!heroMovies.length) {
        return;
    }


    let next =
        currentHero + 1;


    if (
        next >=
        heroMovies.length
    ) {

        next = 0;

    }


    showHeroSlide(next);

}


// =====================================================
// PREVIOUS HERO
// =====================================================

function previousHero() {

    if (!heroMovies.length) {
        return;
    }


    let previous =
        currentHero - 1;


    if (previous < 0) {

        previous =
            heroMovies.length - 1;

    }


    showHeroSlide(previous);

}


// =====================================================
// HERO ARROWS
// =====================================================

if (heroNext) {

    heroNext.addEventListener(
        "click",
        () => {

            nextHero();

            restartHeroAutoPlay();

        }
    );

}


if (heroPrev) {

    heroPrev.addEventListener(
        "click",
        () => {

            previousHero();

            restartHeroAutoPlay();

        }
    );

}


// =====================================================
// HERO AUTO PLAY
// =====================================================

function startHeroAutoPlay() {

    clearInterval(
        heroTimer
    );


    heroTimer =
        setInterval(
            () => {

                nextHero();

            },
            6000
        );

}


function restartHeroAutoPlay() {

    startHeroAutoPlay();

}


// =====================================================
// START HERO
// =====================================================

loadHeroMovies();


// =====================================================
// SCROLL REVEAL
// =====================================================

const reveals =
    document.querySelectorAll(
        ".reveal"
    );


if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    reveals.forEach(element => {

        observer.observe(element);

    });

}


// =====================================================
// LOGIN + CREATE ACCOUNT
// =====================================================

const loginOverlay =
    document.getElementById("loginOverlay");

const openLogin =
    document.getElementById("openLogin");

const closeLogin =
    document.getElementById("closeLogin");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginSection =
    document.getElementById("loginSection");

const registerSection =
    document.getElementById("registerSection");

const showRegister =
    document.getElementById("showRegister");

const showLogin =
    document.getElementById("showLogin");

const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


// =====================================================
// OPEN LOGIN
// =====================================================

if (openLogin && loginOverlay) {

    openLogin.addEventListener(
        "click",
        () => {

            loginOverlay.classList.add(
                "active"
            );


            if (loginSection) {
                loginSection.style.display =
                    "block";
            }


            if (registerSection) {
                registerSection.style.display =
                    "none";
            }


            const usernameInput =
                document.getElementById(
                    "loginUsername"
                );


            if (usernameInput) {

                setTimeout(() => {

                    usernameInput.focus();

                }, 100);

            }

        }
    );

}


// =====================================================
// CLOSE LOGIN
// =====================================================

if (closeLogin && loginOverlay) {

    closeLogin.addEventListener(
        "click",
        () => {

            loginOverlay.classList.remove(
                "active"
            );

        }
    );

}


if (loginOverlay) {

    loginOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target === loginOverlay
            ) {

                loginOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// SHOW REGISTER
// =====================================================

if (showRegister) {

    showRegister.addEventListener(
        "click",
        () => {

            if (loginSection) {
                loginSection.style.display =
                    "none";
            }

            if (registerSection) {
                registerSection.style.display =
                    "block";
            }

            if (registerMessage) {
                registerMessage.textContent = "";
            }

        }
    );

}


// =====================================================
// SHOW LOGIN
// =====================================================

if (showLogin) {

    showLogin.addEventListener(
        "click",
        () => {

            if (registerSection) {
                registerSection.style.display =
                    "none";
            }

            if (loginSection) {
                loginSection.style.display =
                    "block";
            }

            if (loginMessage) {
                loginMessage.textContent = "";
            }

        }
    );

}


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const usernameInput =
                document.getElementById(
                    "loginUsername"
                );

            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;


            if (loginMessage) {

                loginMessage.textContent =
                    "Signing in...";

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (loginMessage) {

                    loginMessage.textContent =
                        data.message;

                }


                if (response.ok) {

                    localStorage.setItem(
                        "silverframeUser",
                        JSON.stringify(data.user)
                    );


                    passwordInput.value = "";


                    setTimeout(() => {

                        loginOverlay.classList.remove(
                            "active"
                        );

                        updateAuthUI();

                    }, 800);

                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                if (loginMessage) {

                    loginMessage.textContent =
                        "Unable to connect to server.";

                }

            }

        }
    );

}


// =====================================================
// CREATE ACCOUNT
// =====================================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const usernameInput =
                document.getElementById(
                    "registerUsername"
                );

            const passwordInput =
                document.getElementById(
                    "registerPassword"
                );


            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;


            if (registerMessage) {

                registerMessage.textContent =
                    "Creating account...";

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (registerMessage) {

                    registerMessage.textContent =
                        data.message;

                }


                if (response.ok) {

                    const createdUsername =
                        username;


                    registerForm.reset();


                    setTimeout(() => {

                        registerSection.style.display =
                            "none";

                        loginSection.style.display =
                            "block";


                        document.getElementById(
                            "loginUsername"
                        ).value =
                            createdUsername;


                        document.getElementById(
                            "loginPassword"
                        ).value = "";


                        registerMessage.textContent =
                            "";

                    }, 1000);

                }

            } catch (error) {

                console.error(
                    "Register error:",
                    error
                );


                if (registerMessage) {

                    registerMessage.textContent =
                        "Unable to connect to server.";

                }

            }

        }
    );

}


// =====================================================
// AUTH UI
// =====================================================

const profileBtn =
    document.getElementById("profileBtn");

const profileInitial =
    document.getElementById("profileInitial");


function updateAuthUI() {

    const savedUser =
        localStorage.getItem(
            "silverframeUser"
        );


    if (savedUser) {

        const user =
            JSON.parse(savedUser);


        if (openLogin) {

            openLogin.style.display =
                "none";

        }


        if (profileBtn) {

            profileBtn.style.display =
                "flex";

        }


        if (
            profileInitial &&
            user.username
        ) {

            profileInitial.textContent =
                user.username
                    .charAt(0)
                    .toUpperCase();

        }

    } else {

        if (openLogin) {

            openLogin.style.display =
                "block";

        }


        if (profileBtn) {

            profileBtn.style.display =
                "none";

        }

    }

}


// =====================================================
// PROFILE
// =====================================================

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "profile.html";

        }
    );

}


// =====================================================
// CHECK LOGIN
// =====================================================

updateAuthUI();


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "silverframeUser"
            );


            window.location.href =
                "index.html";

        }
    );

}


function removeMovieFromList(movieId) {

    const list =
        JSON.parse(
            localStorage.getItem(
                "silverframeWatchlist"
            )
        ) || [];

    const updatedList =
        list.filter(
            movie => movie.id !== movieId
        );

    localStorage.setItem(
        "silverframeWatchlist",
        JSON.stringify(updatedList)
    );

    if (typeof renderLists === "function") {
        renderLists();
    }

}

// =====================================================
// LISTS PAGE
// =====================================================
const listsContainer = document.getElementById("listsContainer");
const listModal = document.getElementById("listModal");
const createListBtn = document.getElementById("createListBtn");
const closeListModal = document.getElementById("closeListModal");
const cancelListBtn = document.getElementById("cancelListBtn");
const createListForm = document.getElementById("createListForm");
const listNameInput = document.getElementById("listNameInput");

function readStoredLists() {
    try { return JSON.parse(localStorage.getItem("silverframeLists")) || []; }
    catch (error) { return []; }
}

function readWatchlist() {
    try { return JSON.parse(localStorage.getItem("silverframeWatchlist")) || []; }
    catch (error) { return []; }
}

function setListModal(isOpen) {
    if (!listModal) return;
    listModal.classList.toggle("active", isOpen);
    listModal.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen && listNameInput) {
        listNameInput.value = "";
        setTimeout(() => listNameInput.focus(), 0);
    }
}

function listCardMarkup(list, index, isWatchlist) {
    const films = isWatchlist ? readWatchlist() : (list.films || []);
    const covers = films.slice(0, 3).map(film => film.poster_path ? `<img src="${TMDB_IMAGE}w342${film.poster_path}" alt="">` : "").join("");
    const emptyState = covers || `<span class="list-monogram">${isWatchlist ? "S" : list.name.charAt(0).toUpperCase()}</span>`;
    return `<article class="list-card ${isWatchlist ? "watchlist-card" : ""}" style="--list-index: ${index}"><div class="list-cover" aria-hidden="true">${emptyState}</div><div class="list-card-body"><div><p class="list-kind">${isWatchlist ? "Default list" : "Collection"}</p><h3>${isWatchlist ? "Watchlist" : list.name}</h3><p class="list-count">${films.length} ${films.length === 1 ? "film" : "films"}</p></div>${isWatchlist ? `<a class="list-open-link" href="films.html">Explore films <span>→</span></a>` : `<button class="delete-list-button" type="button" data-list-id="${list.id}" aria-label="Delete ${list.name}">Delete</button>`}</div></article>`;
}

function renderLists() {
    if (!listsContainer) return;
    const lists = readStoredLists();
    const watchlist = readWatchlist();
    const listCount = document.getElementById("listCount");
    const savedFilmCount = document.getElementById("savedFilmCount");
    if (listCount) listCount.textContent = lists.length + 1;
    if (savedFilmCount) savedFilmCount.textContent = watchlist.length;
    listsContainer.innerHTML = listCardMarkup({}, 0, true) + lists.map((list, index) => listCardMarkup(list, index + 1, false)).join("");
    listsContainer.querySelectorAll(".delete-list-button").forEach(button => button.addEventListener("click", () => {
        localStorage.setItem("silverframeLists", JSON.stringify(readStoredLists().filter(list => list.id !== button.dataset.listId)));
        renderLists();
    }));
}

if (createListBtn) createListBtn.addEventListener("click", () => setListModal(true));
if (closeListModal) closeListModal.addEventListener("click", () => setListModal(false));
if (cancelListBtn) cancelListBtn.addEventListener("click", () => setListModal(false));
if (listModal) listModal.addEventListener("click", event => { if (event.target === listModal) setListModal(false); });
if (createListForm) createListForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = listNameInput.value.trim();
    if (!name) return;
    const lists = readStoredLists();
    lists.unshift({ id: String(Date.now()), name, films: [] });
    localStorage.setItem("silverframeLists", JSON.stringify(lists));
    setListModal(false);
    renderLists();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && listModal && listModal.classList.contains("active")) setListModal(false);
});
renderLists();
