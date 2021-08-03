import { DataTypes, Sequelize } from "sequelize";
import Release, { initReleaseModel } from "./models/release";
import Artist, { initArtistModel } from "./models/artist";
import Style, { initStyleModel } from "./models/style";
import Genre, { initGenreModel } from "./models/genre";
import Format, { initFormatModel } from "./models/format";
import Label, { initLabelModel } from "./models/label";
import Track, { initTrackModel } from "./models/track";

export default async function (): Promise<Sequelize> {
  const sequelize = new Sequelize(
    "postgresql://unicorn_user:magical_password@localhost:6000/rainbow_database",
    {
      logging: false,
      pool: {
        max: 50,
        idle: 10000,
      },
    }
  );

  const initModelFunctions = [
    initReleaseModel,
    initArtistModel,
    initStyleModel,
    initGenreModel,
    initFormatModel,
    initLabelModel,
    initTrackModel,
  ];
  await Promise.all(initModelFunctions.map((func) => func(sequelize)));

  // M:N Artist / Release
  Artist.belongsToMany(Release, {
    through: "artist_releases",
    as: "releases",
  });
  Release.belongsToMany(Artist, {
    through: "artist_releases",
    as: "artists",
  });

  // M:N Style / Release
  Release.belongsToMany(Style, {
    through: "release_styles",
    as: "styles",
  });
  Style.belongsToMany(Release, {
    through: "release_styles",
    as: "releases",
  });

  // M:N Genre / Release
  Release.belongsToMany(Genre, {
    through: "release_genres",
    as: "genres",
  });
  Genre.belongsToMany(Release, {
    through: "release_genres",
    as: "releases",
  });

  // M:N Format / Release
  Release.belongsToMany(Format, {
    through: "release_formats",
    as: "formats",
  });
  Format.belongsToMany(Release, {
    through: "release_formats",
    as: "releases",
  });

  // O:M Label / Release
  Label.hasMany(Release, {
    as: "releases",
    sourceKey: "id",
    foreignKey: "label_id",
  });
  Release.belongsTo(Label, {
    as: "label",
    foreignKey: "label_id",
  });

  // O:M Release / Tracks
  Release.hasMany(Track, {
    as: "tracks",
    sourceKey: "id",
    foreignKey: "release_id",
  });
  Track.belongsTo(Release, {
    as: "release",
    foreignKey: "release_id",
  });

  // M:N Track / Artist with extra columns
  const TrackArtists = sequelize.define(
    "track_artists",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      anv: {
        type: new DataTypes.TEXT(),
        allowNull: true,
      },
      role: {
        type: new DataTypes.TEXT(),
        allowNull: true,
      },
      artist_type: {
        type: new DataTypes.STRING(),
        allowNull: false,
        validate: {
          isIn: {
            args: [["artist", "extra_artist"]],
            msg: "Wrong artist_type",
          },
        },
      },
    },
    {
      timestamps: false,
      underscored: true,
    }
  );
  Track.belongsToMany(Artist, {
    through: { model: TrackArtists, unique: false },
    as: "artists",
    foreignKey: "track_id",
  });
  Artist.belongsToMany(Track, {
    through: { model: TrackArtists, unique: false },
    as: "tracks",
    foreignKey: "artist_id",
  });

  await sequelize.sync({ alter: true });
  return sequelize;
}
