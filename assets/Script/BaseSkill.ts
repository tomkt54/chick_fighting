import {WarriorAnimState, BaseWarrior, WarriorFightingState} from "./BaseWarrior";
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
    doneStunDur:number;
    public attacked:boolean;
    public reserveTime:number;
    public prepareTime:number;
    public prepareDur:number;

    constructor()
    {
        super();
        this.damage = 10;
        this.hitProb = 1.0;
        this.prepareDur = 0;
        this.doneStunDur = 0;
        this.reset();
    }

    public reset()
    {
        this.reserveTime = 0;
        this.isDone = true;
        this.active = false;
        this.prepareTime = this.prepareDur;
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

    public done()
    {
        if (this.isDone) return;
        //cc.log('done ' + this.owner.name);
        this.owner.onSkillDone();
        // make sure owner back to stune state
        this.owner.setStunFor(this.doneStunDur);
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
    protected alwaysAttack:boolean;

    constructor()
    {
        super();
        this.hitPos = new VVec2();
        this.lastIsOnGround = true;
        this.damage = 25;
        this.doneStunDur = 0.1;
        this.alwaysAttack = false;
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
        this.prepareDur = 0.1;
        this.reserveTime = 0.1; //s
    }

    public start()
    {
        super.start();
        this.alwaysAttack = this.owner.world.getRand() < 0.3;
        let owner = this.owner;
        let dis = Math.abs(this.owner.x - this.owner.enemy.x);
        this.skillVx = dis*(1.2 + this.owner.world.getRand()*0.8);
        this.skillVy = 820 + this.owner.world.getRand()*200;
        owner.vx = owner.dir*this.skillVx;
        owner.vy = this.skillVy;
        this.lastIsOnGround = true;

        // play anim sequence ---
        // current -> crouch -> jumpHighBackWard -> attackMiddle1 -> jumpHighForward -> landing -> crouch
    }

    public done()
    {
        super.done();
        cc.log('kick done.');
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

    public checkWillAttack():boolean
    {
        if (this.alwaysAttack) return true;
        let dis = Math.abs(this.owner.y - this.owner.enemy.y);
        if (!this.owner.enemy.isOnGround)
        {
            return true;
        }
        return false;
    }

    public update(dt:number)
    {
        super.update(dt);

        if (this.owner.vy < 0)
        {
            if (Math.abs(this.owner.vy) > this.skillVy*0.1)
            {
                this.owner.setAnimState(WarriorAnimState.LANDING);
            }
        }
        
        if (!this.active) return;

        if (this.prepareTime > 0)
        {
            this.prepareTime -= dt;
            if (this.prepareTime <= 0)
            {
                this.owner.setAnimState(WarriorAnimState.JUMP_HIGHT_BACKWARD);
            }
            return;
        }

        // update jump kick anim ---
        if (this.owner.vy > 0)
        {
            if (this.owner.vy < this.skillVy*0.1)
            {
                this.owner.setAnimState(WarriorAnimState.JUMP_HIGHT_FORWARD);
            }
            else if (this.owner.vy < this.skillVy*0.95)
            {
                if (this.checkWillAttack())
                {
                    this.owner.setAnimState(WarriorAnimState.ATTACK_MIDDLE_1);
                }
            }
        }
        
        // ------------------------

        let owner = this.owner;
        let enemy:ChickFighter = this.owner.enemy as any;

        // check for skill exercution -------
        if (this.checkWillAttack() && this.owner.vy > 0 && this.owner.vy < this.skillVy*0.9)
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
                let critical = this.owner.world.getRand()*this.damage*0.3;
                enemy.hurt(this.damage + critical, 1.0);
                this.deactive(); 
                return;
            }
        }
        // ---------------------

    }
}

export class LowDodgeSkill extends BaseSkill
{
    startX:number;
    public dodgeDis:number;
    public moveVal:number;

    constructor()
    {
        super();
    }

    public reset()
    {
        super.reset();
        this.startX = 0;
        this.dodgeDis = 200;
        this.prepareDur = 0.1;
        this.moveVal = 0;
    }

    public setOwner(owner:ChickFighter)
    {
        super.setOwner(owner);
    }

    public done()
    {
        //cc.log('LowDodgeSkill done -----------');
        super.done();
        this.owner.setAnimState(WarriorAnimState.FIGHTING_IDLE);
        // for scale down moving speed
        this.owner.moveVal = this.moveVal;
        this.owner.targetScaleY = this.owner.defaultScaleY;
    }

    public start()
    {
        //cc.log('LowDodgeSkill start -----------------------------');
        super.start();
        this.startX = this.owner.x;
        this.prepareDur = this.owner.world.getRand()*0.2;
        this.owner.targetScaleY = this.owner.defaultScaleY*0.8;
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

        if (this.prepareTime > 0)
        {
            this.prepareTime -= dt;
            if (this.prepareTime <= 0) this.owner.setAnimState(WarriorAnimState.RUN);
            return;
        }

        let val = Math.abs(this.moveVal);
        val += this.owner.moveSpeed*0.05;
        if (val > this.owner.moveSpeed) val = this.owner.moveSpeed;
        this.moveVal = this.owner.dir*val; // front
        this.owner.x += this.moveVal*dt*1.5;

        // for spine timescale update on owner ---
        this.owner.moveVal = this.moveVal;
        // ------------
    }
}