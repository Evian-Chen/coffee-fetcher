const { default: firebase } = require("firebase/compat/app");

// --- gloabl --- //
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://coffee-fetcher-e3938-default-rtdb.firebaseio.com"
});

const rtdb = admin.database();
const firestore = admin.firestore();

// --- gloabl --- //


async function admin_init() {
    // 只讀取一次最新資料
    const snapshot = await rtdb.ref("/coffee_shops").once("value");
    const allData = snapshot.val();

    const petKeywords = ["pet", "pet cafe", "cat", "dog", "cat cafe", "dog cafe", "pet friendly", 
                        "寵物", "寵物友善", "寵物咖啡廳", "貓咪", "貓咪咖啡廳"]

    // 從 realtime 把資料撈出來
    for (const city in allData) {
        const cityData = allData[city];

        // 每個縣市底下的行政區
        for (const district in cityData) {

            // 每個行政區底下的所有咖啡廳
            for (const shopName in cityData[district]) {
                if (shopName.includes("測試咖啡廳")) { return; }
                // 一筆data來自：cityData[district][shopName]
                shopData = cityData[district][shopName]

                if (shopData["rating"] >= 3.8) {
                    addToCategory("highRatings", city, district, shopName, shopData);
                }

                if (shopData.services.serves_beer) {
                    addToCategory("serves_beer", city, district, shopName, shopData);
                }

                if (shopData.services.serves_brunch) {
                    addToCategory("serves_brunch", city, district, shopName, shopData);
                }

                if (shopData.services.takeout) {
                    addToCategory("takeout", city, district, shopName, shopData);
                }

                if (shopData.services.serves_dinner) {
                    addToCategory("serves_dinner", city, district, shopName, shopData);
                }

                if (shopData.types.some(type => petKeywords.includes(type))) {
                    addToCategory("petFriendly", city, district, shopName, shopData);
                }
            }
            console.log(district, " done adding");
        }
        console.log(city, " done adding");
    }

    // close connection
    await admin.app().delete();
}

async function addToCategory(category, collectionCity, colleationDistrict, shopName, shopData) {
    await firestore.collection(category)
            .doc(collectionCity).collection(colleationDistrict)
            .doc(shopName).set(shopData);
}

admin_init();
