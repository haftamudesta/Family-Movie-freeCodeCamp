import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";

import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = express.Router();

router.use(authenticate);

function resolveUserId(param) {
  return isNaN(param) ? param : Number(param);
}

function getWatchlistForUser(param) {
  const userId = resolveUserId(param);

  let watchlist = getWatchlist(userId);

  if (watchlist === null) {
    watchlist = getWatchlist(String(param));
  }

  return watchlist;
}

router.get("/:userId", (req, res) => {
  try {
    const watchlist = getWatchlistForUser(req.params.userId);

    if (watchlist === null) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(200).json(watchlist);
  } catch (error) {
    console.error("Get watchlist error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
});

router.post("/:userId/movies", authorizeModification, (req, res) => {
  try {
    const userId = resolveUserId(req.params.userId);

    let newMovie = addMovie(userId, req.body);

    if (newMovie === null) {
      newMovie = addMovie(String(req.params.userId), req.body);
    }

    if (newMovie === null) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(201).json(newMovie);
  } catch (error) {
    console.error("Add movie error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
});

router.put("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  try {
    const userId = resolveUserId(req.params.userId);
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId < 1) {
      return res.status(400).json({
        error: "Invalid movie ID.",
      });
    }

    let updatedMovie = updateMovie(userId, movieId, req.body);

    if (updatedMovie === null) {
      updatedMovie = updateMovie(String(req.params.userId), movieId, req.body);
    }

    if (updatedMovie === null) {
      return res.status(404).json({
        error: "Movie or user not found.",
      });
    }

    return res.status(200).json(updatedMovie);
  } catch (error) {
    console.error("Update movie error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
});

router.delete("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  try {
    const userId = resolveUserId(req.params.userId);
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId < 1) {
      return res.status(400).json({
        error: "Invalid movie ID.",
      });
    }

    let result = deleteMovie(userId, movieId);

    if (result === null) {
      result = deleteMovie(String(req.params.userId), movieId);
    }

    if (result === null) {
      return res.status(404).json({
        error: "Movie or user not found.",
      });
    }

    return res.status(200).json({
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("Delete movie error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
});

export default router;
