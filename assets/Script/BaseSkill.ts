import {BaseWarrior} from "./BaseWarrior";
import VBaseNode from "./VBaseNode";

export class BaseSkill extends VBaseNode
{
    public active:boolean;
    public owner:BaseWarrior;
    public damage:number;
    hitProb:number;
    constructor()
    {
        super();
        this.damage = 10;
        this.hitProb = 1.0;
    }

    public start()
    {
        this.active = true;
    }

    public stop()
    {
        this.active = false;
    }

    public update(dt:number)
    {
        
    }
}

export class KickSkill extends BaseSkill
{
    constructor()
    {
        super();
    }

    public update(dt:number)
    {
        super.update(dt);
    }
}