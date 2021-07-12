import {
    Sequelize,
} from "sequelize"
import Release, { initReleaseModel } from "./models/release"
import Artist, { initArtistModel } from "./models/artist"
import Style, { initStyleModel } from "./models/style"
import Genre, { initGenreModel } from "./models/genre"
import Format, { initFormatModel } from "./models/format"
import Label, { initLabelModel } from "./models/label"
import Track, { initTrackModel } from "./models/track"

export default async function (): Promise<void> {
    const sequelize = new Sequelize(
        "postgresql://unicorn_user:magical_password@localhost:6000/rainbow_database",
        { logging: false }
    )

    const initModelFunctions = [
        initReleaseModel,
        initArtistModel,
        initStyleModel,
        initGenreModel,
        initFormatModel,
        initLabelModel,
        initTrackModel
    ]
    await Promise.all(
        initModelFunctions.map(func => func(sequelize))
    )

    // M:N Artist / Release
    Artist.belongsToMany(Release, {
        through: "artist_releases",
        as: "releases"
    });
    Release.belongsToMany(Artist, {
        through: "artist_releases",
        as: "artists"
    });

    // M:N Style / Release
    Release.belongsToMany(Style, {
        through: "release_styles",
        as: "styles"
    })
    Style.belongsToMany(Release, {
        through: "release_styles",
        as: "releases"
    })

    // M:N Genre / Release
    Release.belongsToMany(Genre, {
        through: "release_genres",
        as: "genres"
    })
    Genre.belongsToMany(Release, {
        through: "release_genres",
        as: "releases"
    })

    // M:N Format / Release
    Release.belongsToMany(Format, {
        through: "release_formats",
        as: "formats"
    })
    Format.belongsToMany(Release, {
        through: "release_formats",
        as: "releases"
    })

    // O:M Release / Tracks
    Release.hasMany(Track)
    Track.belongsTo(Release)

    // O:M Label / Release
    Label.hasMany(Release)
    Release.belongsTo(Label)


    await sequelize.sync({ force: true })
}