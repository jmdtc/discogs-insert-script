import { createReadStream } from 'fs'

const XmlStream = require('xml-stream')

export default (cb: (chunk: object, xml: any) => void) => {
    const readStream = createReadStream("./database/dump.xml");
    const xml = new XmlStream(readStream)

    const collects = ["company", "video", "identifier", "artist", "extraartist", "label", "image", "track", "genre", "style", "format"]
    for (const tag of collects) {
        xml.collect(tag)
    }

    xml.on("endElement: release", async (chunk: object) => {
        cb(chunk, xml)
        /*
        try {
        } catch (error) {
            console.error(error);
        }
        */
    })
}