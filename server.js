const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Your code here

    if (req.method === "GET" && req.url === "/artists") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(artists));
      console.log(artists);
      return;
    }

    const urlArr = req.url.split('/');
    const artistID = urlArr[urlArr.length - 1];

    if (req.method === "GET" && req.url === `/artists/${artistID}`) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(artists[artistID]));
      return;
    }

    if (req.method === "POST" && req.url === "/artists") {
      res.statusCode = 302;
      res.setHeader("Content-Type", "application/json");

      const bodyObj = JSON.parse(reqBody);
      const newID = getNewArtistId();
      artists[newID] = { artistId: newID, name: bodyObj.name };
      res.end(JSON.stringify(artists[newID]));
      return;
    }

    if (req.method === "PATCH" && req.url === `/artists/${artistID}`) {
      res.statusCode = 302;
      res.setHeader("Content-Type", "application/json");

      if (artists[artistID]) {
        const bodyObj = JSON.parse(reqBody);
        artists[artistID].name = bodyObj.name;
        res.end(JSON.stringify(artists[artistID]));
      } else {
        console.log("No artist with this ID");
        res.end("No artist with this ID");
      }

      return;
    }

    if (req.method === "DELETE" && req.url === `/artists/${artistID}`) {
      res.statusCode = 302;
      res.setHeader("Content-Type", "application/json");
      delete artists[artistID];
      res.end(JSON.stringify(artists));
      return;
    }

    const artistID2 = urlArr[urlArr.length - 2];
    
    if (req.method === "GET" && req.url === `/artists/${artistID2}/albums`) {
      res.statusCode = 302;
      res.setHeader("Content-Type", "application/json");
      console.log(albums[artistID2]);
      res.end(JSON.stringify(albums[artistID2]));
      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end(JSON.stringify(artists));
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log('Server is listening on port', port));
