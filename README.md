# Coffee Fetcher: Taiwan Coffee Shop Database

A comprehensive database of all coffee shops across Taiwan, built using **MongoDB** and **Google Maps API**. This project collects and stores coffee shop information for every city and district in Taiwan, making it accessible for research, applications, or data analysis.

This project can be extended to build a customized coffee shop database for different cities and districts in other countries.

## Features

- **Covers all cities and districts in Taiwan** 
- **Uses Google Maps API** to fetch real-time coffee shop details
- **Stores structured data in MongoDB**
- **Built with JavaScript (Node.js)**
- **Supports data updates and expansions**

## Technologies Used

- **MongoDB** – NoSQL database for storing coffee shop information
- **Google Maps API** – Fetches coffee shop locations and details
- **Node.js** – Backend scripting
- **Mongoose** – MongoDB ODM for schema validation
- **Axios** – Fetching API data from Google Maps

## Getting Started

1. Clone the repository
```
git clone https://github.com/Evian-Chen/coffee-fetcher.git
cd coffee-fetcher
```

2. Install Dependencies
```
npm install
```

3. Set Up Environment Variables

Create a ```.env``` file and add MongoDB URI and Google Map API key:
**Make sure there is no trailing `/` at the end of your MongoDB URI.**
```
GOOGLE_MAP_API_KEY = YOUR_GOOGLE_MAP_API
MONGODB_COFFEE_SHOP = YOUR_MONGODB_URI
```

4. Prepare the District Data

Create a database named ```test``` to store city and district data using the following MongoDB schema:
```javascript
const DistrictSchema = new mongoose.Schema({
  city: { type: String, required: true },
  district: { type: String, required: true }
});
```

5. Run the Project

The following scripts will populate the database with all districts in ```test``` (Taiwan in this case) and fetch coffee shop data using the Google Maps API:
```
node setUpMongo.js
node fetchAllShops.js
````
The cafe shops fetched by this program will be saved as JSON format in the root directory: ```coffee_shops_by_district.json```

Run the following script to initialize firebase:
```
init_firebase.js
```

## Additional Notes
- The sample data fetched by GoogleMap API are stored in dataSample folder.