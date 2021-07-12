import {
    Sequelize,
    DataTypes,
    Model,
    Association,
    BelongsToManyAddAssociationMixin
} from "sequelize"
import Artist from "../artist"
import Genre from "../genre"
import Style from "../style"
import Track from "../track"
import Label from "../label"
import Format from "../format"

interface ReleaseAttributes {
    id: number;
    title: string;
    country: string;
    releaseDate: Date;
    notes: string;
    masterId: number;
}

export default class Release extends Model<ReleaseAttributes, {}>
    implements ReleaseAttributes {
    public id!: number;
    public title!: string;
    public country!: string;
    public releaseDate!: Date;
    public notes!: string;
    public masterId!: number;

    public readonly artists?: Artist;
    public readonly styles?: Style;
    public readonly genres?: Genre;

    public addStyles!: BelongsToManyAddAssociationMixin<Style, Style[]>
    public addGenres!: BelongsToManyAddAssociationMixin<Genre, Genre[]>
    public addFormats!: BelongsToManyAddAssociationMixin<Format, Format[]>
    public addTracks!: BelongsToManyAddAssociationMixin<Track, Track[]>

    public static associations: {
        artists: Association<Release, Artist>;
        styles: Association<Release, Style>;
        genres: Association<Release, Genre>;
        label: Association<Release, Label>;
        formats: Association<Release, Format>;
        tracks: Association<Release, Track>;
    };
}

export const initReleaseModel = async function (sequelize: Sequelize): Promise<void> {
    try {
        Release.init({
            id: {
                type: new DataTypes.INTEGER,
                primaryKey: true
            },
            title: {
                type: new DataTypes.STRING,
                allowNull: false
            },
            country: {
                type: new DataTypes.STRING,
                allowNull: true
            },
            releaseDate: {
                type: new DataTypes.DATE,
                allowNull: true
            },
            notes: {
                type: new DataTypes.TEXT,
                allowNull: true
            },
            masterId: {
                type: new DataTypes.INTEGER,
                allowNull: true
            }
        }, {
            tableName: "releases",
            timestamps: false,
            underscored: true,
            sequelize
        })
        await Release.sync({ force: true })
    } catch (error) {
        console.error(error)
    }
}