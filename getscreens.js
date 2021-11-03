const fs = require("fs");
const fetch = require("node-fetch");
const screenRegex = /SCREEN* ([0-9]{1,2})/;

const rawData = fs.readFileSync("output.json");
const data = JSON.parse(rawData);
const cinemaIDs = Object.keys(data);

console.log(
  `https://www.omniplex.ie/booking/${
    data[cinemaIDs[5]].CINEMA_OPTION_ID
  }/seats/${data[cinemaIDs[5]].MOVIES[3].DATES[1].TIMES[0].TIME_VALUE}`
);

// Movie at Cinema on Date at Time is in Screen #
// console.log(`${data[cinemaIDs[5]].MOVIES[3].MOVIE_NAME} is on at ${data[cinemaIDs[5]].CINEMA_OPTION_ID} on ${data[cinemaIDs[5]].MOVIES[3].DATES[1].DATE} at ${data[cinemaIDs[5]].MOVIES[3].DATES[1].TIMES[0].TIME} in ${body.match(screenRegex)[1]}`)

// https://www.omniplex.ie/booking/antrim/seats/47039

// TESTING !
fetch(
  `https://www.omniplex.ie/booking/${
    data[cinemaIDs[5]].CINEMA_OPTION_ID
  }/seats/${data[cinemaIDs[5]].MOVIES[3].DATES[1].TIMES[0].TIME_VALUE}`
)
  .then((res) => res.text())
  .then((body) =>
    console.log(
      `${data[cinemaIDs[5]].MOVIES[3].MOVIE_NAME} is on at ${
        data[cinemaIDs[5]].CINEMA_OPTION_ID
      } on ${data[cinemaIDs[5]].MOVIES[3].DATES[1].DATE} at ${
        data[cinemaIDs[5]].MOVIES[3].DATES[1].TIMES[0].TIME
      } in screen ${body.match(screenRegex)[1]}`
    )
  );

// main asyncronous function
(async () => {
  // for each time at each location (nested loops to get through them)
  // fetch the screen and add it to the TIME: {} object as the SCREEN value
  // TODO make the above work
})();