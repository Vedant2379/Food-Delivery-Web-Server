// Import required models and packages
const Review = require("../Modals/ReviewSchema");
const mongoose = require("mongoose");
const User = require("../Modals/CustomerSchema");
const Food = require("../Modals/FoodSchema");

// Create a new review document
exports.createReview = async (req, res) => {
  try {
    const newReview = await Review.create(req.body); // Creates a new review using data from request body
    res.status(201).json({ message: "Review Added Successfully", result: newReview }); // Sends response with created review
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message }); // Handles errors if review creation fails
  }
};

// Fetch all review documents
exports.getReview = async (req, res) => {
  try {
    const review = await Review.find(); // Fetches all reviews from DB
    res.status(200).json({ message: " All reviews", result: review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reviews for a specific owner
exports.filterByOwnerId = (req, res) => {
  console.log("OwnerId", req.body.OwnerId);
  Review.find({ OwnerId: req.body.OwnerId }) // Filter reviews matching given OwnerId
    .then((result) => {
      res.status(200).json(result); // Send filtered reviews
    })
    .catch((err) => {
      res.status(500).json(err); // Handle error
    });
};

// Get all reviews written by a specific customer
exports.filterByCustomerId = (req, res) => {
  console.log("CustomerId", req.body.CustomerId);
  Review.find({ CustomerId: req.body.CustomerId }) // Filter reviews matching given CustomerId
    .then((result) => {
      res.status(200).json(result); // Send filtered reviews
    })
    .catch((err) => {
      res.status(500).json(err); // Handle error
    });
};

// Calculate average rating for a specific owner
exports.averageRatingByOwnerId = async (req, res) => {
  try {
    const OwnerId = req.body.OwnerId;
    console.log(OwnerId);

    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: "$OwnerId", // Group by OwnerId
          averageRating: { $avg: "$Rating" } // Calculate average rating
        },
      },
    ]);

    if (averageRating.length === 0) {
      return res.status(404).json({ message: "No reviews found for this owner " });
    }

    // Filter to return only for given owner
    const filteredData = averageRating.filter(
      (review) => review._id.toString() === OwnerId
    );

    if (filteredData.length === 0) {
      return res.status(404).json({ message: "No reviews found for this owner" });
    }

    res.status(200).json({ averageRating: filteredData[0].averageRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Calculate average ratings for all owners
exports.AllAverageRating = async (req, res) => {
  try {
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: "$OwnerId", // Group reviews by OwnerId
          averageRating: { $avg: "$Rating" } // Calculate average rating per owner
        },
      },
    ]);

    if (averageRating.length === 0) {
      return res.status(404).json({ message: "No reviews found for this owner " });
    }

    res.status(200).json({ averageRating: averageRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top 10 food items with highest average rating
exports.TopAverageRating = async (req, res) => {
  try {
    const topReviews = await Review.aggregate([
      {
        $group: {
          _id: "$FoodId", // Group by FoodId
          averageRating: { $avg: "$Rating" } // Calculate average rating per food
        },
      },
      {
        $sort: { averageRating: -1 } // Sort by average rating in descending order
      },
      {
        $limit: 10 // Limit to top 10
      }
    ]);

    if (topReviews.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    }

    // Populate food details (_id is FoodId here)
    const populatedTopFood = await Food.populate(topReviews, { path: '_id' });

    res.status(200).json({ topReviews: populatedTopFood });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*
1. .create(data)
- Creates and saves a new document in the database.
- Usage: Model.create({ field: value })
- Returns: Promise resolving to the saved document.
- Docs: https://mongoosejs.com/docs/models.html#creating

2. .find(query)
- Finds all documents matching the query.
- Usage: Model.find({ field: value })
- Returns: Array of documents
- Docs: https://mongoosejs.com/docs/models.html#querying

3. .aggregate(pipeline)
- Used to process data records and return computed results.
- You define stages like $match, $group, $sort, $lookup, etc.
- Docs: https://mongoosejs.com/docs/api/aggregate.html
- MongoDB Aggregation Pipeline: https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

Example:
[
  { $match: { OwnerId: "123" } },
  { $group: { _id: "$OwnerId", averageRating: { $avg: "$Rating" } } }
]
This filters reviews by OwnerId and computes average rating.

4. $group
- Groups input documents by a specified _id expression and applies accumulators like $sum, $avg.
- Docs: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/

5. $sort
- Sorts documents by field(s).
- Example: { $sort: { averageRating: -1 } } (Descending)
- Docs: https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/

6. $limit
- Limits the number of documents returned.
- Example: { $limit: 5 } returns top 5 results.
- Docs: https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/

7. .populate(path, options)
- Replaces the ObjectId in a field with actual referenced document data.
- Used to auto-fetch related data (like foreign key in SQL).
- Docs: https://mongoosejs.com/docs/populate.html

Example:
await Food.populate(results, { path: '_id' })
- Here, _id is actually a FoodId, and this populates it with full Food document.

Before populate:
[
  { _id: "663b...", averageRating: 4.8 }
]

After populate:
[
  {
    _id: {
      _id: "663b...",
      FoodName: "Paneer Tikka",
      OwnerId: "123",
      ...
    },
    averageRating: 4.8
  }
]

8. res.status().json()
- Sets the HTTP status code and returns a JSON response.
- Docs: https://expressjs.com/en/api.html#res.status

9. Error Handling
- try-catch is used to catch and respond to runtime errors.
- Good practice to always handle errors gracefully and send proper status codes.
*/