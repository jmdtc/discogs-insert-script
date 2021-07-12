import createRelease from "./sequelize/insertFunctions/Release/createRelease"

import Release from "./sequelize/models/release"
import Artist from "./sequelize/models/artist"
import Style from "./sequelize/models/style"
import Genre from "./sequelize/models/genre"
import Format from "./sequelize/models/format"
import Label from "./sequelize/models/label"
import Track from "./sequelize/models/track"

const insertGenres = async function (genres: any, insertedRelease: Release): Promise<void> {
    if (!genres) return
    for (const el of genres) {
        const [currentGenre] = await Genre.findOrCreate({
            where: { name: el },
        })
        await insertedRelease.addGenres([currentGenre])
    }
}
const insertStyles = async function (styles: any, insertedRelease: Release): Promise<void> {
    if (!styles) return
    for (const el of styles) {
        const [currentStyle] = await Style.findOrCreate({
            where: { name: el },
        })
        await insertedRelease.addStyles([currentStyle])
    }
}
const insertTracks = async function (tracks: any, insertedRelease: Release): Promise<void> {
    if (!tracks) return
    const insertedTracks: Track[] = []
    for (const { position, title, duration } of tracks) {
        const currentTrack = await Track.create({
            position: position,
            title: title,
            duration: duration
        })
        insertedTracks.push(currentTrack)
    }
    await insertedRelease.addTracks(insertedTracks)
}
const insertFormats = async function (formats: any, insertedRelease: Release): Promise<void> {
    if (!formats) return
    for (const { descriptions, $ } of formats) {
        const [currentFormat] = await Format.findOrCreate({
            where: { name: $.name },
            defaults: {
                name: $.name,
                description: descriptions ? descriptions.description : null
            }
        })
        await insertedRelease.addFormats([currentFormat])
    }
}
const insertLabels = async function (labels: any, insertedRelease: Release): Promise<void> {
    if (!labels) return
    for (const { $ } of labels) {
        const [currentLabel] = await Label.findOrCreate({
            where: { id: $.id },
            defaults: {
                name: $.name,
                catno: $.catno
            }
        })
        await currentLabel.addReleases([insertedRelease])
    }
}


const insertAssociations = async function (release: any, insertedRelease: Release): Promise<void> {
    const { style } = release.styles || {}
    const { genre } = release.genres || {}
    const { track } = release.tracklist || {}
    const { label } = release.labels || {}
    const { format } = release.formats || {}

    const funcs = [
        {
            func: insertStyles,
            arg: style
        },
        {
            func: insertGenres,
            arg: genre
        },
        {
            func: insertTracks,
            arg: track
        },
        {
            func: insertLabels,
            arg: label
        },
        {
            func: insertFormats,
            arg: format
        },
    ]
    await Promise.all(funcs.map(({func, arg}) => func(arg, insertedRelease)))
}


export default async function (release: any): Promise<void> {
    try {
        const { artist } = release.artists

        let insertedRelease: any
        for (let idx = 0; idx < artist.length; idx++) {

            const [currentArtist] = await Artist.findOrCreate({
                where: { id: artist[idx].id },
                defaults: {
                    name: artist[idx].name
                }
            })
            if (idx === 0) {
                insertedRelease = await createRelease(release)
                await currentArtist.addReleases([insertedRelease])
            } else await currentArtist.addReleases([insertedRelease])
        }
        await insertAssociations(release, insertedRelease)

    } catch (error) {
        console.log(release);
        console.error(error);
    }
}