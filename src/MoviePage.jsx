import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

const MoviePage = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=3ffc3134c35fc52da915381e91b8adb4&language=ru-RUS&append_to_response=credits,videos`)
            .then(response => {
                setMovie(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [id]);

    if (!movie) {
        return <div>Загрузка...</div>;
    }

    const toggleBookmark = (id) => {
    };

    const getRatingColor = (rating) => {
        if (rating > 7) {
            return '#3bb33b';
        } else if (rating < 4) {
            return 'red';
        } else {
            return '#777';
        }
    };

    const director = movie.credits.crew.find(member => member.job === 'Director');
    const actors = movie.credits.cast.slice(0, 10);
    const trailer = movie.videos.results.find(video => video.type === 'Trailer');

    return (
        <div className="container mt-5">
            <div className="row text-white">
                <div className="col-md-3">
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="img-fluid rounded-start mb-3" alt={movie.title} />
                    {trailer && (
                        <div>
                            <h6>{trailer.name}</h6>
                            <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                                <img src={`https://img.youtube.com/vi/${trailer.key}/0.jpg`} className="img-fluid rounded" alt="Трейлер" />
                            </a>
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <h1>{movie.title} ({new Date(movie.release_date).getFullYear()})</h1>
                    <p className="text-secondary">{movie.original_title}</p>
                    <button
                        className="btn btn-light"
                        onClick={() => toggleBookmark(movie.id)}
                    >
                        {movie.isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                    <div className="mb-3">
                        <h4>О фильме</h4>
                        <p><strong>Год производства:</strong> {new Date(movie.release_date).getFullYear()}</p>
                        <p><strong>Страна:</strong> {movie.production_countries.map(country => country.name).join(', ')}
                        </p>
                        <p><strong>Жанр:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
                        <p><strong>Слоган:</strong> {movie.tagline || '—'}</p>
                        <p><strong>Режиссер:</strong> {director ? director.name : 'Неизвестно'}</p>
                        <p>
                            <strong>Сценарий:</strong> {movie.credits.crew.filter(member => member.job === 'Screenplay').map(screenwriter => screenwriter.name).join(', ') || 'Неизвестно'}
                        </p>
                        <p>
                            <strong>Продюсер:</strong> {movie.credits.crew.filter(member => member.job === 'Producer').map(producer => producer.name).join(', ') || 'Неизвестно'}
                        </p>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="d-flex flex-column">
                        <span className="fs-3"
                              style={{ color: getRatingColor(movie.vote_average) }}>{movie.vote_average.toFixed(1)}</span>
                        <span className="ms">{movie.vote_count} оценок</span>
                    </div>
                    <h4>В главных ролях</h4>
                    <ul className="list-unstyled">
                        {actors.map(actor => (
                            <li key={actor.id}>
                                <Link to={`/actor/${actor.id}`} className="link-light">
                                    {actor.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MoviePage;
