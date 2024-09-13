import { useState, useEffect } from "react";
import React from "react";
import Header from "./components/Header";
import RecipeExcerpt from "./components/RecipeExcerpt";
import RecipeFull from "./components/RecipeFull";
import NewRecipeForm from "./components/NewRecipeForm";
import { Loader } from "react-feather";
import "./App.css";
import { render } from "@testing-library/react";
import displayToast from "./helpers/toastHelper.js";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    servings: 1, // conservative default
    description: "",
    image_url: "https://images.pexels.com/photos/9986228/pexels-photo-9986228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" //default
  });
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const updateSearchTerm = (text) => {
    setSearchTerm(text);
  }

  const clearSearchTerm = () => {
    setSearchTerm("");
  }

  const handleSearch = () => {
    const searchResults = recipes.filter((recipe) => {
      const valuesToSearch = [recipe.title, recipe.ingredients, recipe.description];
      return valuesToSearch.some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return searchResults;
  };

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recipes");
      if (response.ok) {
        const results = await response.json();
        setRecipes(results);
      } else {
        displayToast("Could not fetch recipes", "success")
      }
    } catch (e) {
      displayToast(`There was an error in fetching the recipes`, "error")
    };
    setLoading(false);
  };

  useEffect(() => { fetchAllRecipes(); }, []);

  const handleNewRecipe = async (e, newRecipe) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe)
      });

      if (response.ok) {
        const data = await response.json();

        setRecipes([...recipes, data.recipe])

        displayToast("Recipe added", "success");

        setShowNewRecipeForm(false);
        setNewRecipe({
          title: "",
          ingredients: "",
          instructions: "",
          servings: 1, // conservative default
          description: "",
          image_url: "https://images.pexels.com/photos/9986228/pexels-photo-9986228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" //default
        })

      } else {
        displayToast("Oops - could not add recipe!", "error")
      }
    } catch (error) {
      displayToast("Error occured during the request: ", "error")
    }
  };

  const handleUpdateRecipe = async (e, selectedRecipe) => {
    e.preventDefault();
    const { id } = selectedRecipe;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRecipe)
      });

      if (response.ok) {
        const data = await response.json();

        setRecipes(
          recipes.map((recipe) => {
            if (recipe.id == id) {
              return data.recipe;
            }
            return recipe;
          }))

        displayToast("Recipe updated", "success");
      } else {
        displayToast("Error updating recipe", "error");
      }
      setSelectedRecipe(null)
    } catch (error) {
      displayToast("Error occured during the request: ", "error");
    }
    setSelectedRecipe(null);
  };

  const handleDeleteRecipe = async (recipeId) => {

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId))
        displayToast("Recipe deleted successfully.", "success");
      } else {
        displayToast("Something went wrong in deleting the recipe", "error")
      }
    } catch (error) {
      displayToast("Error in deleting", "error");
    }
    setSelectedRecipe(null);
  }



  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleUnselectRecipe = () => {
    setSelectedRecipe(null);
  };

  const hideRecipeForm = () => { setShowNewRecipeForm(false) };

  const showRecipeForm = () => {
    setShowNewRecipeForm(true);
    setSelectedRecipe(null);
  };

  /* This is the function that saves the entered values of each field. It is called from each field in the other components such as EditRecipeForm and NewRecipeForm*/
  const onUpdateForm = (e, action = "new") => {
    const { name, value } = e.target;
    if (action == "update") {
      setSelectedRecipe({ ...selectedRecipe, [name]: value });
    } else if (action == "new") {
      setNewRecipe({ ...newRecipe, [name]: value });
    }
  };

  const displayAllRecipes = () => {
    setSelectedRecipe(null);
    hideRecipeForm();
    clearSearchTerm();

  };

  const displayedRecipes = searchTerm ? handleSearch() : recipes

  return (
    <div className='recipe-app'>
      <Header showRecipeForm={showRecipeForm} searchTerm={searchTerm} updateSearchTerm={updateSearchTerm} displayAllRecipes={displayAllRecipes} hideRecipeForm={hideRecipeForm} clearSearchTerm={clearSearchTerm}/>
      {showNewRecipeForm && (
        <NewRecipeForm newRecipe={newRecipe} hideRecipeForm={hideRecipeForm} onUpdateForm={onUpdateForm} handleNewRecipe={handleNewRecipe} />
      )}
      {selectedRecipe ? (
        <RecipeFull selectedRecipe={selectedRecipe} handleUnselectRecipe={handleUnselectRecipe} onUpdateForm={onUpdateForm} handleUpdateRecipe={handleUpdateRecipe} handleDeleteRecipe={handleDeleteRecipe} />
      ) :
        (<div className="recipe-list">
          {displayedRecipes.map(recipe => (<RecipeExcerpt key={recipe.id} recipe={recipe} handleSelectRecipe={handleSelectRecipe} />))}
        </div>)}
          <ToastContainer />
    </div>
  
  );
}

export default App;
