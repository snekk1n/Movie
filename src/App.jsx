import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MoviePage from './MoviePage';
import ActorPage from './ActorPage';
import { FaRegBookmark, FaBookmark, FaRegStar, FaStar, FaEllipsisH } from 'react-icons/fa';

const App = () => {
    const [data, setData] = useState([]);
    const [activeRating, setActiveRating] = useState(null);

    useEffect(() => {
        axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=3ffc3134c35fc52da915381e91b8adb4&language=ru-RUS`)
            .then(async response => {
                const movies = await Promise.all(
                    response.data.results.map(async (movie) => {
                        const movieDetails = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=3ffc3134c35fc52da915381e91b8adb4&language=ru-RUS&append_to_response=credits`);
                        const videoDetails = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=3ffc3134c35fc52da915381e91b8adb4&language=ru-RUS`);

                        const trailer = videoDetails.data.results.length > 0
                            ? `https://www.youtube.com/watch?v=${videoDetails.data.results[0].key}`
                            : null;

                        const director = movieDetails.data.credits.crew.find(member => member.job === 'Director');
                        const actors = movieDetails.data.credits.cast.slice(0, 2);

                        return {
                            ...movie,
                            runtime: movieDetails.data.runtime,
                            genres: movieDetails.data.genres.length > 0 ? movieDetails.data.genres[0].name : 'Неизвестно',
                            country: movieDetails.data.production_countries.length > 0 ? translateCountry(movieDetails.data.production_countries[0].iso_3166_1) : 'Неизвестно',
                            isBookmarked: false,
                            userRating: 0,
                            trailer: trailer,
                            director: director ? director.name : 'Неизвестно',
                            actors: actors.length > 0 ? actors.map(actor => actor.name).join(', ') : 'Неизвестно'
                        };
                    })
                );
                setData(movies);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    const getRatingColor = (rating) => {
        if (rating > 7) {
            return '#3bb33b';
        } else if (rating < 4) {
            return 'red';
        } else {
            return '#777';
        }
    };

    const formatDuration = (runtime) => {
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours} ч ${minutes} мин`;
    };

    const translateCountry = (countryCode) => {
        const countries = {
            'US': 'США',
            'HK': 'Гонконг, Китай',
            'NG': 'Нигерия',
            'GB': 'Великобритания',
            'AU': 'Австралия',
            'FR': 'Франция',
            'AR': 'Аргентина',
            'IT': 'Италия',
        };
        return countries[countryCode] || countryCode;
    };

    const toggleBookmark = (id) => {
        setData(data.map(movie =>
            movie.id === id ? { ...movie, isBookmarked: !movie.isBookmarked } : movie
        ));
    };

    const setUserRating = (id, rating) => {
        setData(data.map(movie =>
            movie.id === id ? { ...movie, userRating: rating } : movie
        ));
        setActiveRating(null);
    };

    return (
        <Router>
            <div style={{display: "flex", flexDirection: "column", alignItems: "end"}} className={'container mt-5'}>
                <Routes>
                    <Route path="/" element={
                        data.map(movie => (
                            <div key={movie.id} style={{maxWidth: 800}} className="card mb-3">
                                <div className="row g-0">
                                    <div className="col-md-2">
                                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                             className="img-fluid rounded-start" alt={movie.title}/>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                <Link to={`/movie/${movie.id}`} className="link-dark">
                                                    {movie.title}
                                                </Link>
                                            </h5>
                                            <p className="card-text">
                                                {movie.original_title}, {movie.release_date.split('-')[0]}, {formatDuration(movie.runtime)}
                                            </p>
                                            <small className="card-text text-secondary">
                                                {movie.country} • {movie.genres} Режиссёр: {movie.director} <br/> В
                                                ролях: {movie.actors}
                                            </small>
                                            {movie.trailer && (
                                                <div className={'mt-2'}><a href={movie.trailer} className="btn btn-light" target="_blank"
                                                                           rel="noopener noreferrer">
                                                    Трейлер
                                                </a></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-body col-md-1">
                                        <h5 className={`mb-1`}
                                            style={{fontSize: '1.5rem', color: getRatingColor(movie.vote_average)}}>
                                            {movie.vote_average.toFixed(1)}
                                        </h5>
                                        <small className="text-muted">{movie.vote_count}</small>
                                    </div>
                                    <div className="card-body col-md-3">
                                        <button
                                            className="btn btn-light"
                                            onClick={() => toggleBookmark(movie.id)}
                                        >
                                            {movie.isBookmarked ? <FaBookmark/> : <FaRegBookmark/>}
                                        </button>
                                        <button
                                            className="btn btn-light position-relative ms-2"
                                            onClick={() => setActiveRating(activeRating === movie.id ? null : movie.id)}
                                        >
                                            {movie.userRating > 0 ?
                                                <FaStar style={{color: getRatingColor(movie.userRating)}}/> :
                                                <FaRegStar/>}
                                        </button>
                                        {activeRating === movie.id && (
                                            <div className="position-absolute" style={{
                                                top: '30%',
                                                right: '0',
                                                backgroundColor: 'white',
                                                zIndex: 1000
                                            }}>
                                                {[...Array(10)].map((_, i) => (
                                                    <button
                                                        key={i + 1}
                                                        className="btn"
                                                        onClick={() => setUserRating(movie.id, i + 1)}
                                                        style={{color: getRatingColor(i + 1), fontSize: '1.25rem'}}
                                                    >
                                                        <FaStar/>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            className="btn btn-light ms-2"
                                        >
                                            <FaEllipsisH/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }/>
                    <Route path="/movie/:id" element={<MoviePage />} />
                    <Route path="/actor/:id" element={<ActorPage />} /> {/* Новый маршрут для страницы актера */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
