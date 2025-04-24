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

    // 從 realtime 把資料撈出來
    for (const city in allData) {
        const cityData = allData[city];

        // 每個縣市底下的行政區
        for (const district in cityData) {

            // 每個行政區底下的所有咖啡廳
            for (const shop in cityData[district]) {
                // 
                // if (shop["rating"] >= 3.7) {
                //     addToCategory("highRatings", city, district, shop)
                // }

                console.log(cityData[district][shop]);
                await admin.app().delete();
            }
        }
    }
}

async function addToCategory(category, collectionCity, colleationDistrict, shopName, shopData) {
    return;
}

admin_init();
