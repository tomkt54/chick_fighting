import VBaseNode from "./VBaseNode";
import { BaseWarrior, WarriorCommonState } from "./BaseWarrior";
import EnvSettings from "./EnvSettings";

export default class World extends VBaseNode
{
    public war1:BaseWarrior;
    public war2:BaseWarrior;
    constructor()
    {
        super();
        this.war1 = new BaseWarrior(this);
        this.war2 = new BaseWarrior(this);
        this.war1.name = 'war1';
        this.war2.name = 'war2';
        this.addChild(this.war1);
        this.addChild(this.war2);
        this.war2.dir = -1;
    }

    public reset()
    {
        this.war1.x = EnvSettings.SCREEN_W*0.2;
        this.war2.x = EnvSettings.SCREEN_W - this.war1.x;
        this.war1.setState(WarriorCommonState.IDLE);
        this.war2.setState(WarriorCommonState.IDLE);
    }

    public startFighting()
    {
        this.war1.setState(WarriorCommonState.ACTIVE);
        this.war2.setState(WarriorCommonState.ACTIVE);
    }

    public update(dt:number)
    {
        super.update(dt);
    }

}