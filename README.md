# MongoDB Schema Design Exercises

> **Focus:** Embed vs. Reference decisions based on expected queries, access patterns, relationship cardinality, and document growth.

---

# 1. Twitter Clone

## Main Entities

The Twitter clone contains:

-  Users 
-  Tweets 
-  Likes 
-  Follows 
-  Comments 

---

## Proposed Collections

```
users
tweets
likes
follows
comments
```

## Relationship Overview

```
User
 │
 ├── Tweets
 │
 ├── Likes
 │
 ├── Followers
 │
 └── Following

Tweet
 │
 ├── Likes
 │
 └── Comments
```

---

## Users → Tweets

### Decision: **Reference**

A tweet should contain the ID of the user who created it.

```
users
   ↑
   │ userId
   │
tweets
```

### Why?

A user can create thousands or millions of tweets.

Embedding all tweets inside the user document would create a continuously growing document.

For example:

```
User
 ├── tweet 1
 ├── tweet 2
 ├── tweet 3
 ├── ...
 └── tweet 1,000,000
```

This is an **unbounded array**, which is not a good MongoDB design.

### Expected queries

The application frequently needs:

```
Get all tweets created by a user
Get latest tweets from a user
Get tweets for the home timeline
Get a specific tweet
```

Therefore, tweets should be separate documents referencing the user.

### Decision

**Reference `userId` from `tweets` to `users`.**

---

# Users → Likes

### Decision: **Reference**

Likes should be stored separately.

A user can like a very large number of tweets, and a tweet can receive a very large number of likes.

This creates a **many-to-many relationship**:

```
User A ──────┐
User B ──────┼──> Tweet
User C ──────┘
```

Embedding all likes inside either the user or tweet document could create huge arrays.

### Expected queries

We need to answer questions such as:

```
Did this user like this tweet?
Who liked this tweet?
What tweets did this user like?
How many likes does this tweet have?
```

A separate `likes` collection supports these access patterns.

### Decision

**Reference users and tweets through a separate `likes` collection.**

Conceptually:

```
likes
 ├── userId
 └── tweetId
```

---

# Users → Followers / Following

### Decision: **Reference**

Following is another **many-to-many relationship**.

For example:

```
User A
 ├── follows B
 ├── follows C
 ├── follows D
 └── ...
```

A popular user could have millions of followers.

Embedding all followers inside the user document would create an unbounded array.

### Expected queries

The application needs to perform:

```
Who follows this user?
Who does this user follow?
Does A follow B?
How many followers does A have?
```

Therefore, use a separate relationship collection.

### Decision

**Reference using a `follows` collection.**

Conceptually:

```
follows
 ├── followerId
 └── followingId
```

---

# Tweets → Comments

### Decision: **Reference**

A tweet can receive an unlimited number of comments.

For example:

```
Tweet
 ├── comment 1
 ├── comment 2
 ├── comment 3
 ├── ...
 └── comment 1,000,000
```

Embedding comments inside the tweet would create an unbounded array.

### Expected queries

We need:

```
Get comments for a tweet
Get latest comments
Get comments written by a user
Delete a comment
Paginate comments
```

These queries are easier with a separate collection.

### Decision

**Reference tweets from a separate `comments` collection.**

---

## Twitter Clone — Final Design

| Relationship     | Decision  | Reason                                    |
| ---------------- | --------- | ----------------------------------------- |
| User → Tweets    | Reference | Tweets can grow without limit             |
| User → Likes     | Reference | Many-to-many relationship                 |
| Tweet → Likes    | Reference | A tweet can receive huge numbers of likes |
| User → Followers | Reference | Unbounded many-to-many relationship       |
| User → Following | Reference | Unbounded many-to-many relationship       |
| Tweet → Comments | Reference | Comments can grow without limit           |

## Twitter Structure with fields

### `users`

```text
users
 ├── _id
 ├── username
 ├── email
 ├── name
 ├── bio
 └── createdAt
```

