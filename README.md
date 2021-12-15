## Install dependencies

First you need to install the npm modules that are dependencies for this project to run (like `express` etc...)

Use this command:

```
npm install
```

## How to contribute

In a terminal in the root directory of this project run this command:

```
node app.js
```

or alternatively run:

```
npm start
```

Either of these will start the debug server, you can then access the front-end of the application on this url:

[localhost:3000](localhost:3000) - ( `localhost:3000` )

## Git Hooks

The `build number` & `commit hash` depend on a git hook that can be found in `.githooks/pre-commit` this is a PRE commit hook that basically runs some git version commands and writes them to the `version.json` file ready to be used by the application as git commands can not be run on the Heroku side.

In order to successfully use this githook please run the following command BEFORE committing:

```
git config --local core.hooksPath .githooks
```

This will tell git to use this githooks folder instead, now you can successfully commit your changes...


## Create your own game

To create your own game for the io engine follow these steps:

1. First open the file called `games.json` this is located in the `./games` directory (along with the folder for each game and the `TEMPLATE` folder). Once you have the `games.json` file open you need to add another `{ YOUR GAME BLOCK }` to the array (`[]`) object for **YOUR** game! To do this simply copy one of the existing blocks (from opening curly brace to closing curly brace) and add it (along with a proceeding comma) to the last curly brace block, BUT before the closing square bracket `]`.
You then need to change the information in your copied block. This information is incredibly IMPORTANT so please make sure you spend some time doing it correctly:

   * Change the `id` in the object block to be the NEXT integer after the current one (0,1,2...)
   * Change the `tag` to be some UNIQUE string identifier for your game, it is VITAL that it contains no spaces and is different from the other tags.
   * Change the `title` to give your game a title, this can be whatever you want and will be visually displayed to the users.
   * Change the `folder` to match the name of the game folder that you will create in **step 2** (below)
   * Give your game a brief `description`
   * Assign the **minimum** and **maximum** amount of players for your game (`min_players` & `max_players`)
   * The `game_data` section gives you a space to provide any configurable variables for your game (e.g. score) these variables are changeable by the game creator before the game starts, you can then access these values in your `server.js` code...

2. Copy the folder called `TEMPLATE` and change the name to a string with **no spaces** for your game... (This new folder name should match the `folder` value in the `games.json` that you did in **step 1**)

example:
```
    cp TEMPLATE my_game
```

1. Inside your new game folder open the file called `client.js` and immediately change the line at the top of the file (`const GAME_TAG = "______";`) to use a **UNIQUE** game tag (a lowercase string with **no spaces**) (This tag should match the `tag` value in the `games.json` that you did in **step 1**) 

example:
```
const GAME_TAG = "my-game";
```

4. Inside your new game folder open the file called `server.js` and immediately change the line at the top of the file (`const GAME_TAG = "______";`) to use **THE SAME TAG** as you used in the above task...

example:
```
const GAME_TAG = "my-game";
```

5. Inside your new game folder open the file called `styles.css` you can put your own CSS styling into this file, I would ask that for each of your style names that you use your `GAME_TAG` at the start of ANY CSS style identifier. See the example in the `TEMPLATE` folder...

5. Now you are ready to code your game...
Here are few final useful things to know when coding your game:

   * Any specific CSS you want for your game UI elements should go in the provided `styles.css` file in your game folder. Each style should start with your **game tag** (the unique `tag`), this is NOT necessary but will make life easier for us to keep track of styles and where they come from.
   * Put any MEDIA (images/audio/video) in the provided `media` folder. This can then be accessed in your client code using this path: `${GAME_TAG}/media/____png` (as the hub engine provides endpoints for each game folder it finds matching the `tag`)
   * There are loads of comments in the `server.js` & `client.js` file to help you understand how to interact with the game system. Just as a very quick note: Your game logic (decisions about scores, what beats what etc...) should all be made on the server side `server.js` and the clients `client.js` should simply be told what is happening in terms of a game **state** the clients should recieve updates and draw the game state however you deem fit.
   * I have created 2 games (`coin-flip` & `rock-paper-scissors`) already in the games directory. You should use these as examples to see how to create your game. Feel free to copy over elements if you like, please just make sure that you `GAME_TAG` is correct for your game!
   * If you need any icons check out this site: [Font Awesome](https://fontawesome.com/v5.15/icons?m=free), this library has already been ADDED to the codebase ready for use, you can use the provided website to FIND the right icon for you and then simply added the provided code to your HTML and it should just work!