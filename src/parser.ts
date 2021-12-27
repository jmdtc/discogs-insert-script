import { createReadStream } from "fs";

const XmlStream = require("xml-stream");

export default (
  cb: (chunk: object, xml: any) => void,
  onEnd: () => Promise<void>
) => {
  const readStream = createReadStream("./database/dump.xml");
  // , {
  //   start: 16000005837,
  // }
  const xml = new XmlStream(readStream);

  // readStream.on("data", (d) => console.log(d.toString()));

  const collects = [
    "company",
    "video",
    "identifier",
    "artist",
    "extraartist",
    "label",
    "image",
    "track",
    "genre",
    "style",
    "format",
  ];
  for (const tag of collects) {
    xml.collect(tag);
  }

  xml.on("endElement: release", (chunk: object) => {
    cb(chunk, xml);
  });

  xml.on("end", () => onEnd());
};
