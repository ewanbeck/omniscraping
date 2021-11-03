const fetch = require("node-fetch");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");

const OMNI_HOMEPAGE = "https://www.omniplex.ie/";
const OMNI_LISB_URL = "https://www.omniplex.ie/cinema/lisburn";

const writeFileAtEnd = true;

// let locations = [
//   {
//     CINEMA_ID: "OMP_ANTR",
//     CINEMA_OPTION_ID: "antrim",
//     CINEMA_NAME: "Antrim",
//   },
//   {
//     CINEMA_ID: "OMP_LISB",
//     CINEMA_OPTION_ID: "lisburn",
//     CINEMA_NAME: "Lisburn",
//   }
// ];
let locations = [];
let cinemaIDs = [];
let locationsAndMovies = {};
let movies = [];
let dates = [];
let moviesAndDates = [];
let times = [];
let datesAndTimes = [];

let $ = null;

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1200,
      height: 900,
    },
    headless: true,
    slowMo: false,
  });

  const page = await browser.newPage();
  await page.goto(OMNI_HOMEPAGE);

  //Set the default time to wait on events to 5 seconds
  page.setDefaultTimeout(5000);

  const pageData = await page.evaluate(() => {
    return document.documentElement.innerHTML;
  });

  //Set $ equalt to the page content at the time of the previous page.evaluate()
  //to opperate on it using cheerio
  $ = cheerio.load(pageData);

  $("select#quickCinema")
    .find("option")
    .each((i, op) => {
      if ($(op).val() === "0") {
        return;
      } else {
        locations.push({
          CINEMA_ID: $(op).val() || null,
          CINEMA_OPTION_ID: $(op).attr("id") || null,
          CINEMA_NAME: $(op).text().substring(1) || null,
        });
      }
    });

  for (let loc of locations) {
    console.log(`Getting movies for ${loc.CINEMA_NAME}`);
    //1. select that cinema location option
    await page.select(`select#quickCinema`, loc.CINEMA_ID);
    // 2. get the page contents into cheerio
    await page.waitForTimeout(250);
    $ = cheerio.load(
      await page.evaluate(() => {
        return document.documentElement.innerHTML;
      })
    );
    // 3. traverse the options and push them into an array of movie data
    movies = [];
    moviesAndDates = [];
    $("select#quickMovie")
      .find("option")
      .each((i, op) => {
        if ($(op).val() === "0") {
          return;
        } else {
          movies.push({
            MOVIE_ID: $(op).val() || null,
            MOVIE_NAME: $(op).text() || null,
          });
        }
      });
    for (let movie of movies) {
      console.log(
        `Getting dates for ${movie.MOVIE_NAME} at ${loc.CINEMA_NAME}`
      );
      //1. select that movie location option
      await page.select(`select#quickMovie`, movie.MOVIE_ID);
      // 2. get the page contents into cheerio
      await page.waitForTimeout(200);
      $ = cheerio.load(
        await page.evaluate(() => {
          return document.documentElement.innerHTML;
        })
      );
      dates = [];
      datesAndTimes = [];
      $("select#quickDate")
        .find("option")
        .each((i, op) => {
          if ($(op).val() === "0") {
            return;
          } else {
            dates.push({
              DATE_VALUE: $(op).val() || null,
              DATE: $(op).text() || null,
            });
          }
        });
      for (let date of dates) {
        console.log(
          `Getting times for ${movie.MOVIE_NAME} at ${loc.CINEMA_NAME} on ${date.DATE_VALUE}`
        );
        //1. select that movie location option
        await page.select(`select#quickDate`, date.DATE_VALUE);
        // 2. get the page contents into cheerio
        await page.waitForTimeout(250);
        $ = cheerio.load(
          await page.evaluate(() => {
            return document.documentElement.innerHTML;
          })
        );
        times = [];
        $("select#quickTime")
          .find("option")
          .each((i, op) => {
            if ($(op).val() === "0") {
              return;
            } else {
              times.push({
                TIME_VALUE: $(op).val() || null,
                TIME: $(op).text() || null,
              });
            }
          });
        datesAndTimes.push({
          DATE_VALUE: date.DATE_VALUE,
          DATE: date.DATE,
          TIMES: times,
        });
      }
      moviesAndDates.push({
        MOVIE_ID: movie.MOVIE_ID,
        MOVIE_NAME: movie.MOVIE_NAME,
        DATES: datesAndTimes,
      });
    }
    locationsAndMovies[loc.CINEMA_ID] = {
      CINEMA_ID: loc.CINEMA_ID,
      CINEMA_OPTION_ID: loc.CINEMA_OPTION_ID,
      CINEMA_NAME: loc.CINEMA_NAME,
      MOVIES: moviesAndDates,
    };
  }

  await browser.close();

  writeFileAtEnd &&
    fs.writeFile("output.json", JSON.stringify(locationsAndMovies), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      //file written successfully
    });
})();

