async function admin_init() {
    var admin = require("firebase-admin");
    var serviceAccount = require("../serviceAccountKey.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://coffee-fetcher-e3938-default-rtdb.firebaseio.com"
    });

    const db = admin.firestore();

    const snapshot = await db.collection("coffee_shops").get();

    for (const doc of snapshot.docs) {
        console.log(doc.id);
        console.log("hi");
    }
}

admin_init();

