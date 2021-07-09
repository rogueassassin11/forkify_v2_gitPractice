/*********************************************/
/*  USER STORY -> As a user, I want [action] so  that [benefit]
    
  MVC ARCHITECTURE
  -> structure - organization of code
  -> maintainability - can be easily changed
  -> expandability - to easily add new features

  COMPONENTS OF ARCHITECTURE
  -> Business logic - code that solves the business problem
  -> State - stores all the data about the application / single source of truth kept in sync with UI
  -> HTTP Library - responsible for making and receiving AJAX requests
  -> Application logic (Router) - implementation of the application
  -> Presentation logic (UI layer) - visible part of the application / displays application state

  MODEL
  -> Business logic / state / http library

  VIEW
  -> Presentation logic

  CONTROLLER
  -> application logic / bridge between view and model
  -> dispatches tasks to model and view

  PUBLISHER
  -> code that knows when to react

  SUBSRIBER
  -> Code that wants to react

  PUBLISHER-SUBSCRIBER
  -> subscribe to publisher by passing in subscriber function
  -> event should be handled in the controller
  -> event should be listened for in the view

  Unique API Key - 7dbf5b75-2ed4-406c-a9ed-fb4b3cf0e4fb

  FORKIFY API Docu = https://forkify-api.herokuapp.com/v2
/*********************************************/
//import from model and view
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; //polyfill
import 'regenerator-runtime/runtime'; //polyfill async/await

//hot module reloading from parcel
// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    //get ID from the hash
    const id = window.location.hash.slice(1);

    //guard clause if there is no ID from hash
    if (!id) return;

    //render spinner
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1. Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2. Loading recipe
    await model.loadRecipe(id);

    //3. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlSearchResults = async function () {
  try {
    // 1.) get query from search field
    const query = searchView.getQuery();
    if (!query) return;

    //render spinner in searching
    resultsView.renderSpinner();

    // 2.) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
controlSearchResults();

//controlling pagination
const controlPagination = function (goToPage) {
  console.log(goToPage);

  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

// updating servings
const controlServings = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);

  // update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

// adding new bookmark
const controlAddBookmark = function () {
  // 1. Add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2. Update recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

// adding recipe
const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render the new recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('!!!', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
