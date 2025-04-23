async function admin_init() {
    var admin = require("firebase-admin");
    var serviceAccount = require("../serviceAccountKey.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://coffee-fetcher-e3938-default-rtdb.firebaseio.com"
    });

    const rtdb = admin.database();
    const firestore = admin.firestore();

    const snapshot = await rtdb.ref("/coffee_shops").once("value");
    const shops = snapshot.val();

    for (const shop in shops) {
        // realtime database is workable
        console.log(shop);
    }
}

admin_init();

