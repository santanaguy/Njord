import { PositionGeneratorType } from './Enums';
import { Point } from "./Point";
import { PositionGenerator } from "./PositionGenerator";
import { Subscription } from 'rxjs';

export class Target {
    private _lastIdGenerator = 0;
    private _firstGeneratorSubscription: Subscription;
    public id: string;
    public position: Point;
    public cog: number;
    public positionGenerators: PositionGenerator[] = [];

    constructor(id: string, position: Point) {
        this.id = id;
        this.position = position;
        this._firstGeneratorSubscription = new Subscription();
        this.addPositionGenerator();
    }

    public deleteGenerator(idGenerator: string) {
        let idx = this.positionGenerators.findIndex(x => x.id == idGenerator);
        if (idx >= 0) {
            this.positionGenerators.splice(idx, 1);
            if (idx == 0) {
                this._firstGeneratorSubscription.unsubscribe();
                this._firstGeneratorSubscription = new Subscription();
            }
        }
    }

    public duplicateGenerator(idGenerator: string) {
        let generator = this.positionGenerators.find(x => x.id == idGenerator);
        let generatorClone = generator.clone(this.newPositionGeneratorId());
        generatorClone.description = generator.description + " - copy";
        this.positionGenerators.push(generatorClone);
        return generatorClone;
    }

    public addPositionGenerator() {
        //If this is not the first generator, copy the static information from the previous one. This means the
        //user needs only to perform the changes instead of configuring it all again
        let tmp: PositionGenerator;
        if (this.positionGenerators.length == 0) {
            tmp = this.newPositionGenerator(this.position.lat, this.position.lon, true);
            this.positionGenerators.push(tmp);
        }
        else {
            let prev = this.positionGenerators[this.positionGenerators.length - 1];
            tmp = prev.clone(this.newPositionGeneratorId());
            tmp.description = "New generator";
            tmp.route = [];
            //If the prev is a point, inherit, if it is a route inherit the last route point, else inherit the target data
            if (prev.type == PositionGeneratorType.Fixed)
                tmp.position = new Point(prev.position.lat, prev.position.lon);
            else if (prev.type == PositionGeneratorType.LineString && prev.route.length > 0)
                tmp.position = new Point(prev.route[prev.route.length - 1].lat,prev.route[prev.route.length - 1].lon);
            else 
                tmp.position = new Point(this.position.lat, this.position.lon);
            tmp.type = PositionGeneratorType.Fixed;
            this.positionGenerators.push(tmp);
        }
        return tmp;
    }

    private newPositionGenerator(lat?: number, lon?: number, isFirst?: boolean): PositionGenerator {
        let id = this.newPositionGeneratorId();
        let tmp = new PositionGenerator();
        tmp.id = id;
        tmp.description = "New generator";
        tmp.position = new Point(lat, lon);
        tmp.type = PositionGeneratorType.Fixed;
        return tmp;
    }

    private newPositionGeneratorId() {
        return this.id + (this._lastIdGenerator++).toString();
    }
}