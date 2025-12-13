import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating.jsx";
import { useMovies } from "./useMovies.js";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const NavBar = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Showey</h1>
    </div>
  );
};

const Search = ({ query, setQuery }) => {
  const inputElement = useRef(null);
  useEffect(() => {
    const callBack = (e) => {
      if (document.activeElement === inputElement.current) return;
      if (e.code === "Enter") {
        inputElement.current.focus();
        setQuery("");
      }
    };
    if (document.activeElement === inputElement.current) return;
    document.addEventListener("keydown", callBack);
    return () => document.removeEventListener("keydown", callBack);
  }, [setQuery]);
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      id="search"
      ref={inputElement}
    />
  );
};

const MovieNums = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
};
const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

const MovieList = ({ movies, onSelectMovie }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
};

const Movie = ({ movie, onSelectMovie }) => {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
};

const MovieDetails = ({ selectedId, onCloseMovie, onAddWatchedMovie }) => {
  const [movie, SetMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const KEY = "bafc29c1";

  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const handleAdd = () => {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ")[0]),
      imdbRating: Number(imdbRating),
      userRating,
      userRatingDecision: countRef.current,
    };
    onAddWatchedMovie(newWatchedMovie);
    onCloseMovie();
  };
  useEffect(() => {
    const callBack = (e) => {
      if (e.code === "Escape" || e.code === "Backspace") {
        onCloseMovie();
      }
    };
    document.addEventListener("keydown", callBack);
    return () => document.removeEventListener("keydown", callBack);
  }, [onCloseMovie]);
  useEffect(() => {
    const getMovieDetails = async () => {
      setIsLoading(true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      SetMovie(data);
      setIsLoading(false);
    };
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => (document.title = "Showey");
  }, [title]);
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <>
                <StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                />
                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                )}
              </>
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}{" "}
    </div>
  );
};

const WatchedMovieList = ({ movies, onDeleteWatchedMovie }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <h3>{movie.title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
            <button
              className="btn-delete"
              onClick={() => onDeleteWatchedMovie(movie.imdbID)}
            >
              X
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

const Summary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
};
const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

const Loader = () => {
  return <p className="loader">Loading...</p>;
};

const ErrorMessage = ({ msg }) => {
  return (
    <p className="error">
      <span>⛔</span>
      {msg}
    </p>
  );
};

export default function App() {
  const [watched, setWatched] = useState(() => {
    const storedWatchedValue = JSON.parse(localStorage.getItem("watched"));
    return storedWatchedValue;
  });

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { movies, isLoading, error } = useMovies(query);

  const handleSelectedMovie = (id) => {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  };

  const handleCloseMovie = () => {
    setSelectedId(null);
  };

  const handleAddWatchedMovie = (movie) => {
    setWatched((watched) => [...watched, movie]);
  };
  const handleDeleteWatchedMovie = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <MovieNums movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage msg={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectedMovie} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList
                movies={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
