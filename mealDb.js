$(document).ready(function () {
    $("#searchButton").on("click", function () {
        const ingredient = $("#ingredient").val().trim();

        // Check if the user typed anything
        if (!ingredient) {
            alert("Please enter an ingredient first!");
            return;
        }

        // First AJAX call: Filter a recipe by an ingredient
        $.ajax({
            url: `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`,
            method: "GET",
            success: function (data) {
                // Clear previous results
                $("#results").empty();

                // If no recipe is found, handle gracefully
                if (!data.meals) {
                    $("#results").append("<p>No recipe found for that ingredient.</p>");
                    return;
                }

                // Pick a random meal from the returned list
                const mealArray = data.meals;
                const randomMeal = mealArray[Math.floor(Math.random() * mealArray.length)];

                // Build HTML for basic info
                const mealName = randomMeal.strMeal;
                const mealImage = randomMeal.strMealThumb;
                const mealId = randomMeal.idMeal;

                // Show basic meal info immediately
                $("#results").append(`
      <h2>${mealName}</h2>
      <img id="mealImage" src="${mealImage}" alt="Meal Image">
      <div id="details">
        <p><em>Loading recipe...</em></p>
      </div>
    `);

                // Second AJAX call: Get details (instructions, ingredients) using the meal ID
                $.ajax({
                    url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
                    method: "GET",
                    success: function (detailData) {
                        if (!detailData.meals) {
                            $("#details").html("<p>Recipe not found.</p>");
                            return;
                        }

                        const detailedMeal = detailData.meals[0];
                        const instructions = detailedMeal.strInstructions;

                        // Collect ingredients and measurements
                        const ingredientsList = [];
                        for (let i = 1; i <= 20; i++) {
                            const ingredient = detailedMeal[`strIngredient${i}`];
                            const measure = detailedMeal[`strMeasure${i}`];
                            // Only add if ingredient exists (non-empty)
                            if (ingredient && ingredient.trim() !== "") {
                                ingredientsList.push(`${ingredient} - ${measure}`);
                            }
                        }

                        // Build HTML for instructions & ingredients
                        let htmlContent = `
          <h3>Ingredients</h3>
          <ul class="ingredient-list">
        `;
                        ingredientsList.forEach(item => {
                            htmlContent += `<li>${item}</li>`;
                        });
                        htmlContent += `</ul>`;

                        htmlContent += `
          <h3>Instructions</h3>
          <p class="instructions">${instructions}</p>
        `;

                        // Update the #details area
                        $("#details").html(htmlContent);
                    },
                    error: function (err) {
                        console.log(err);
                        $("#details").html("<p>Error fetching the recipe details.</p>");
                    }
                });
            },
            error: function (err) {
                console.log(err);
                alert("An error occurred while fetching the recipe details.");
            }
        });
    });
});