### `tweets`

```text
tweets
 ├── _id
 ├── userId ──────────► users._id
 ├── content
 └── createdAt
```

### `likes`

```text
likes
 ├── _id
 ├── userId ──────────► users._id
 ├── tweetId ─────────► tweets._id
 └── createdAt
```

### `follows`

```text
follows
 ├── _id
 ├── followerId ──────► users._id
 ├── followingId ─────► users._id
 └── createdAt
```

### `comments`

```text
comments
 ├── _id
 ├── tweetId ─────────► tweets._id
 ├── userId ──────────► users._id
 ├── content
 └── createdAt
```

---

# 2. E-commerce Application

## Main Entities

The e-commerce application contains:

-  Users 
-  Products 
-  Orders 
-  Reviews 
-  Categories 

---

## Proposed Collections

```
users
products
orders
reviews
categories
```

---

# Users → Orders

### Decision: **Reference**

A customer can place many orders.

```
User
 ├── Order 1
 ├── Order 2
 ├── Order 3
 └── ...
```

Orders should not be embedded inside the user document because the order history can grow continuously.

### Expected queries

The application needs:

```
Get user's orders
Get a specific order
Get recent orders
Get orders by status
Get orders within a date range
```

Orders also have their own lifecycle and are frequently accessed independently.

### Decision

**Reference `userId` from orders to users.**

---

# Orders → Order Items

### Decision: **Embed**

This is a good example of **embedding**.

An order normally contains a relatively limited number of products.

For example:

```
Order
 ├── Product A
 ├── Product B
 └── Product C
```

The order and its items are normally read together.

### Why embed?

When an order is retrieved, the application almost always needs to know:

```
What products were ordered?
How many?
At what price?
What discount was applied?
```

Therefore, keeping the order items inside the order is convenient.

### Important point

The order should store a **snapshot of important product information**, such as:

```
productId
productName
quantity
priceAtPurchase
```

Why?

Suppose a product costs ₹1,000 today but becomes ₹1,200 tomorrow.

An old order should still show:

```
Price paid = ₹1,000
```

It should not change when the product's current price changes.

### Decision

**Embed order items inside orders.**

---

# Products → Categories

### Decision: **Reference**

Categories are shared by many products.

For example:

```
Electronics
 ├── Laptop A
 ├── Laptop B
 ├── Phone A
 └── Phone B
```

The category exists independently of any particular product.

### Expected queries

```
Get products in a category
Get category information
Filter products by category
Browse category pages
```

Therefore, products can reference category IDs.

### Decision

**Reference categories from products.**

---

# Products → Reviews

### Decision: **Reference**

Products can receive many reviews.

```
Product
 ├── Review 1
 ├── Review 2
 ├── Review 3
 ├── ...
 └── Review 100,000
```

Embedding reviews directly inside the product could produce an unbounded array.

Reviews also need to be independently queried.

### Expected queries

```
Get reviews for product
Get latest reviews
Get reviews by a user
Calculate rating statistics
Paginate reviews
```

### Decision

**Reference products from a separate `reviews` collection.**

---

# Reviews → Users

### Decision: **Reference**

A review is written by a user.

The same user can review many products.

Therefore:

```
Review
 └── userId
```

is preferable to embedding the entire user document.

### Why?

User information can change.

For example:

```
User
 ├── name
 ├── email
 └── profile information
```

We don't want copies of this information inside thousands of reviews.

### Decision

**Reference the user using `userId`.**

---

# E-commerce — Final Design

| Relationship         | Decision  | Reason                                 |
| -------------------- | --------- | -------------------------------------- |
| User → Orders        | Reference | Order history can grow indefinitely    |
| Order → Order Items  | **Embed** | Items are normally read with the order |
| Product → Categories | Reference | Categories are shared entities         |
| Product → Reviews    | Reference | Reviews can grow without limit         |
| Review → User        | Reference | User is an independent/shared entity   |

