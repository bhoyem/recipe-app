import { useState, useEffect  } from "react";
import React from "react";
import Header from "./components/Header";
import RecipeExcerpt from "./components/RecipeExcerpt";
import { Loader } from "react-feather";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recipes");
      if (response.ok){
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

  return (
    <div className='recipe-app'>
      <Header />
      {/* <p>Your recipes here! </p> */}
      <div className="recipe-list">
        {recipes.map(recipe => (
          <RecipeExcerpt key={recipe.id} recipe={recipe}/>
        ))}
        {/* {JSON.stringify(recipes)}; */}
        {/* {loading ? (<Loader />) : ({{JSON.stringify(recipes)}})}; */}
      </div>
    </div>
  );
}

export default App;
