import os
from nba_fire_config import DataPath

def teamDict():
	days = sorted(os.listdir(f"{DataPath}/2223/lines/"))
	teamdict = {} #will be {TEAM : {TEAM: TEAM, ATS_W/L/T: #, GAME_N: [...]}}
	for fname in days:
		dayfile = open(f"{DataPath}/2223/lines/{fname}", 'r')
		lines = [l.strip() for l in dayfile.readlines() if l.strip() != ""]
		for line in lines:
			x = line.split('\t')
			home = x[0] if "@" in x[0] else x[2]
			fav, dog = x[0].replace("@", ""), x[2].replace("@", "")
			spread = x[1]
			score = x[3]
			
			if "-" in score:
				fav_won = score.split()[0] == fav
				fav_adj_score = int(score.split()[1]) + float(spread) if fav_won else int(score.split()[3]) + float(spread)
				dog_score = int(score.split()[3]) if fav_won else int(score.split()[1])
				if fav_adj_score == dog_score: ats_win = "push"
				else: ats_win = fav if fav_adj_score > dog_score else dog
			else: ats_win = "tbd"
			
			if fav not in teamdict:
				teamdict[fav] = {"team": fav, "ats_w": 0, "ats_l": 0, "ats_t": 0}
			if dog not in teamdict:
				teamdict[dog] = {"team": dog, "ats_w": 0, "ats_l": 0, "ats_t": 0}
				
			if ats_win == "push": fav_relats = "p"; dog_relats = "p"
			elif ats_win == "tbd": fav_relats = "n"; dog_relats = "p"
			elif ats_win == fav: fav_relats = "w"; dog_relats = "l"
			elif ats_win == dog: fav_relats = "l"; dog_relats = "w"
			else: raise AssertionError(f"ats_win is unexpected\n{line}")
			
			fav_gameno = teamdict[fav]["ats_w"] + teamdict[fav]["ats_l"] + teamdict[fav]["ats_t"]
			fav_data = [fname[:4], score, spread, fav_relats]
			teamdict[fav][f"game_{fav_gameno}"] = fav_data
			if fav_relats == "w": teamdict[fav]["ats_w"] += 1
			elif fav_relats == "l": teamdict[fav]["ats_l"] += 1
			elif fav_relats == "p": teamdict[fav]["ats_t"] += 1
			
			dog_gameno = teamdict[dog]["ats_w"] + teamdict[dog]["ats_l"] + teamdict[dog]["ats_t"]
			dog_data = [fname[:4], score, spread.replace("-", "+"), dog_relats]
			teamdict[dog][f"game_{dog_gameno}"] = dog_data
			if dog_relats == "w": teamdict[dog]["ats_w"] += 1
			elif dog_relats == "l": teamdict[dog]["ats_l"] += 1
			elif dog_relats == "p": teamdict[dog]["ats_t"] += 1
			
	return teamdict
