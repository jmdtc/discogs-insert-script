import parser from "./parser";
import initDB from "./sequelize/initDB";
import SmartQueue from "./smartQueue";

(async () => {
  const sequelize = await initDB();
  console.log("db setup done");

  const queueLimit = 10000;
  const queue = new SmartQueue(sequelize);

  parser(
    async (release: any, xml: any) => {
      if (!(Number(release.$.id) % 50000)) console.log(release.$.id);

      if (!release.genres.genre.some((el: any) => el === "Electronic")) return;
      queue.prepareData(release);
      if (queue.length() === queueLimit) {
        xml.pause();
        await queue.run();
        xml.resume();
      }
    },
    async () => await queue.run()
  );
})();
