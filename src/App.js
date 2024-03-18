/** @format */
import MovieCard from "./components/MovieCard";
import { useEffect, useState, useRef } from "react";
import "./App.css";
import axios from "axios";
import YouTube from "react-youtube";
function App() {
  const IMAGE_PATH = "https://image.tmdb.org/t/p/w1280";
  const API_URL = "https://api.themoviedb.org/3";
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState({});
  const [searchKey, setSearchKey] = useState("");
  const [playTrailer, setPlayTrailer] = useState(false);
  const searchRef = useRef(null);
  const fetchMovies = async (searchKey) => {
    const type = searchKey ? "search" : "discover";
    const {
      data: { results },
    } = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        query: searchKey,
      },
    });
    setMovies(results);
    await selectMovie(results[0]);
  };

  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        append_to_response: "videos",
      },
    });
    return data;
  };

  const selectMovie = async (movie) => {
    setPlayTrailer(false);
    const data = await fetchMovie(movie.id);

    setSelectedMovie(data);
  };

  useEffect(() => {
    fetchMovies();
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === "k") {
        // Focus on the search input when Ctrl+K is pressed
        searchRef.current.focus();
        event.preventDefault(); // Prevent default behavior of Ctrl+K
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const renderMovies = () =>
    movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} selectMovie={selectMovie} />
    ));

  const searchMovies = (e) => {
    e.preventDefault();
    fetchMovies(searchKey);
  };

  const renderTrailer = () => {
    const trailer = selectedMovie.videos.results.find(
      (vid) => vid.name === "Official Trailer"
    );
    const key = trailer ? trailer.key : selectedMovie.videos.results[0].key;
    return (
      <YouTube
        videoId={key}
        containerClassName={"youtube-container"}
        opts={{
          width: "100%",

          playerVars: {
            autoplay: 1,
            controls: 0,
          },
        }}
      />
    );
  };
  return (
    <div className="App">
      <header className={"header"}>
        <div className={"header-content max-center"}>
          <h1>Movie Trailer App</h1>
          <form onSubmit={searchMovies}>
            <input
              ref={searchRef}
              type="text"
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Search Movies..."
              style={{ borderRadius: "5px", padding: "5px" }}
            />
            <button type={"submit"} style={{ padding: "5px" }}>
              Search
            </button>
          </form>
        </div>
      </header>
      <div
        className="hero"
        style={{
          backgroundImage: `url(${IMAGE_PATH}${selectedMovie.backdrop_path})`,
        }}
      >
        <div className="hero-content max-center">
          {playTrailer ? (
            <button
              className={"button button-close"}
              onClick={() => setPlayTrailer(false)}
            >
              Close
            </button>
          ) : null}

          <button className={"button"} onClick={() => setPlayTrailer(true)}>
            Play Trailer
          </button>
          <h1 className={"hero-title"}>{selectedMovie.title}</h1>
          {selectedMovie.overview ? (
            <p className={"hero-overview"}> {selectedMovie.overview}</p>
          ) : null}
        </div>
      </div>
      {selectedMovie.videos && playTrailer ? renderTrailer() : null}
      <div className="container max-center">{renderMovies()}</div>
    </div>
  );
}

export default App;
