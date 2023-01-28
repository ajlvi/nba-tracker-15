from urllib.request import urlopen
from nba_fire_config import DataPath
from sys import stdout, argv
import time, datetime

teamdict = {'MIL' : 'MIL', 'MIN' : 'MIN', 'MIA' : 'MIA', 'WAS' : 'WSH', 'ATL' : 'ATL', 'BOS' : 'BOS', 'DET' : 'DET', 'DEN' : 'DEN', 'Nets' : 'BKN', 'NO' : 'NO', 'SAC' : 'SAC', 'POR' : 'POR', 'ORL' : 'ORL', 'NY' : 'NY', 'UTA' : 'UTAH' , 'CLE' : 'CLE', 'CHA' : 'CHA', 'TOR' : 'TOR', 'GS' : 'GS', 'CHI': 'CHI', 'HOU' : 'HOU', 'LAL' : 'LAL', 'PHI' : 'PHI', 'MEM' : 'MEM', 'LAC' : 'LAC', 'DAL' : 'DAL', 'OKC' : 'OKC' , 'PHO' : 'PHX' , 'IND' : 'IND' , 'SA' : 'SA', "BK": "BKN"}

#year, month, day = 0, 0, 0

def everyother(l): return [i for i in l if l.index(i)%2 == 0]

def spanstrip(l):
	return l.split("<span>")[1].split("</span>")[0]

def getspans(lines):
	spans = [i for i in range(len(lines)) if "<span>" in lines[i]]
	return everyother([s for s in spans if spanstrip(lines[s]).isdigit()])

def getodds(gb):
	return gb.split('game-odd="')[1].split('"')[0]

def getawayscore(gb):
	return int(gb.split('away-score="')[1].split('"')[0])

def gethomescore(gb):
	return int(gb.split('home-score="')[1].split('"')[0])

def getdata(span, lines, scores):
	#will return [#, AWAY, HOME, ASC, HSC, LINE]
	numb = spanstrip(lines[span])
	
	time = 0
	
	idx = -5
	while "cmg_team_name" not in lines[span+idx-1]:
		idx += 1
		if "cmg_game_time" in lines[span+idx-1]:
			time = setTime(lines[span+idx])
					
	awayteam = teamdict[lines[span+idx].strip()]
	
	idx += 1
	while "cmg_team_name" not in lines[span+idx-1]:
		idx += 1
		if "cmg_game_time" in lines[span+idx-1]:
			time = setTime(lines[span+idx])
		
	try:
		hometeam = teamdict[lines[span+idx+2].strip()]
	except KeyError: #seems like there's a blank line if the game hasn't started
		hometeam = teamdict[lines[span+idx+1].strip()]

# THIS WORKS 23.01.20 but is inelegant	
#	if lines[span-1].strip() != "":
#		awayteam = teamdict[lines[span-1].strip()]
#		hometeam = lines[span+94].strip()
#		hometeam = lines[span+95].strip()
#	else: #seems to happen if nothing has started on the day
#		awayteam = teamdict[lines[span-2].strip()]
#		hometeam = lines[span+45].strip()
#		if hometeam == '</div>': hometeam = lines[span+44].strip()

	hometeam = "@" + hometeam
	assert hometeam != "@"
#	print awayteam, hometeam

	startSearch = 40
	while startSearch > 0 and "game-odd" not in lines[span-startSearch]: 
		if "game-odd" not in lines[span-startSearch]: startSearch -= 1
		
	gb = lines[span-startSearch]
	try: assert "game-odd" in gb
	except AssertionError:
		print(span, "odds missing")
		for i in range(-30, 0): print(f"{i} {lines[span+i][:50].strip()}")
		raise AssertionError 
	odds = getodds(gb)

	if scores == "n": return (numb, awayteam, hometeam, time, 0, odds)

	awayscore = getawayscore(gb)
	homescore = gethomescore(gb)
	return (numb, awayteam, hometeam, awayscore, homescore, odds)

def score(game):
	if game[3] > game[4]: #away team won
		output = "%s %d - %d %s" %(game[1], game[3], game[4], game[2].strip("@"))
	else:
		output = "%s %d - %d %s" %(game[2].strip("@"), game[4], game[3], game[1])
	return output

def setTime(line):
	assert "PM" in line
	start_hour = 12 + int(line.split(":")[0])
	start_minutes = int(line.split(":")[1].split()[0])
	date = datetime.datetime(year, month, day, start_hour, start_minutes, 0)
	return time.mktime(date.timetuple())

def makeTXTs(games, day, month, yesno):
	mo = month + 12 if month < 10 else month
	outfile = open(f'{DataPath}/2023/lines/%02d%02d.txt' %(mo, day), 'w')
	for game in games:
		home, away = game[2], game[1]
		odds = float(game[5])
		if odds < 0: #home team favored
			noline = "%s\t%s\t%s\t%d" %(home, game[5], away, int(game[3]))
			withline = "%s\t%s\t%s\t%s" %(home, game[5], away, score(game))
		else: 
			noline = "%s\t%s\t%s\t%d" %(away, "-"+game[5], home, int(game[3]))
			withline = "%s\t%s\t%s\t%s" %(away, "-"+game[5], home, score(game))
		if yesno == "y":
			outfile.write(withline)
		else:
			assert yesno == "n"
			outfile.write(noline)
		if game != games[-1]: outfile.write('\n')
	outfile.close()

def main(mo, day, yesno):
	global year; year = 2022
	global month
	if mo > 12:
		month -= 12
		year += 1
	url = "http://www.covers.com/Sports/NBA/Matchups?selectedDate=%d-%02d-%02d"\
		  %(year, month, day)
	print(url)
	page = urlopen(url)
	lines = [line.decode() for line in page.readlines()]
	games = []
	spans = getspans(lines)
	for span in spans:
		data = getdata(span, lines, yesno)
		print(data)
		games.append(data)
	games.sort(key = lambda game: game[0])
	makeTXTs(games, day, month, yesno)

if __name__ == '__main__':
	if len(argv) == 4:
		if argv[1].isdigit() and int(argv[1]) in range(10, 17):
			if argv[2].isdigit() and int(argv[2]) in range(1, 32):
				if argv[3] in ["y", "n"]:
					global month; global day
					month, day = int(argv[1]), int(argv[2])
					main(month, day, argv[3])
