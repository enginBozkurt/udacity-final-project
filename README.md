# Udacity Google Nanodegree Mobile Web Specialist Track

## Final Project - Stage 3

## Project Overview
For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application. In Stage Three, you will take the connected application you yu built in Stage One and Stage Two and add additional functionality. You will add a form to allow users to create their own reviews. If the app is offline, your form will defer updating to the remote database until a connection is established. Finally, you’ll work to optimize your site to meet even stricter performance benchmarks than the previous project, and test again using Lighthouse.

## Getting Started
Go to (https://github.com/enginBozkurt/mws-restaurant-stage-3) , clone the backend and follow the instructions to run it
run npm i.
Serve the web app using gulp command.
Serve the main directory python -m http.server 8000

## Note about ES6
Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.

## Local Development API Server
Usage

Get Restaurants
curl "http://localhost:1337/restaurants/"

Get Restaurants by id
curl "http://localhost:1337/restaurants/{3}"

## Architecture
Local server:

Node.js
Sails.js
--

##Start only server
npm run start: development, Port: 1337

## Start the server and the building process together
npm run sailsjs: production, Port: 1337, you manually have to go to url http://localhost:1377 Served from .tmp/public folder

## GET Endpoints
Get all restaurants http://localhost:1337/restaurants/

Get favorite restaurants http://localhost:1337/restaurants/?is_favorite=true

Get a restaurant by id http://localhost:1337/restaurants/<restaurant_id>

Get all reviews for a restaurant http://localhost:1337/reviews/?restaurant_id=<restaurant_id>

Get all restaurant reviews http://localhost:1337/reviews/

Get a restaurant review by id http://localhost:1337/reviews/<review_id>

POST Endpoints Create a new restaurant review http://localhost:1337/reviews/

{ "restaurant_id": <restaurant_id>, "name": <reviewer_name>, "rating": , "comments": <comment_text> } PUT Endpoints Favorite a restaurant http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true

Unfavorite a restaurant http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false

Update a restaurant review http://localhost:1337/reviews/<review_id>

{ "name": <reviewer_name>, "rating": , "comments": <comment_text> } DELETE Endpoints Delete a restaurant review http://localhost:1337/reviews/<review_id>

## License

Project is licensed under [MIT License](LICENSE.txt).
