import {
  Sequelize,
  DataTypes,
  Model,
  Association,
  BelongsToManyAddAssociationMixin,
  Optional,
} from "sequelize";
import Artist from "../artist";
import Genre from "../genre";
import Style from "../style";
import Track from "../track";
import Label from "../label";
import Format from "../format";

interface ReleaseAttributes {
  id: number;
  title: string;
  country: string;
  releaseDate: Date | null;
  notes: string;
  master_id: number;
  label_id: number | null;
}

interface ReleaseCreationAttributes
  extends Optional<ReleaseAttributes, "label_id"> {}

export default class Release
  extends Model<ReleaseAttributes, ReleaseCreationAttributes>
  implements ReleaseAttributes
{
  public id!: number;
  public title!: string;
  public country!: string;
  public releaseDate!: Date | null;
  public notes!: string;
  public master_id!: number;
  public label_id!: number | null;

  public readonly artists?: Artist;
  public readonly styles?: Style;
  public readonly genres?: Genre;
  public readonly tracks?: Track;
  public readonly label?: Label;

  public addStyles!: BelongsToManyAddAssociationMixin<Style, Style[]>;
  public addGenres!: BelongsToManyAddAssociationMixin<Genre, Genre[]>;
  public addFormats!: BelongsToManyAddAssociationMixin<Format, Format[]>;
  public addTracks!: BelongsToManyAddAssociationMixin<Track, Track[]>;

  public static associations: {
    artists: Association<Release, Artist>;
    styles: Association<Release, Style>;
    genres: Association<Release, Genre>;
    label: Association<Release, Label>;
    formats: Association<Release, Format>;
    tracks: Association<Release, Track>;
  };
}

export const initReleaseModel = async function (
  sequelize: Sequelize
): Promise<void> {
  try {
    Release.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
          primaryKey: true,
        },
        title: {
          type: new DataTypes.TEXT(),
          allowNull: false,
        },
        country: {
          type: new DataTypes.STRING(),
          allowNull: true,
        },
        releaseDate: {
          type: new DataTypes.DATE(),
          allowNull: true,
        },
        notes: {
          type: new DataTypes.TEXT(),
          allowNull: true,
        },
        master_id: {
          type: new DataTypes.INTEGER(),
          allowNull: true,
        },
        label_id: {
          type: new DataTypes.INTEGER(),
          allowNull: true,
        },
      },
      {
        tableName: "releases",
        timestamps: false,
        underscored: true,
        sequelize,
      }
    );
    await Release.sync({ alter: true });
  } catch (error) {
    console.error(error);
  }
};
