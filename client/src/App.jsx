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

//Saves the movies to local storage
useEffect(()=> {
  localStorage.setItem('userMovies', JSON.stringify(userMovies))
}, [userMovies])

//Fetches the movie data from the server (if not in local storage)
  useEffect(() => {
    async function fetchMovies() {
      const response = await fetch ('http://localhost:3001/movies')
      const data = await response.json()

      const moviesWithWatched = data.map((movie) => {
        const existingMovie = userMovies.find((m) => m.id === movie.id)
        return existingMovie ? existingMovie : {...movie, watched: false}
      })
      setUserMovies(moviesWithWatched)
      setFilteredMovies(moviesWithWatched)

    }
    fetchMovies()
  }, [newMovie])

  //Handles the filter function
  useEffect(()=> {
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
      const response = await fetch('http://localhost:3001/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({title: newMovie})
      })
      const data = await response.json()
      const newToggledMovie = {...data, watched: false}
      setUserMovies((prevMovies) => [...prevMovies, newToggledMovie])
      setFilteredMovies((prevMovies) => [...prevMovies, newToggledMovie])
      setNewMovie('')
    }
  }

  //Handles deleting a movie by the user
  const handleDeleteMovie = async (id) => {
    await fetch(`http://localhost:3001/movies/${id}`, {
      method: 'DELETE',
    })
    setUserMovies((prevMovies) => prevMovies.filter(movie => movie.id !== id))
    setFilteredMovies((prevMovies) => prevMovies.filter(movie => movie.id !== id))
  }

  //Handles toggling between watched and unwatched movies
  const toggleWatched = (id) => {
    setUserMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === id ? { ...movie, watched: !movie.watched } : movie
      )
    )
    // setFilteredMovies((prevMovies) =>
    //   prevMovies.map((movie) =>
    //     movie.id === id ? { ...movie, watched: !movie.watched } : movie
    //   )
    // )
  }

  return (
<>
    <div>

 <h2>User Added Movies</h2>
    <input
        type='text'
        placeholder='Search for a movie'
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <input
        type='text'
        placeholder='Add a new movie'
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
          <h2>
            {movie.title}{' '}
            <button onClick={() => handleDeleteMovie(movie.id)}>Delete</button>
            <button onClick={() => toggleWatched(movie.id)}>
              {movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
              </button>
            </h2>
            <p>Status: {movie.watched ? 'Watched' : 'Unwatched'}</p>
        </div>
      ))
      }
    </div>
    </div>
  </>
  )
  }


