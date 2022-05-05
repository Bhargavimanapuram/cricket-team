const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error message ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get List of players

app.get("/players/", async (request, response) => {
  const getListOfPlayers = `
    SELECT * FROM cricket_team;
    `;
  let playersArray = await db.all(getListOfPlayers);

  response.send(
    playersArray.map((eachObject) => {
      convertDBObjectToResponseObject(eachObject);
    })
  );
});

//Post player details

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerDetails = `
    INSERT INTO 
    cricket_team(player_name,jersey_number,role)
    VALUES ('${playerName}',${jerseyNumber},'${role}');
    `;
  await db.run(createPlayerDetails);
  response.send("Player Added to Team");
});
//Get Player Details
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};

    `;
  let player = await db.get(getPlayerDetailsQuery);
  response.send(convertDBObjectToResponseObject(player));
});

//Update Player Details
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerDetailsQuery = `
    UPDATE cricket_team
    SET player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerID};
    `;

  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerDetails = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerDetails);
  response.send("Player Removed");
});

module.exports = app;
