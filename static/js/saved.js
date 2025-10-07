function sortSavedProperties() {
    const selectedOption = document.getElementById("sortOptions").value;

    // Replace this with actual logic based on your data source (local storage, backend, etc.)
    switch (selectedOption) {
      case "recent":
        console.log("Sorting by: Recently Saved");
        break;
      case "price_low":
        console.log("Sorting by: Price Low to High");
        break;
      case "price_high":
        console.log("Sorting by: Price High to Low");
        break;
      case "rating":
        console.log("Sorting by: Highest Rated");
        break;
      default:
        console.log("Unknown sort option");
    }

    // Actual sorting logic would go here
    // e.g., reordering cards in the DOM based on data attributes
  }

