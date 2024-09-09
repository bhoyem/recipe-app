import { useState, useEffect } from "react";
import React from "react";
import Header from "./components/Header";
import RecipeExcerpt from "./components/RecipeExcerpt";
import RecipeFull from "./components/RecipeFull";
import { Loader } from "react-feather";
import "./App.css";
import { render } from "@testing-library/react";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleUnselectRecipe = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className='recipe-app'>
      <Header />
      {selectedRecipe ? (
        <RecipeFull selectedRecipe={selectedRecipe} handleUnselectRecipe={handleUnselectRecipe} />
      ) :
        (<div className="recipe-list">
          {recipes.map(recipe => (
            <RecipeExcerpt key={recipe.id} recipe={recipe} handleSelectRecipe={handleSelectRecipe} />
          ))}

        </div>)}
    </div>
  );
}

export default App;
