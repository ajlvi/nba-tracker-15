from urllib.request import urlopen
from nba_fire_config import DataPath, CurrentSeason
from sys import argv
import re
import time, datetime

teamdict = {'MIL' : 'MIL', 'MIN' : 'MIN', 'MIA' : 'MIA', 'WAS' : 'WSH', 'ATL' : 'ATL', 'BOS' : 'BOS', 'DET' : 'DET', 'DEN' : 'DEN', 'Nets' : 'BKN', 'NO' : 'NO', 'SAC' : 'SAC', 'POR' : 'POR', 'ORL' : 'ORL', 'NY' : 'NY', 'UTA' : 'UTAH' , 'CLE' : 'CLE', 'CHA' : 'CHA', 'TOR' : 'TOR', 'GS' : 'GS', 'CHI': 'CHI', 'HOU' : 'HOU', 'LAL' : 'LAL', 'PHI' : 'PHI', 'MEM' : 'MEM', 'LAC' : 'LAC', 'DAL' : 'DAL', 'OKC' : 'OKC' , 'PHO' : 'PHX' , 'IND' : 'IND' , 'SA' : 'SA', "BK": "BKN"}

#year, month, day = 0, 0, 0

def everyother(l): return [i for i in l if l.index(i)%2 == 0]

def spanstrip(l):
	return l.split("<span>")[1].split("</span>")[0]

def getspans(lines):
	spans = [i for i in range(len(lines)) if "<span>" in lines[i]]
	return everyother([s for s in spans if spanstrip(lines[s]).isdigit()])

def get_headers(lines):
	heads = [i for i in range(len(lines)) if 'covers-CoversScoreboard-gameBox-Status' in lines[i]]
	return heads

def game_index(line):
	index_regex = 'data-index="([\d]+)"'
	return int(re.findall(index_regex, line)[0])

def getodds(gb):
	return gb.split('game-odd="')[1].split('"')[0]

def getawayscore(gb):
	return int(gb.split('away-score="')[1].split('"')[0])

def gethomescore(gb):
	return int(gb.split('home-score="')[1].split('"')[0])

#def getdata(span, lines, scores):
	#this was obsoleted around the all-star break 2024 -ajlvi
	#will return [#, AWAY, HOME, ASC, HSC, LINE]
#	numb = spanstrip(lines[span])
#	time = 0
#	idx = -5
#	while "cmg_team_name" not in lines[span+idx-1]:
#		idx += 1
#		if "cmg_game_time" in lines[span+idx-1]:
#			time = setTime(lines[span+idx])
#					
#	awayteam = teamdict[lines[span+idx].strip()]
#	
#	idx += 1
#	while "cmg_team_name" not in lines[span+idx-1]:
#		idx += 1
#		if "Postponed" in lines[span+idx]: return None
#		if "cmg_game_time" in lines[span+idx-1]:
#			time = setTime(lines[span+idx])
#		
#	try:
#		hometeam = teamdict[lines[span+idx+2].strip()]
#	except KeyError: #seems like there's a blank line if the game hasn't started
#		hometeam = teamdict[lines[span+idx+1].strip()]
#
## THIS WORKS 23.01.20 but is inelegant	
##	if lines[span-1].strip() != "":
##		awayteam = teamdict[lines[span-1].strip()]
##		hometeam = lines[span+94].strip()
##		hometeam = lines[span+95].strip()
##	else: #seems to happen if nothing has started on the day
##		awayteam = teamdict[lines[span-2].strip()]
##		hometeam = lines[span+45].strip()
##		if hometeam == '</div>': hometeam = lines[span+44].strip()
#
#	hometeam = "@" + hometeam
#	assert hometeam != "@"
##	print awayteam, hometeam
#
#	startSearch = 40
#	while startSearch > 0 and "game-odd" not in lines[span-startSearch]: 
#		if "game-odd" not in lines[span-startSearch]: startSearch -= 1
#		
#	gb = lines[span-startSearch]
#	try: assert "game-odd" in gb
#	except AssertionError:
#		print(span, "odds missing")
#		for i in range(-30, 0): print(f"{i} {lines[span+i][:50].strip()}")
#		raise AssertionError 
#	odds = getodds(gb)
#
#	if scores == "n": return (numb, awayteam, hometeam, time, 0, odds)
#
#	awayscore = getawayscore(gb)
#	homescore = gethomescore(gb)
#	return (numb, awayteam, hometeam, awayscore, homescore, odds)

