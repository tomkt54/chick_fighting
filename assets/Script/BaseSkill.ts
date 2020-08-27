import {BaseWarrior} from "./BaseWarrior";
import {VBaseNode} from "./VBaseNode";
import {ChickFighter} from "./ChickFighter";
import { VVec2 } from "./VBaseTransform";

export class BaseSkill extends VBaseNode
{
    public active:boolean;
    public owner:ChickFighter;
    public damage:number;
    hitProb:number;
    public attacked:boolean;

    constructor()
    {
        super();
        this.damage = 10;
        this.hitProb = 1.0;
    }

    public setOwner(owner:ChickFighter)
    {
        this.owner = owner;
    }

    public start()
    {
        this.active = true;
    }

    public stop()
    {
        this.active = false;
    }

    public done(stunDur = 0)
    {
        this.owner.stopSkill();
        this.owner.setStunFor(stunDur);
    }

    public checkSkillDone():boolean
    {
        return false;
    }

    public update(dt:number)
    {
    }
}

export class KickSkill extends BaseSkill
{
    public skillVx:number;
    public skillVy:number;
    public hitPos:VVec2;
    public lastIsOnGround:boolean;

    constructor()
    {
        super();
        this.hitPos = new VVec2();
        this.lastIsOnGround = true;
        this.skillVy = 600;
    }

    public setOwner(owner:ChickFighter)
    {
        super.setOwner(owner);
        this.hitPos.x = owner.hitRadius*1.6;
        this.hitPos.y = -owner.hitRadius*0.2;
    }

    public start()
    {
        super.start();
        let owner = this.owner;
        let dis = Math.abs(this.owner.x - this.owner.enemy.x);
        this.skillVx = dis*1.6;
        
        owner.vx = owner.dir*this.skillVx;
        owner.vy = this.skillVy;
        this.lastIsOnGround = true;

        // play anim sequence ---
        // current -> crouch -> jumpHighBackWard -> attackMiddle1 -> jumpHighForward -> landing -> crouch
    }

    public calLandingDur():number
    {
        return 1.0;
    }

    public checkSkillDone():boolean
    {
        if (!this.lastIsOnGround && this.owner.getIsOnGround())
        {
            cc.log('kick skill end');
            return true;
        }
        this.lastIsOnGround = this.owner.getIsOnGround();
        return false;
    }

    public update(dt:number)
    {
        super.update(dt);

        // incase the skill not yet exercuted, how it will be done? --
        if (this.checkSkillDone()) this.done(0.2);
        // -----------------------------------------

        if (!this.active) return;

        let owner = this.owner;
        let enemy:ChickFighter = this.owner.enemy as any;
        

        // check for skill exercution -------
        if (this.skillVy > 0 && this.owner.vy > 0 && this.owner.vy < this.skillVy*0.9)
        {
            // check kick hit ---
            let p = owner.toGlobal(this.hitPos);
            let v = new VVec2(p.x - enemy.x, p.y - enemy.y);
            let dis = Math.sqrt(v.x*v.x + v.y*v.y);
            if (dis < enemy.hitRadius)
            {
                cc.log('kick skill exercuted ---');
                enemy.vy -= 50;
                // wait for landing
                enemy.hurt(this.damage, 0.5);
                this.done(0.7); 
                return;        
            }
        }
        // ---------------------

    }
}