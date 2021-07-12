import {
    Sequelize,
    DataTypes,
    Model,
    Association,
    Optional
} from "sequelize"
import Release from "../release"

interface TrackAttributes {
    id: number;
    title: string;
    duration: string;
    position: string;
}

interface TrackCreationAttributes extends Optional<TrackAttributes, "id"> { }

export default class Track extends Model<TrackAttributes, TrackCreationAttributes> {
    public id!: number;
    public title!: string;
    public duration!: string;
    public position!: string;

    public readonly release?: Release;

    public static associations: {
        release: Association<Track, Release>
    }
}

export const initTrackModel = async function (sequelize: Sequelize): Promise<void> {
    try {
        Track.init({
            id: {
                type: new DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: new DataTypes.STRING,
                allowNull: false
            },
            duration: {
                type: new DataTypes.STRING(256),
                allowNull: true
            },
            position: {
                type: new DataTypes.STRING(256),
                allowNull: true
            }
        }, {
            tableName: "tracks",
            timestamps: false,
            underscored: true,
            sequelize
        })
        await Track.sync({ force: true })
    } catch (error) {
        console.error(error)
    }
}