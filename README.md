# MongoDB Library CRUD Exercise

## Database Setup

### Create database

use library

db.createCollection("books")


![](images/image1.png)

------------------------------------------------

db.books.insertMany([
  // 20 book documents
])

db.books.countDocuments()

![](images/image2.png)

---------------------------------------------------------

Find all books published after 2010, sorted by rating desc, limit 5.

db.books
  .find({ publishedYear: { $gt: 2010 } })
  .sort({ rating: -1 })
  .limit(5)

![](images/image3.png)
![](images/image4.png)


-----------------------------------------------------------------

Update all books with rating > 4.5 to add a field featured: true.

db.books.updateMany(
  { rating: { $gt: 4.5 } },
  { $set: { featured: true } }
)

![](images/image5.png)

-----------------------------------------------------------------------

Aggregate: group by genre, count books per genre and their average rating.

db.books.aggregate([
  {
    $group: {
      _id: "$genre",
      bookCount: { $sum: 1 },
      averageRating: { $avg: "$rating" }
    }
  },
|   {
|     $sort: {
|       bookCount: -1
|     }
|   }
])

![](images/image6.png)

-----------------------------------------------------------------------

Add an index on author and compare query performance with .explain().

Without Index

![](images/image7.png)
![](images/image8.png)

----------------------------------------------------------------------

With Index

![](images/image9.png)
![](images/image10.png)

