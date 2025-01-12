const Review = require("../Modals/ReviewSchema");
const mongoose = require("mongoose");
const User = require("../Modals/CustomerSchema")
// const Customer = require("../Modals/CustomerSchema")
const Food = require("../Modals/FoodSchema")

exports.createReview = async (req, res) => {
  try {
    const newReview = await Review.create(req.body);
    res
      .status(201)
      .json({ message: "Review Added Successfully", result: newReview });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
};
exports.getReview = async (req, res) => {
  try {
    const review = await Review.find();
    res.status(200).json({ message: " All reviews", result: review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.filterByOwnerId = (req, res) => {
  console.log("OwnerId", req.body.OwnerId);
  Review.find({ OwnerId: req.body.OwnerId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
exports.filterByCustomerId = (req, res) => {
  console.log("CustomerId", req.body.CustomerId);
  Review.find({ CustomerId: req.body.CustomerId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
exports.averageRatingByOwnerId = async (req, res) => {
  try {
    const OwnerId = req.body.OwnerId;
    console.log(OwnerId);

    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: "$OwnerId",
          averageRating: { $avg: "$Rating" },
        },
      },
    ]);
    if (averageRating.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this owner " });
    }
    const filteredData = averageRating.filter(
      (review) => review._id.toString() === OwnerId
    );
    console.log(filteredData);
    if (filteredData.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this owner" });
    }

    res.status(200).json({ averageRating: filteredData[0].averageRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.AllAverageRating = async (req, res) => {
  try {
    const OwnerId = req.body.OwnerId;
    console.log(OwnerId);
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: "$OwnerId",
          averageRating: { $avg: "$Rating" },
        },
      },
    ]);
    if (averageRating.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this owner " });
    }

    res.status(200).json({ averageRating: averageRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// exports.TopAverageRating = async (req, res) => {
//   try {
//     const topReviews = await Review.aggregate([
//       {
//         $group: {
//           _id: "$OwnerId",
//           averageRating: { $avg: "$Rating" },
//         },
//       },
//       {
//         $sort: { averageRating: -1 }
//       },
//       {
//         $limit: 5
//       }
//     ]);

//     if (topReviews.length === 0) {
//       return res.status(404).json({ message: "No reviews found" });
//     }
//     console.log(topReviews)

//     res.status(200).json({ topReviews: topReviews });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.TopAverageRating = async (req, res) => {
  try {
    const topReviews = await Review.aggregate([
      {
        $group: {
          _id: "$FoodId",
          averageRating: { $avg: "$Rating" },
        },
      },
      {
        $sort: { averageRating: -1 }
      },
      {
        $limit: 10
      }
    ]);

    if (topReviews.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    }
    // const populatedTopFood = await Review.populate(topReviews, { path: '_id', select: 'FullName MessName MessImage Address.City' });

    const populatedTopFood = await Food.populate(topReviews, { path: '_id' });

    // res.status(200).json({ topReviews: topReviews });
    res.status(200).json({ topReviews: populatedTopFood });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};