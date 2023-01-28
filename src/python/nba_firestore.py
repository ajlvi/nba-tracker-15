import os
import time
from sys import argv

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from nba_fire_config import CertificatePath, DataPath
cred = credentials.Certificate(CertificatePath)
app = firebase_admin.initialize_app(cred)
db = firestore.client()
season = db.collection(u's2223')

def initial_batch_upload():
	dates = os.listdir(f"{DataPath}/2023/lines/")
	for fname in dates[dates.index("1224.txt"):]:
		print(fname);
		date_doc = season.document(f"day_{fname[:-4]}")
		date_doc.set({u'done': True})
		
		datefile = open(f"{DataPath}/2023/lines/{fname}", 'r')
		lines = datefile.readlines()
		if lines[0].strip() != "":
			date_games = date_doc.collection(u'games')
			json_data = [process_game(line) for line in lines]
			for game in json_data:
				date_games.document(str(json_data.index(game))).set(game)

def post_date(day):
	datefile = open(f"{DataPath}/2023/lines/{day}.txt", 'r')
	lines = datefile.readlines()

	date_doc = season.document(f"day_{day}")
	
	date_games = date_doc.collection(u'games')
	json_data = [process_game(line) for line in lines]
	for game in json_data:
		date_games.document(str(json_data.index(game))).set(game)

	if "score" in json_data[-1]:
		date_doc.set({u'done': True})
	else:
		date_doc.set({u'done': False, u'updated': round(time.time() * 1000)})

def process_game(game):
	x = game.strip().split("\t")
	fav = x[0].replace("@", "")
	line = x[1]
	dog = x[2].replace("@", "")
	home = fav if "@" in x[0] else dog

	#the score format is WIN xxx - yyy LOSS, or [[START TIME]] for not yet
	score = x[3]
	if "-" in score:
		fav_won = score.split()[0] == fav
		fav_adj_score = int(score.split()[1]) + float(line) if fav_won else int(score.split()[3]) + float(line)
		dog_score = int(score.split()[3]) if fav_won else int(score.split()[1])
		if fav_adj_score == dog_score: ats_win = "push"
		else: ats_win = fav if fav_adj_score > dog_score else dog
		return { "fav": fav, "dog": dog, "line": line, "score": score, "home": home, "ats_win": ats_win }
	else:
		return { "fav": fav, "dog": dog, "line": line, "home": home, "time": int(score)*1000 }

if __name__ == '__main__':
	if len(argv) == 3:
		if argv[1].isdigit() and int(argv[1]) in range(10, 17):
			if argv[2].isdigit() and int(argv[2]) in range(1, 32):
				month, day = int(argv[1]), int(argv[2])
				post_date(f"{month}{day}")
