import parser from "./parser"
import createEntries from "./createEntries"
import initDB from "./sequelize/initDB"

(async () => {
    await initDB()
    let releaseID: number
    let s: number = 0
    setInterval(() => {
        s += 1
        console.log(releaseID, s);
        
    }, 1000)
    parser(async (release: any, xml: any) => {
        releaseID = Number(release.$.id);
        xml.pause()
        await createEntries(release);
        xml.resume()
    })
})()