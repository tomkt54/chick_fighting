import {BaseWarrior} from "./BaseWarrior";
import {VBaseNode} from "./VBaseNode";
import {ChickFighter} from "./ChickFighter";
import { VVec2 } from "./VBaseTransform";

export class BaseSkill extends VBaseNode
{
    public active:boolean;
    public isDone:boolean;
    public owner:ChickFighter;
    public damage:number;
    hitProb:number;
    public attacked:boolean;
    public reserveTime:number;

    constructor()
    {
        super();
        this.damage = 10;
        this.hitProb = 1.0;
        this.reset();
    }

    public reset()
    {
        this.reserveTime = 0;
        this.isDone = true;
        this.active = false;
    }

    public setOwner(owner:ChickFighter)
    {
        this.owner = owner;
        this.reset();
    }

    public start()
    {
        this.reset();
        this.isDone = false;
        this.active = true;
    }

    public done(stunDur = 0.)
    {
        if (this.isDone) return;
        //cc.log('done ' + this.owner.name);
        this.owner.onSkillDone();
        // make sure owner back to stune state
        this.owner.setStunFor(stunDur);
        this.owner.reserveTime = this.reserveTime;
        this.isDone = true;
    }

    public checkSkillDone():boolean
    {
        return false;
    }

    public update(dt:number)
    {
        // incase the skill not yet exercuted, how it will be done? --
        if (this.checkSkillDone()) this.done();
        // -----------------------------------------
    }

    public deactive()
    {
        this.active = false;
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
        this.reserveTime = 0.1; //s
    }

    public setOwner(owner:ChickFighter)
    {
        super.setOwner(owner);
        this.hitPos.x = owner.hitRadius*1.6;
        this.hitPos.y = -owner.hitRadius*0.2;
    }

    public reset()
    {
        super.reset();
        this.lastIsOnGround = true;
    }

    public start()
    {
        super.start();
        let owner = this.owner;
        let dis = Math.abs(this.owner.x - this.owner.enemy.x);
        this.skillVx = dis*1.6;
        this.skillVy = 600;
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
            //cc.log('kick skill end ' + this.owner.name);
            return true;
        }
        this.lastIsOnGround = this.owner.getIsOnGround();
        return false;
    }

    public update(dt:number)
    {
        super.update(dt);
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
                //cc.log('kick skill exercuted ---'  + this.owner.name);
                enemy.vy -= 30;
                // wait for landing
                enemy.hurt(this.damage, 1.0);
                this.deactive(); 
                return;
            }
        }
        // ---------------------

    }
}

export class DodgeSkill extends BaseSkill
{
    startX:number;
    dodgeDis:number;

    constructor()
    {
        super();
    }

    public reset()
    {
        super.reset();
        this.startX = 0;
        this.dodgeDis = 200;
    }

    public setOwner(owner:ChickFighter)
    {
        super.setOwner(owner);
    }

    public start()
    {
        super.start();
        this.startX = this.owner.x;
    }

    public checkSkillDone():boolean
    {
        if (Math.abs(this.owner.x - this.startX) > this.dodgeDis)
        {
            return true;
        }
        return false;
    }

    public update(dt:number)
    {
        super.update(dt);
        if (!this.active) return;
        this.x += this.owner.dir*this.owner.moveSpeed*dt;
    }
}