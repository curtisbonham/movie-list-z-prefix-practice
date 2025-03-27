import React, { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMovies, setFilteredMovies] = useState([])
  const [newMovie, setNewMovie] = useState('')
  const [filter, setFilter] = useState('all')
  const [userMovies, setUserMovies] = useState(() => {
    const savedMovies = localStorage.getItem('userMovies')
    return savedMovies ? JSON.parse(savedMovies) : []
  })
  const [selectedMovie, setSelectedMovie] = useState(null)

  //Saves the movies to local storage
  useEffect(() => {
    localStorage.setItem('userMovies', JSON.stringify(userMovies))
  }, [userMovies])

  //Fetches the movie data from the server (if not in local storage)
  useEffect(() => {
    async function fetchMovies() {
      const response = await fetch('http://localhost:3001/movies')
      const data = await response.json()

      const moviesWithWatched = data.map((movie) => {
        const existingMovie = userMovies.find((m) => m.id === movie.id)
        return existingMovie ? existingMovie : { ...movie, watched: false }
      })
      setUserMovies(moviesWithWatched)
      setFilteredMovies(moviesWithWatched)
    }
    fetchMovies()
  }, [newMovie])

  //Handles the filter function
  useEffect(() => {
    if (filter === 'all') {
      setFilteredMovies(userMovies)
    } else if (filter === 'watched') {
      setFilteredMovies(userMovies.filter((movie) => movie.watched))
    } else if (filter === 'unwatched') {
      setFilteredMovies(userMovies.filter((movie) => !movie.watched))
    }
  }, [filter, userMovies])

  //Handles the search function
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value === '') {
      setFilteredMovies(userMovies)
    } else {
      const filtered = userMovies.filter((movie) =>
        movie.title.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredMovies(filtered)
    }
  }

  //Handles adding a new movie by the user
  const handleAddMovie = async () => {
    if (newMovie) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(newMovie)}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
            },
          }
        )

        const dbData = await response.json()

        if (dbData.results && dbData.results.length > 0) {
          const movieDetails = dbData.results[0]

          const localResponse = await fetch('http://localhost:3001/movies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: movieDetails.title,
              releaseDate: movieDetails.release_date,
              overview: movieDetails.overview,
              posterPath: movieDetails.poster_path,
              watched: false,
            }),
          })

          const data = await localResponse.json()
          const newToggledMovie = { ...data, watched: false }
          setUserMovies((prevMovies) => [...prevMovies, newToggledMovie])
          setFilteredMovies((prevMovies) => [...prevMovies, newToggledMovie])
          setNewMovie('')
        } else {
          alert('Movie not found on TMDb')
        }
      } catch (error) {
        console.error('Error adding movie:', error)
        alert('Failed to fetch movie details. Please try again.')
      }
    }
  }

  //Handles deleting a movie by the user
  const handleDeleteMovie = async (id) => {
    await fetch(`http://localhost:3001/movies/${id}`, {
      method: 'DELETE',
    })
    setUserMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id))
    setFilteredMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id))
  }

  //Handles toggling between watched and unwatched movies
  const toggleWatched = (id) => {
    setUserMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === id ? { ...movie, watched: !movie.watched } : movie
      )
    )
  }

  //Handles clicking the title
  const handleTitleClick = (movie) => {
    setSelectedMovie(movie)
  }

  return (
    <>
      <div>
        <h2>User Added Movies</h2>
        <input
          type="text"
          placeholder="Search for a movie"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          placeholder="Add a new movie"
          value={newMovie}
          onChange={(e) => setNewMovie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddMovie()
            }
          }}
        />
        <button onClick={handleAddMovie}>Add Movie</button>
        <div>
          <button onClick={() => setFilter('all')}>All Movies</button>
          <button onClick={() => setFilter('watched')}>Watched Movies</button>
          <button onClick={() => setFilter('unwatched')}>Unwatched Movies</button>
        </div>
        <div>
          {filteredMovies?.map((movie, index) => (
            <div key={index}>
              <h2
                style={{ cursor: 'pointer', color: 'black' }}
                onClick={() => handleTitleClick(movie)}
              >
                {movie.title}
              </h2>
            </div>
          ))}
        </div>
        {selectedMovie && (
          <div
            style={{
              border: '1px solid black',
              padding: '10px',
              marginTop: '20px',
            }}
          >
            <h3>Movie Details</h3>
            <p>
              <strong>Title: </strong>
              {selectedMovie.title}
            </p>
            <p>
              <strong>Release Date: </strong>
              {selectedMovie.releaseDate}
            </p>
            <p>
              <strong>Overview: </strong>
              {selectedMovie.overview}
            </p>
            {selectedMovie.posterPath && (
              <img
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.posterPath}`}
                alt={selectedMovie.title}
                style={{ width: '200px', height: '300px' }}
              />
            )}
            <p>
              <strong>Status: </strong>
              {selectedMovie.watched ? 'Watched' : 'Unwatched'}
            </p>
            <button onClick={() => setSelectedMovie(null)}>Close</button>
            <button onClick={() => toggleWatched(selectedMovie.id)}>
              {selectedMovie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
            </button>
            <button onClick={() => handleDeleteMovie(selectedMovie.id)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </>
  )
}


