import {VBaseNode} from "./VBaseNode";
import {ChickFighter} from "./ChickFighter";
import { BaseWarrior, WarriorCommonState } from "./BaseWarrior";
import EnvSettings from "./EnvSettings";
import { KickSkill } from "./BaseSkill";

export class World extends VBaseNode
{
    public chick1:ChickFighter;
    public chick2:ChickFighter;
    public resting:boolean;

    // can adjust restInterval to modify the battle duration
    public restInterval:number;

    // ui handler --
    public updateUIHpHdl:any;
    public onGameEndedHdl:any;
    // -----

    public baseTimeScale = 1.0;

    constructor()
    {
        super();
        this.chick1 = new ChickFighter(this);
        this.chick2 = new ChickFighter(this);
        (this.chick1.skills[0] as KickSkill).skillVy = 700;
        this.chick1.name = 'chick1';
        this.chick2.name = 'chick2';
        this.addChild(this.chick1);
        this.addChild(this.chick2);
        this.restInterval = 0;
        this.resting = false;
        this.updateUIHpHdl = null;
        this.onGameEndedHdl = null;
    }

    public reset()
    {
        this.chick1.reset();
        this.chick2.reset();
        this.chick1.x = EnvSettings.SCREEN_W*0.2;
        this.chick2.x = EnvSettings.SCREEN_W - this.chick1.x;
        this.chick2.dir = -1;
        this.chick2.scaleX = -1;
        this.updateUIHpHdl(this.chick1);
        this.updateUIHpHdl(this.chick2);
    }

    public startFighting()
    {
        this.chick1.setState(WarriorCommonState.ACTIVE);
        this.chick2.setState(WarriorCommonState.ACTIVE);
    }

    public getRand():number
    {
        return Math.random();
    }

    public update(dt:number)
    {
        dt *= this.baseTimeScale;
        super.update(dt);
        if (this.restInterval > 0)
        {
            this.restInterval -= dt;
        } 
        else {
            this.resting = this.getRand() > 0.4;
            this.restInterval = this.getRand()*2.0;
        }
        let c1 = this.chick1;
        let c2 = this.chick2;
        // check hit
        let dis = Math.abs(c1.x - c2.x);
        if (!c1.getIsOnGround() && !c2.getIsOnGround())
        {
            if ((c1.x - c2.x)*c2.vx > 0 && (c2.x - c1.x)*c1.vx > 0)
            {
                if (dis < c1.hitRadius + c2.hitRadius)
                {
                    c1.vx = - c1.vx*0.9;
                    c2.vx = - c2.vx*0.9;
                } 
            }
        }
    }

    public onWarriorDie(chick:BaseWarrior)
    {
        let winer = this.chick1 != chick ? this.chick1:this.chick2;
        let loser = this.chick1 == chick ? this.chick1:this.chick2;

        winer.win();
        if (this.onGameEndedHdl) this.onGameEndedHdl();
    }

    public onWarriorHpChange(chick:BaseWarrior)
    {
        if (this.updateUIHpHdl) this.updateUIHpHdl(chick);
    }

}