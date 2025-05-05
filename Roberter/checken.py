from collections import defaultdict
from firebase_admin import credentials, firestore
import firebase_admin

cred = credentials.Certificate("C:/Users/Moda/Desktop/Robot-voting-system/Roberter/firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def ermittle_gewinner():
    votes = db.collection("votes").get()
    counts = defaultdict(int)
    optionen = ["links", "rechts", "geradeaus"]
    
    for doc in votes:
        data = doc.to_dict()
        for value in data.values():
            if value in optionen:
                counts[value] += 1

    if counts:
        gewinner = max(counts.items(), key=lambda x: x[1])[0]
        return gewinner
    return None