### Most important embedding decision

```
Order
 └── items[]
      ├── productId
      ├── productName
      ├── quantity
      └── priceAtPurchase
```

## E-commerce Application Structure with fields

### `users`

```text
users
 ├── _id
 ├── name
 ├── email
 └── createdAt
```

### `products`

```text
products
 ├── _id
 ├── name
 ├── description
 ├── price
 ├── categoryId ──────► categories._id
 ├── stock
 └── createdAt
```

### `categories`

```text
categories
 ├── _id
 ├── name
 └── description
```

### `orders`

```text
orders
 ├── _id
 ├── userId ──────────► users._id
 ├── items[]           ← EMBEDDED
 │    ├── productId
 │    ├── productName
 │    ├── quantity
 │    └── priceAtPurchase
 ├── totalAmount
 ├── status
 └── createdAt
```

### `reviews`

```text
reviews
 ├── _id
 ├── productId ───────► products._id
 ├── userId ──────────► users._id
 ├── rating
 ├── comment
 └── createdAt
```

---

# 3. Blog Application

## Main Entities

The blog contains:

-  Users 
-  Posts 
-  Comments 
-  Tags 

---

## Proposed Collections

```
users
posts
comments
tags
```

---

# Users → Posts

### Decision: **Reference**

A user can write many posts.

```
User
 ├── Post 1
 ├── Post 2
 ├── Post 3
 └── ...
```

The number of posts can continue growing.

Therefore, posts should be separate documents.

### Expected queries

```
Get all posts by an author
Get latest posts
Get a specific post
Search posts
Paginate posts
```

### Decision

**Reference the author using `authorId`.**

---

# Posts → Comments

### Decision: **Reference**

A popular blog post can receive thousands of comments.

Embedding all comments inside the post would create an unbounded array.

### Expected queries

```
Get comments for a post
Get latest comments
Paginate comments
Delete a comment
Find comments by a user
```

Therefore, comments should be separate documents.

### Decision

**Reference posts from comments.**

Conceptually:

```
comments
 ├── postId
 ├── userId
 └── content
```

---

# Posts → Tags

### Decision: **Reference**

Tags can be shared by many posts.

For example:

```
Java
 ├── Post A
 ├── Post B
 ├── Post C
 └── Post D
```

This is a many-to-many relationship.

A post can have multiple tags:

```
Post A
 ├── Java
 ├── MongoDB
 └── Backend
```

And a tag can belong to many posts.

### Expected queries

```
Get all posts with a tag
Get posts tagged "MongoDB"
Find all posts with multiple tags
List available tags
```

A reference-based design is appropriate.

### Decision

**Reference tags from posts.**

---

# Comments → Users

### Decision: **Reference**

A comment belongs to a user, but the user is an independent entity.

Embedding user information in every comment would duplicate data.

Instead:

```
comment
 └── userId
```

### Decision

**Reference the user from the comment.**

---

# Blog — Final Design

| Relationship    | Decision  | Reason                          |
| --------------- | --------- | ------------------------------- |
| User → Posts    | Reference | Posts can grow without limit    |
| Post → Comments | Reference | Comments can grow without limit |
| Post → Tags     | Reference | Many-to-many relationship       |
| Comment → User  | Reference | User is an independent entity   |

---

## Blog Application structure with Fields

### `users`

```text
users
 ├── _id
 ├── username
 ├── email
 ├── name
 ├── bio
 └── createdAt
```

### `posts`

```text
posts
 ├── _id
 ├── authorId ────────► users._id
 ├── title
 ├── content
 ├── tagIds[] ────────► tags._id
 ├── createdAt
 └── updatedAt
```

### `comments`

```text
comments
 ├── _id
 ├── postId ──────────► posts._id
 ├── userId ──────────► users._id
 ├── content
 └── createdAt
```

### `tags`

```text
tags
 ├── _id
 └── name
```