import os
import time
from sys import argv

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

from nba_fire_config import CertificatePath, DataPath, CurrentSeason, CurrentSeasonEnd
import nba_getlines as getlines
import nba_teamdata as nbateam

cred = credentials.Certificate(CertificatePath)
app = firebase_admin.initialize_app(cred)
db = firestore.client()
season = db.collection(CurrentSeason)

def initial_batch_upload():
	dates = os.listdir(f"{DataPath}/{CurrentSeason[1:]}/lines/")[2:]
#	dates = [d for d in dates if d not in ["1224.txt", "1124.txt", "1108.txt"]]:
	for fname in dates: post_date(fname[:4])
			
def initialize_stats(username):
	user_doc = db.collection("users").document(username)
	user_get = user_doc.get()
	blank_stats = {f"{CurrentSeason}_w": 0, f"{CurrentSeason}_l": 0, f"{CurrentSeason}_t": 0, "user": username, "handle": username}
	if not user_get.exists:
		user_doc.set({"groups": []} | blank_stats)
	elif f"{CurrentSeason}_w" not in user_get.to_dict():
		user_doc.set(user_get.to_dict() | blank_stats)

def find_user_record(username):
	user_picks = db.collection("picks").where("user", "==", username).where("season", "==", CurrentSeason)
	wins, losses, ties = 0, 0, 0
	date_dict = {}
	for pick_doc in user_picks.stream():
		day_w, day_l, day_t = 0, 0, 0
		pick_dict = pick_doc.to_dict()
		pick_date = pick_dict["date"]
		for game_idx in range(15):
			if f"result_{game_idx}" in pick_dict:
				pick_result = pick_dict[f"result_{game_idx}"]
				if pick_result == 1: day_w += 1
				elif pick_result == -1: day_l += 1
				elif pick_result == 0: day_t += 1
		date_dict[pick_date] = (day_w, day_l, day_t)
		wins += day_w; losses += day_l; ties += day_t
	print(wins, losses, ties)
	return date_dict

def process_user_wins(username, date, winners):
	user_picks = db.collection("picks").where("user", "==", username).where("date", "==", date).where("season", "==", CurrentSeason)
	wins, losses, ties = 0, 0, 0

	for pick_doc in user_picks.stream():
		pick_dict = pick_doc.to_dict()
		for game_idx in range(15):
			if f"pick_{game_idx}" in pick_dict:
				user_pick = pick_dict[f"pick_{game_idx}"]
		
				if winners[game_idx] == user_pick:
					wins += 1
					result_number = 1
				elif winners[game_idx] == "push":
					ties += 1
					result_number = 0
				else: 
					losses += 1
					result_number = -1
				pick_dict[f"result_{game_idx}"] = result_number
		db.collection("picks").document(pick_doc.id).set(pick_dict)

	if wins + losses + ties >= 1:
		user_doc = db.collection("users").document(username)
		user_dict = user_doc.get().to_dict()
		user_dict[f"{CurrentSeason}_w"] += wins
		user_dict[f"{CurrentSeason}_l"] += losses
		user_dict[f"{CurrentSeason}_t"] += ties
		user_doc.set(user_dict)		

def post_date(day):
	datefile = open(f"{DataPath}/{CurrentSeason[1:]}/lines/{day}.txt", 'r')
	lines = datefile.readlines()
	if len(lines) == 0 or lines[0].strip() == "": return

	date_doc = season.document(f"day_{day}")
	date_dict = {"date": day, "totg": len(lines)}

	for i in range(len(lines)):
		date_dict = date_dict | process_game(lines[i], i)
	
	if f"score_{i}" in date_dict: date_dict["done"] = True
	else:
		date_dict["done"] = False
		date_dict["updated"] = round( time.time() * 1000 )

	date_doc.set(date_dict)
	return date_dict

def process_game(game, idx):
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
		return { f"fav_{idx}": fav, f"dog_{idx}": dog, f"line_{idx}": line, f"home_{idx}": home, f"score_{idx}": score, f"ats_win_{idx}": ats_win }
	else:
		return { f"fav_{idx}": fav, f"dog_{idx}": dog, f"line_{idx}": line, f"home_{idx}": home, f"time_{idx}": int(score)*1000 }

def database_update(mm, dd):
	#this is the function we run in mornings when the previous day's scores need adding
	#step one: get the results from the date requested.
	#this just updates a .txt file so that future functions can find the data.
	getlines.main(mm, dd, 'y')
	datestring = "%02d%02d" %(mm, dd)
	nextm, nextd = nextDay(mm, dd)
	#we always update today.
	season.document("today").set({"date": "%02d%02d" %(nextm, nextd)})
	games = post_date(datestring)
	if games: 
		winners = [ games[f"ats_win_{i}"] for i in range(games["totg"]) ]
		user_col = db.collection("users")
		all_users = [u.id for u in user_col.stream()]
		for user in all_users:
			initialize_stats(user)
			process_user_wins(user, datestring, winners)
		makeTeamDocuments()

	#lastly if there are potentially games on the next date, find them.
	if "%02d%02d" %(nextm, nextd) <= CurrentSeasonEnd:
		getlines.main(nextm, nextd, 'n')
		post_date("%02d%02d" %(nextm, nextd))

def makeTeamDocuments():
	teamdict = nbateam.teamDict()
	for team in teamdict:
		season.document(f"team_{team}").set(teamdict[team])

def nextDay(mm, dd):
	if mm in [10, 12, 13, 15, 17] and dd <= 30: return (mm, dd+1)
	elif mm in [10, 12, 13, 15, 17] and dd == 31: return (mm+1, 1)
	elif mm in [11, 18] and dd <= 29: return (mm, dd+1)
	elif mm in [11, 18] and dd == 30: return (mm+1, 1)
	elif mm == 14 and dd <= 27: return (mm, dd+1)
	elif (mm, dd) == (14, 28) and int(CurrentSeason[3:])%4 != 0: return (15, 1)
	elif (mm, dd) == (14, 28) and int(CurrentSeason[3:])%4 == 0: return (14, 29)
	elif (mm, dd) == (14, 29): return (15, 1)
	else: raise ValueError(f"{mm}{dd} is not something nextDay can handle")

if __name__ == '__main__':
	if len(argv) == 3:
		if argv[1].isdigit() and int(argv[1]) in range(10, 19):
			if argv[2].isdigit() and int(argv[2]) in range(1, 32):
				month, day = int(argv[1]), int(argv[2])
				database_update(month, day)
	elif len(argv) == 4 and argv[1] == "UPDATE":
		if argv[2].isdigit() and int(argv[2]) in range(10, 19):
			if argv[3].isdigit() and int(argv[3]) in range(1, 32):
				month, day = int(argv[2]), int(argv[3])
				getlines.main(month, day, 'n')
				post_date("%02d%02d" %(month, day))