/*
for (let loc of locations) {
    console.log(`Getting movies for ${loc.CINEMA_NAME}`);
    //1. select that cinema location option
    await page.select(`select#quickCinema`, loc.CINEMA_ID);
    // 2. get the page contents into cheerio
    await page.waitForTimeout(250);
    $ = cheerio.load(
      await page.evaluate(() => {
        return document.documentElement.innerHTML;
      })
    );
    // 3. traverse the options and push them into an array of movie data
    movies = [];
    moviesAndDates = [];
    $("select#quickMovie")
      .find("option")
      .each((i, op) => {
        if ($(op).val() === "0") {
          return;
        } else {
          movies.push({
            MOVIE_ID: $(op).val() || null,
            MOVIE_NAME: $(op).text() || null,
          });
        }
      });
    for (let movie of movies) {
      console.log(
        `Getting dates for ${movie.MOVIE_NAME} at ${loc.CINEMA_NAME}`
      );
      //1. select that movie location option
      await page.select(`select#quickMovie`, movie.MOVIE_ID);
      // 2. get the page contents into cheerio
      await page.waitForTimeout(250);
      $ = cheerio.load(
        await page.evaluate(() => {
          return document.documentElement.innerHTML;
        })
      );
      dates = [];
      datesAndTimes = [];
      $("select#quickDate")
        .find("option")
        .each((i, op) => {
          if ($(op).val() === "0") {
            return;
          } else {
            dates.push({
              DATE_VALUE: $(op).val() || null,
              DATE: $(op).text() || null,
            });
          }
        });
      for (let date of dates) {
        console.log(
          `Getting times for ${movie.MOVIE_NAME} at ${loc.CINEMA_NAME} on ${date.DATE_VALUE}`
        );
        //1. select that movie location option
        await page.select(`select#quickDate`, date.DATE_VALUE);
        // 2. get the page contents into cheerio
        await page.waitForTimeout(250);
        $ = cheerio.load(
          await page.evaluate(() => {
            return document.documentElement.innerHTML;
          })
        );
        times = [];
        $("select#quickTime")
          .find("option")
          .each((i, op) => {
            if ($(op).val() === "0") {
              return;
            } else {
              times.push({
                TIME_VALUE: $(op).val() || null,
                TIME: $(op).text() || null,
              });
            }
          });
        datesAndTimes.push({
          DATE_VALUE: date.DATE_VALUE,
          DATE: date.DATE,
          TIMES: times,
        });
      }
      moviesAndDates.push({
        MOVIE_ID: movie.MOVIE_ID,
        MOVIE_NAME: movie.MOVIE_NAME,
        DATES: datesAndTimes,
      });
    }
    locationsAndMovies.push({
      CINEMA_ID: loc.CINEMA_ID,
      CINEMA_OPTION_ID: loc.CINEMA_OPTION_ID,
      CINEMA_NAME: loc.CINEMA_NAME,
      MOVIES: moviesAndDates,
    });
  }
*/