def getdata_fromhead_2024(head, lines, scores):
	#will return [#, AWAY, HOME, ASC, HSC, LINE]
	i=0
	while "<article" not in lines[head-i]:
		i += 1
	# step one -- teams and game number. can be done from pre-block <article> tag.
	article_line = lines[head-i]
	game_no = re.findall(r'id="nba-([\d]+)', article_line)
	assert len(game_no) > 0
	numb = int(game_no[0])
	away_regex = r'data-away-team-shortname=([\w]+)'
	home_regex = r'data-home-team-shortname=([\w]+)'
	away_teams = re.findall(away_regex, article_line)
	home_teams = re.findall(home_regex, article_line)
	assert len(away_teams) > 0
	assert len(home_teams) > 0
	away = away_teams[0].upper()
	home = home_teams[0].upper()
	away_display = article_line.split("data-away-team-displayname=")[1].split("data")[0].strip().title()
	home_display = article_line.split("data-home-team-displayname=")[1].split("data")[0].strip().title()

	# step two -- line. needs to be done relative to the home team
	# if pregame, we can find odds-data pre-game
	i=0
	while "odds-data pre-game" not in lines[head+i] and "<article" not in lines[head+i]:
		i += 1
	if "odds-data pre-game" in lines[head+i]:
		line_regex = r'covers-box">([+-][\d.]+)'
		lines_raw = re.findall(line_regex, lines[head+i+6])
		assert len(lines_raw) > 0
		awayline = lines_raw[0]
		line = eval(awayline)
	else:
		assert "<article" in lines[head+i]
		i=0
		while "covers-CoversScoreboard-gameBox-Summary" not in lines[head+i]:
			i += 1
		summary_line_regex = 'spread of <strong>([+-][\d]+)'
		line_to_winner = re.findall(summary_line_regex, lines[head+i+1])
		assert len(line_to_winner) > 0
		preliminary_line = line_to_winner[0]
		try:
			assert away_display in lines[head+i+1] or home_display in lines[head+i+1]
		except AssertionError:
			print(f"Neither {away_display} or {home_display} are in {lines[head+i+1]}")
		if away_display in lines[head+i+1]:
			line = -1 * eval(preliminary_line)
		else:
			line = eval(preliminary_line)

	# step three -- game score, or time if the game hasn't happened yet.
	seen_data_away = 0
	i=0
	while seen_data_away < 4 and "<article" not in lines[head+i]:
		if "data-away" in lines[head+i]: seen_data_away += 1
		i += 1
	if "data-away" in lines[head+i] and seen_data_away >= 4:
		score_regex = r'data-away="([\d]+)" data-home="([\d]+)"'
		score_groups = re.findall(score_regex, lines[head+i])
		assert len(score_groups) >= 1 and len(score_groups[0]) >= 2
		awayscore, homescore = int(score_groups[0][0]), int(score_groups[0][1])
		return (numb, away, home, awayscore, homescore, line)
	else:
		assert "<article" in lines[head+i]
		assert "preGame-time" in lines[head+1]
		time_regex = r'preGame-time">([^<]*)</span>'
		times = re.findall(time_regex,lines[head+1])
		assert len(times) > 0
		game_time_local = times[0]
		javascript_time = setTime(game_time_local)
		return (numb, away, home, int(javascript_time), 0, line)
		


# def getdata_fromhead(head, lines, scores):
# 	#will return [#, AWAY, HOME, ASC, HSC, LINE]	
# 	data_adjust = 2 if "matchup_game_box" in lines[head+2] else 1
# 	numb = game_index(lines[head+data_adjust])
	
# 	time = 0
# 	idx = 0
# 	while "cmg_team_name" not in lines[head+idx-1]:
# 		idx += 1
# 		if "cmg_game_time" in lines[head+idx-1]:
# 			time = setTime(lines[head+idx])
					
# 	awayteam = teamdict[lines[head+idx].strip()]
	
# 	idx += 1
# 	while "cmg_team_name" not in lines[head+idx-1]:
# 		idx += 1
# 		if "Postponed" in lines[head+idx]: return None
# 		if "cmg_game_time" in lines[head+idx-1]:
# 			time = setTime(lines[head+idx])
		
# 	try:
# 		hometeam = teamdict[lines[head+idx+2].strip()]
# 	except KeyError: #seems like there's a blank line if the game hasn't started
# 		hometeam = teamdict[lines[head+idx+1].strip()]

# 	hometeam = "@" + hometeam
# 	assert hometeam != "@"
# #	print awayteam, hometeam

# 	startSearch = 0
# 	while startSearch < 10 and "game-odd" not in lines[head+startSearch]: 
# 		if "game-odd" not in lines[head+startSearch]: startSearch += 1
		
