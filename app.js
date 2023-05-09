const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

//Initialize database and server
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`Db error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//converting object to response object

const convertDbObject = (eachObject) => {
  return {
    movieId: eachObject.movie_id,
    directorId: eachObject.director_id,
    movieName: eachObject.movie_name,
    leadActor: eachObject.lead_actor,
  };
};

//API'S for movie table//

//1 API for getting all movies from movie table
app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT movie_name FROM movie;`;
  const moviesArray = await db.all(moviesQuery);
  const moviesArrayResponse = moviesArray.map((eachObject) =>
    convertDbObject(eachObject)
  );
  response.send(moviesArrayResponse);
});

//2 API for adding in movie table
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieAddQuery = `INSERT INTO movie (directorId,movieName,leadActor) VALUES (${directorId},"${movieName}","${leadActor}");`;
  const movieResponse = await db.run(movieAddQuery);
  response.send("Movie Successfully Added");
});

//3 API for getting single movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movieArray = await db.get(movieQuery);
  response.send(convertDbObject(movieArray));
});

//4 API for updating movie table
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieQuery = `UPDATE movie SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}' WHERE movie_id=${movieId};`;
  await db.run(movieQuery);
  response.send("Movie Details Updated");
});

//5 API for deleting single movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `DELETE  FROM movie WHERE movie_id=${movieId};`;
  const movieArray = await db.run(movieQuery);
  response.send("Movie Removed");
});

//API's fpr director table//

//converting object to response object

const convertDirectDbObject = (eachObject) => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  };
};

//6 API for getting all directors from director table
app.get("/directors/", async (request, response) => {
  const directorsQuery = `SELECT * FROM director;`;
  const directorsArray = await db.all(directorsQuery);
  const directorsResponseArray = directorsArray.map((eachObject) =>
    convertDirectDbObject(eachObject)
  );
  response.send(directorsResponseArray);
});

//7 API for getting list of all movies names directed by specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const listOfMoviesQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const listOfMoviesArray = await db.all(listOfMoviesQuery);
  const directorMovies = listOfMoviesArray.map((eachObject) =>
    convertDbObject(eachObject)
  );
  response.send(directorMovies);
});

module.exports = app;
