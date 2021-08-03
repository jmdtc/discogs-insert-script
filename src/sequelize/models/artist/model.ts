import {
  Sequelize,
  DataTypes,
  Model,
  Association,
  BelongsToManyAddAssociationMixin,
} from "sequelize";
import Release from "../release";
import Track from "../track/model";

interface ArtistAttributes {
  id: number;
  name: string;
}

export default class Artist
  extends Model<ArtistAttributes, {}>
  implements ArtistAttributes
{
  public id!: number;
  public name!: string;

  public readonly releases?: Release;

  public addRelease!: BelongsToManyAddAssociationMixin<Release, number>;
  public addReleases!: BelongsToManyAddAssociationMixin<Release, Release[]>;

  public static associations: {
    releases: Association<Artist, Release>;
    tracks: Association<Artist, Track>;
  };
}

export const initArtistModel = async function (
  sequelize: Sequelize
): Promise<void> {
  try {
    Artist.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
          primaryKey: true,
        },
        name: {
          type: new DataTypes.STRING(),
          allowNull: false,
        },
      },
      {
        tableName: "artists",
        timestamps: false,
        underscored: true,
        sequelize,
      }
    );
    await Artist.sync({ alter: true });
  } catch (error) {
    console.error(error);
  }
};
