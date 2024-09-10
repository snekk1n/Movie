import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ActorPage = () => {
    const { id } = useParams();
    const [actor, setActor] = useState(null);

    useEffect(() => {
        axios.get(`https://api.themoviedb.org/3/person/${id}?api_key=3ffc3134c35fc52da915381e91b8adb4&language=ru-RUS&append_to_response=combined_credits`)
            .then(response => {
                setActor(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [id]);

    if (!actor) {
        return <div>Загрузка...</div>;
    }

    const bestMovies = actor.combined_credits.cast
        .filter(item => item.media_type === 'movie')
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5);

    const bestSeries = actor.combined_credits.cast
        .filter(item => item.media_type === 'tv')
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5);

    return (
        <div className="container mt-5">
            <div className="row text-white">
                <div className="col-md-3 text-center">
                    <img src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`} className="img-fluid rounded mb-3" alt={actor.name} />
                    <button className="btn btn-outline-light mb-3">
                        <i className="bi bi-bookmark-plus"></i> Добавить в папку
                    </button>
                </div>

                <div className="col-md-6">
                    <h1>{actor.name}</h1>
                    <p className="text-secondary">{actor.name}</p>
                    <button className="btn btn-outline-light">
                        <i className="bi bi-heart"></i> Любимая звезда
                    </button>
                    <h4 className="mt-4">О персоне</h4>
                    <p><strong>Карьера:</strong> {actor.known_for_department}</p>
                    <p><strong>Дата рождения:</strong> {new Date(actor.birthday).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Место рождения:</strong> {actor.place_of_birth}</p>
                    <p><strong>Всего фильмов:</strong> {actor.combined_credits.cast.length}</p>
                </div>

                <div className="col-md-3">
                    <h4>Лучшие фильмы</h4>
                    <ul className="list-unstyled">
                        {bestMovies.map(movie => (
                            <li key={movie.id}>
                                <Link to={`/movie/${movie.id}`} className="text-white text-decoration-none">
                                    {movie.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <h4 className="mt-4">Лучшие сериалы</h4>
                    <ul className="list-unstyled">
                        {bestSeries.map(series => (
                            <li key={series.id}>
                                <Link to={`/movie/${series.id}`} className="text-white text-decoration-none">
                                    {series.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ActorPage;
