const { default: firebase } = require("firebase/compat/app");
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://coffee-fetcher-e3938-default-rtdb.firebaseio.com"
});

const rtdb = admin.database();
const firestore = admin.firestore();

async function categorize() {
    const snapshot = await rtdb.ref("/coffee_shops").once("value");
    const allData = snapshot.val();

    // 每個分類有一個 batch 和 counter
    let ratingBatch = firestore.batch(), ratingCount = 0;
    let beerBatch = firestore.batch(), beerCount = 0;
    let brunchBatch = firestore.batch(), brunchCount = 0;
    let takeoutBatch = firestore.batch(), takeoutCount = 0;
    let dinnerBatch = firestore.batch(), dinnerCount = 0;
    let petBatch = firestore.batch(), petCount = 0;

    const petKeywords = ["pet", "pet cafe", "cat", "dog", "cat cafe", "dog cafe", "pet friendly", 
                         "寵物", "寵物友善", "寵物咖啡廳", "貓咪", "貓咪咖啡廳"];

    for (const city in allData) {
        const cityData = allData[city];

        for (const district in cityData) {
            for (const shopName in cityData[district]) {
                if (shopName.includes("測試咖啡廳")) continue; // ← 這裡改成 continue 而不是 return！

                const shopData = cityData[district][shopName];

                if (shopData.rating >= 3.8) {
                    [ratingBatch, ratingCount] = await addToBatch(ratingBatch, ratingCount, "highRatings", city, district, shopName, shopData);
                }

                if (shopData.services.serves_beer) {
                    [beerBatch, beerCount] = await addToBatch(beerBatch, beerCount, "serves_beer", city, district, shopName, shopData);
                }

                if (shopData.services.serves_brunch) {
                    [brunchBatch, brunchCount] = await addToBatch(brunchBatch, brunchCount, "serves_brunch", city, district, shopName, shopData);
                }

                if (shopData.services.takeout) {
                    [takeoutBatch, takeoutCount] = await addToBatch(takeoutBatch, takeoutCount, "takeout", city, district, shopName, shopData);
                }

                if (shopData.services.serves_dinner) {
                    [dinnerBatch, dinnerCount] = await addToBatch(dinnerBatch, dinnerCount, "serves_dinner", city, district, shopName, shopData);
                }

                if (shopData.types?.some(type => petKeywords.includes(type))) {
                    [petBatch, petCount] = await addToBatch(petBatch, petCount, "petFriendly", city, district, shopName, shopData);
                }
            }
            console.log(district, " done adding");
        }
        console.log(city, " done adding");
    }

    // 最後！檢查所有 batch 還有沒有剩下沒 commit 的
    await commitRemainingBatch(ratingBatch, ratingCount);
    await commitRemainingBatch(beerBatch, beerCount);
    await commitRemainingBatch(brunchBatch, brunchCount);
    await commitRemainingBatch(takeoutBatch, takeoutCount);
    await commitRemainingBatch(dinnerBatch, dinnerCount);
    await commitRemainingBatch(petBatch, petCount);

    console.log("所有分類完成！關閉連線");
    await admin.app().delete();
}

async function addToBatch(batch, count, category, collectionCity, colleationDistrict, shopName, shopData) {
    const ref = firestore.collection(category)
                         .doc(collectionCity)
                         .collection(colleationDistrict)
                         .doc(shopName);

    batch.set(ref, shopData);
    count++;

    if (count >= 400) {
        console.log(`${category} 已累積 400 筆，執行 commit`);
        await batch.commit();
        batch = firestore.batch();
        count = 0;
    }

    return [batch, count];
}

async function commitRemainingBatch(batch, count) {
    if (count > 0) {
        console.log(`送出剩下的 ${count} 筆資料`);
        await batch.commit();
    }
}

categorize()