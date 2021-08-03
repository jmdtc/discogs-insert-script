// here is the rest of my shit parser implementation
//

// (async () => {
//   await initDB();
//   console.log("db setup done");

//   // process.exit(1)
//   const queue = new Queue<any>();
//   const queue2 = new Queue<any>();
//   const queue3 = new Queue<any>();
//   const queue4 = new Queue<any>();
//   let queue1IsRunning = false;
//   let queue2IsRunning = false;
//   let queue3IsRunning = false;
//   let queue4IsRunning = false;

//   const insertionClosure = createEntries();
//   parser(async (release: any, xml: any) => {
//     if (!(Number(release.$.id) % 1000)) console.log(release.$.id);

//     if (queue.length() < 100) queue.add(release);
//     else if (!queue1IsRunning) {
//       queue1IsRunning = true;
//       await queue.asyncRun(insertionClosure);
//       queue1IsRunning = false;
//     } else if (!queue2IsRunning && queue2.length() < 100) {
//       queue2.add(release);
//     } else if (queue2.length() === 100 && !queue2IsRunning) {
//       queue2IsRunning = true;
//       await queue2.asyncRun(insertionClosure);
//       queue2IsRunning = false;
//     } else if (!queue3IsRunning && queue3.length() < 100) {
//       queue3.add(release);
//     } else if (queue3.length() === 100 && !queue3IsRunning) {
//       queue3IsRunning = true;
//       await queue3.asyncRun(insertionClosure);
//       queue3IsRunning = false;
//     } else if (!queue4IsRunning && queue4.length() < 100) {
//       queue4.add(release);
//     } else if (queue4.length() === 100 && !queue4IsRunning) {
//       queue4IsRunning = true;
//       await queue4.asyncRun(insertionClosure);
//       queue4IsRunning = false;
//     } else if (
//       queue.length() === 100 &&
//       queue2.length() === 100 &&
//       queue3.length() === 100 &&
//       queue4.length() === 100
//     ) {
//       xml.pause();
//       const checkInterval = setInterval(() => {
//         if (
//           !queue1IsRunning ||
//           !queue2IsRunning ||
//           !queue3IsRunning ||
//           !queue4IsRunning
//         ) {
//           xml.resume();
//           clearInterval(checkInterval);
//         }
//       }, 100);
//     }
//   });
// })();