# 	gb = lines[head+startSearch]
# 	try: assert "game-odd" in gb
# 	except AssertionError:
# 		print(head, "odds missing")
# 		for i in range(-10, 10): print(f"{i} {lines[head+i][:50].strip()}")
# 		raise AssertionError 
# 	odds = getodds(gb)
# 	if odds == '': odds = input(f"Manually provide odds for {awayteam}@{hometeam}: ")

# 	if scores == "n": return (numb, awayteam, hometeam, time, 0, odds)

# 	awayscore = getawayscore(gb)
# 	homescore = gethomescore(gb)
# 	return (numb, awayteam, hometeam, awayscore, homescore, odds)

def score(game):
	if game[3] > game[4]: #away team won
		output = "%s %d - %d %s" %(game[1], game[3], game[4], game[2].strip("@"))
	else:
		output = "%s %d - %d %s" %(game[2].strip("@"), game[4], game[3], game[1])
	return output

def setTime(line):
	assert "PM" in line
	raw_hour = int(line.split(":")[0])
	start_hour = raw_hour + (0 if raw_hour == 12 else 12)
	start_minutes = int(line.split(":")[1].split()[0])
	date = datetime.datetime(year, month, day, start_hour, start_minutes, 0)
	return time.mktime(date.timetuple())

def makeTXTs(games, day, month, yesno):
	mo = month + 12 if month < 10 else month
	outfile = open(f'{DataPath}/{CurrentSeason[1:]}/lines/%02d%02d.txt' %(mo, day), 'w')
	for game in games:
		home, away = teamdict[game[2]], teamdict[game[1]]
		odds = float(game[5])
		if odds < 0: #home team favored
			noline = f"@{home}\t{game[5]}\t{away}\t{game[3]}"
			withline = f"@{home}\t{game[5]}\t{away}\t{score(game)}"
#			noline = "%s\t%s\t%s\t%d" %(home, game[5], away, int(game[3]))
#			withline = "%s\t%s\t%s\t%s" %(home, game[5], away, score(game))
		else: 
			noline = f"{away}\t-{game[5]}\t@{home}\t{game[3]}"
			withline = f"{away}\t-{game[5]}\t@{home}\t{score(game)}"
#			noline = "%s\t%s\t%s\t%d" %(away, "-"+game[5], home, int(game[3]))
#			withline = "%s\t%s\t%s\t%s" %(away, "-"+game[5], home, score(game))
		if yesno == "y":
			outfile.write(withline)
		else:
			assert yesno == "n"
			outfile.write(noline)
		if game != games[-1]: outfile.write('\n')
	outfile.close()

def listedDay(lines):
	#reports what the source thinks today's date is.
	datesearch = [i for i in range(len(lines)) if "navigation-anchor active isDailySport" in lines[i]]
	assert len(datesearch) == 1; dateline = lines[datesearch[0]+2]
	dateregex = r'date">([A-Za-z]*) ([0-9]*)</div>'
	found_month, found_day = re.findall(dateregex, dateline)[0]
	mon_to_num = {"Oct": 10, "Nov": 11, "Dec": 12, "Jan": 13, "Feb": 14, "Mar": 15, "Apr": 16}
	return int(mon_to_num[found_month]), int(found_day)

def main(mo, da, yesno):
	global year; year = 2000 + int(CurrentSeason[1:3])
	global month; month = mo
	global day; day = da
	if mo > 12:
		month -= 12
		year += 1
	url = "https://www.covers.com/Sports/NBA/Matchups?selectedDate=%d-%02d-%02d"\
		  %(year, month, day)
	print(url)
	page = urlopen(url)
	lines = [line.decode() for line in page.readlines()]
	if listedDay(lines) != (month, day):
		print(f"date {month}-{day} does not match source date of {listedDay(lines)}")
		makeTXTs([], day, month, yesno)
	else:
		games = []
#		spans = getspans(lines)
#		for span in spans:
#			data = getdata(span, lines, yesno)
#			print(data)
#			games.append(data)
		headers = get_headers(lines)
		for head in headers[1:]:
			data = getdata_fromhead_2024(head, lines, yesno)
			print(data)
			games.append(data)
		games = [g for g in games if g]
		games.sort(key = lambda game: game[0])
		makeTXTs(games, day, month, yesno)

if __name__ == '__main__':
	if len(argv) == 4:
		if argv[1].isdigit() and int(argv[1]) in range(10, 17):
			if argv[2].isdigit() and int(argv[2]) in range(1, 32):
				if argv[3] in ["y", "n"]:
					month, day = int(argv[1]), int(argv[2])
					main(month, day, argv[3])
