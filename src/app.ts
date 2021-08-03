import parser from "./parser";
import Queue from "./queue";
import createEntries from "./createEntries";
import initDB from "./sequelize/initDB";
import Release from "./sequelize/models/release/model";
import Label from "./sequelize/models/label/model";
import Artist from "./sequelize/models/artist/model";
import { Op } from "sequelize";
import Track from "./sequelize/models/track/model";
import insertTracksArtists from "./insertTracksArtists";
import { create } from "domain";

// const test = await Release.findAll({
//   include: [
//     {
//       model: Artist,
//       as: "artists",
//       where: {
//         name: {
//           [Op.iLike]: "%herbert%",
//         },
//       },
//     },
//     {
//       model: Track,
//       as: "tracks",
//       where: {
//         title: {
//           [Op.iLike]: "%make the music%",
//         },
//       },
//     },
//   ],
// });
// console.log(test);

(async () => {
  const sequelize = await initDB();
  console.log("db setup done");

  const [res]: any = await sequelize.query(
    "select id from releases order by id desc limit 1"
  );
  const lastInsertedId = res[0].id;

  // process.exit(1)
  const queue = new Queue<any>("q1");
  const queue2 = new Queue<any>("q2");
  const queue3 = new Queue<any>("q3");
  const queue4 = new Queue<any>("q4");
  let queue1IsRunning = false;
  let queue2IsRunning = false;
  let queue3IsRunning = false;
  let queue4IsRunning = false;

  const createEntriesClosure = createEntries();
  const queueLimit = 50;
  parser(async (release: any, xml: any) => {
    if (!(Number(release.$.id) % 1000)) console.log(release.$.id);
    if (Number(release.$.id) <= lastInsertedId) return;
    if (!release.genres.genre.some((el: any) => el === "Electronic")) return;

    if (queue.length() < queueLimit) {
      queue.add(release);
      if (queue.length() === queueLimit && !queue1IsRunning) {
        queue1IsRunning = true;
        await queue.asyncRun((release) => createEntriesClosure(release));
        queue1IsRunning = false;
      }
    } else if (!queue2IsRunning && queue2.length() < queueLimit) {
      queue2.add(release);
      if (queue2.length() === queueLimit && !queue2IsRunning) {
        queue2IsRunning = true;
        await queue2.asyncRun((release) => createEntriesClosure(release));
        queue2IsRunning = false;
      }
    } else if (!queue3IsRunning && queue3.length() < queueLimit) {
      queue3.add(release);
      if (queue3.length() === queueLimit && !queue3IsRunning) {
        queue3IsRunning = true;
        await queue3.asyncRun((release) => createEntriesClosure(release));
        queue3IsRunning = false;
      }
    } else if (!queue4IsRunning && queue4.length() < queueLimit) {
      queue4.add(release);
      if (queue4.length() === queueLimit && !queue4IsRunning) {
        queue4IsRunning = true;
        await queue4.asyncRun((release) => createEntriesClosure(release));
        queue4IsRunning = false;
      }
    } else if (
      queue.length() === queueLimit &&
      queue2.length() === queueLimit &&
      queue3.length() === queueLimit &&
      queue4.length() === queueLimit
    ) {
      xml.pause();
      const checkInterval = setInterval(() => {
        if (
          !queue1IsRunning ||
          !queue2IsRunning ||
          !queue3IsRunning ||
          !queue4IsRunning
        ) {
          // process.exit(1);
          xml.resume();
          clearInterval(checkInterval);
        }
      }, 100);
    }
  });
})();
