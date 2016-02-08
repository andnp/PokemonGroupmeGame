This is a bot that will allow users to play a Pokemon based guessing game in Groupme.

To start this bot users need a file called ```accessKeys.json``` located in the main directory.
This file should look like:
```
{
	"access_token": "lksdfkjas1234kjasdf8u1kjf",
	"bot_id": "lkasdfj09183240981234ljadsfk"
}
```
Where ```access_token``` is the access token given by groupme, and ```bot_id``` is the id of the bot created in the groupme developer bot panel.

Next users should run:
```npm install
node game.js```
to run the game.