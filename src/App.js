import { useState, useEffect } from "react";
import React from "react";
import Header from "./components/Header";
import RecipeExcerpt from "./components/RecipeExcerpt";
import RecipeFull from "./components/RecipeFull";
import NewRecipeForm from "./components/NewRecipeForm";
import { Loader } from "react-feather";
import "./App.css";
import { render } from "@testing-library/react";

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

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recipes");
      if (response.ok) {
        const results = await response.json();
        setRecipes(results);
      } else {
        console.log("Could not fetch recipes")
      }
    } catch (e) {
      console.error(`There was an error in fetching the recipes`, e)
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

        console.log("Recipe added");

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
        console.error("Oops - could not add recipe!")
      }
    } catch (error) {
      console.error("Error occured during the request: ", e)
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

        console.log("Recipe updated");
      } else {
        console.error("Error updating recipe");
      }
      setSelectedRecipe(null)
    } catch (error) {
      console.error("Error occured during the request: ", e);
    }
    setSelectedRecipe(null);
  };



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


  return (
    <div className='recipe-app'>
      <Header showRecipeForm={showRecipeForm} />
      {showNewRecipeForm && (
        <NewRecipeForm newRecipe={newRecipe} hideRecipeForm={hideRecipeForm} onUpdateForm={onUpdateForm} handleNewRecipe={handleNewRecipe} />
      )};
      {selectedRecipe ? (
        <RecipeFull selectedRecipe={selectedRecipe} handleUnselectRecipe={handleUnselectRecipe} onUpdateForm={onUpdateForm} handleUpdateRecipe={handleUpdateRecipe} />
      ) :
        (<div className="recipe-list">
          {recipes.map(recipe => (<RecipeExcerpt key={recipe.id} recipe={recipe} handleSelectRecipe={handleSelectRecipe} />))}
        </div>)};

    </div>
  );
}

export default App;
