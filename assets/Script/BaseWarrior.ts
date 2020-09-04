import { VBaseTransform } from "./VBaseTransform";
import EnvSettings from "./EnvSettings";
import {VBaseNode} from "./VBaseNode";
import {World} from "./World";
import {BaseSkill} from "./BaseSkill";

export class WarriorDir
{
    public static TO_LEFT:number = 1;
    public static TO_RIGHT:number = -1;
}

export class WarriorCommonState
{
    public static IDLE:number = 0;
    public static ACTIVE:number = 1;
    public static STUN:number = 2;
    public static FIGHTING:number = 3;
    public static DIE:number = 4;
    public static WIN:number = 5;
    public static STUN_DOWN:number = 6;
}

export class WarriorFightingState
{
    public static DODGE_MOVING:number = 100;
    public static JUMPING:number = 101;
    public static KICKING:number = 102;
    public static LANDING:number = 103;
    public static FALLING:number = 104;
    public static HEAD_ATTACK:number = 105;
}

export class WarriorAnimState
{
    public static IDLE:number = 0;
    public static STUN:number = 1;
    public static KICK:number = 2;
    public static LANDING:number = 3;
    public static FALLING:number = 4;
    public static WALK:number = 5;
    public static RUN:number = 6;
    public static BACKWARD:number = 7;
    public static CHANGE_DIR:number = 8;
    public static FIGHTING_IDLE:number = 9;
    public static DOWN:number = 10;
    public static DODGE_GROUND:number = 11;

    // chick
    public static CROUCH:number = 20;
    public static JUMP_HIGHT_FORWARD:number = 21;
    public static JUMP_HIGHT_BACKWARD:number = 22;
    public static ATTACK_MIDDLE_1:number = 23;
    public static DIE:number = 24;
    public static WIN:number = 25;
}

export class BaseWarrior extends VBaseNode
{
    public skills:Array<BaseSkill>;

    public ga:number;
    public af:number;
    public name:string;
    public baseHeight:number;
    public vx:number;
    public vy:number;
    public attackRange:number;
    public minAttackRange:number;
    public dir:number;
    public hp:number;
    public hitRadius:number;
    public reserveTime;

    protected stateTransitionDurMap;

    enemy: BaseWarrior;
    isOnGround:boolean;
    lastIsOnGround:boolean;
    state:number;
    world:World;
    
    stunTime:number;
    stunWait:number;
    public moveSpeed:number;
    moveVal:number;
    public totalHp:number;

    protected activeSkill:BaseSkill;
    public anim:any;
    public animStateMap:any;
    public animLoopMap:any;
    public transDurMap:any;
    protected curAnimState:number;
    protected mixAnimTime:number;

    protected isDie:boolean;
    protected isWin:boolean;
    protected winTime:number;
    protected winDur:number;

    public targetScaleY:number;
    public defaultScaleY:number;

    public stunDownTime:number;

    constructor(world:World) {
        super();
        this.skills = [];
        this.world = world;
        this.stateTransitionDurMap = {};
        this.transDurMap = {};
        
        this.mixAnimTime = 0;
        this.baseHeight = 60;
        this.hitRadius = 40;
        this.moveSpeed = 600;
        this.attackRange = 300;
        this.attackRange = 300;
        
        this.winDur = 1.5;
        this.minAttackRange = this.attackRange*0.6;
        
        this.ga = EnvSettings.ga*1.0;
        this.af = EnvSettings.af*1.0;
        this.totalHp = 100;
        this.anim = null;
        this.animStateMap = {};
        this.animLoopMap = {};
        this.curAnimState = -1;
        this.anim = null;
        this.reset();
    }

    public reset()
    {
        this.vx = 0;
        this.vy = 0;
        this.enemy = null;
        this.activeSkill = null;
        this.state = WarriorCommonState.IDLE;
        this.isOnGround = true;
        this.lastIsOnGround = true;
        this.dir = 1;
        this.stunTime = 0;
        this.stunDownTime = 0;
        this.stunWait = 0;
        this.moveVal = 0;
        this.reserveTime = 0;
        this.winTime = 0;
        this.isDie = false;
        this.isWin = false;

        this.resetTransform();
        for (let i = 0; i < this.skills.length; i++) this.skills[i].reset();

        this.hp = this.totalHp;
    }

    public setAnim(anim:any)
    {
        this.anim = anim;
        this.defaultScaleY = this.anim.scaleY;
        this.targetScaleY = this.anim.scaleY;
    }

    public getMoveVal():number
    {
        return this.moveVal;
    }

    public getHp()
    {
        return this.hp;
    }

    public setState(state:number)
    {
        this.state = state;
    }

    public getIsOnGround():boolean
    {
        return this.isOnGround;
    }

    public setAnimState(animState:number)
    {
        if (this.curAnimState == animState) return;
        this.mixAnim(animState);
    }

    public playAnim(state:number)
    {
    }

    public mixAnim(animState:number)
    {
    }

    public update(dt:number) 
    {
        super.update(dt);
        if (this.y > 0) this.vy += this.ga*dt;
        this.y += this.vy*dt;
        this.isOnGround = false;
        
        if (this.reserveTime > 0) this.reserveTime -= dt;
        if (this.y <= this.baseHeight)
        {
            this.y = this.baseHeight;
            this.isOnGround = true;
        }

        if (!this.isOnGround)
        {
            this.x += this.vx*dt;
            this.vx += this.af*dt;

            this.lastIsOnGround = false;
        }

        if (!this.enemy) this.findEnemy();
        let dis = Math.abs(this.x - this.enemy.x);

        switch(this.state)
        {
            case WarriorCommonState.IDLE:
                this.setAnimState(WarriorAnimState.IDLE);
                this.moveVal *= 0.8;
                this.x += this.moveVal*dt;
                break;
            case WarriorCommonState.STUN_DOWN:
                this.setAnimState(WarriorAnimState.DOWN);
                this.targetScaleY = this.defaultScaleY*0.6;
                if (this.stunDownTime > 0)
                {
                    this.stunDownTime -= dt;
                    if (this.stunDownTime <= 0)
                    {
                        this.state = WarriorCommonState.STUN;
                    }    
                }
                break;
            case WarriorCommonState.STUN:
                if (!this.lastIsOnGround && this.isOnGround)
                {
                    this.state = WarriorCommonState.STUN_DOWN;
                    this.stunDownTime = 0.05;
                    this.lastIsOnGround = true;
                }

                this.targetScaleY = this.defaultScaleY*1.0;
                if (this.isOnGround && this.isDie)
                {
                    this.setAnimState(WarriorAnimState.DIE);
                    this.state = WarriorCommonState.DIE;
                    break;
                }
                else if (this.isOnGround && this.isWin)
                {
                    this.setAnimState(WarriorAnimState.WIN);
                    this.state = WarriorCommonState.WIN;
                    this.winTime = this.winDur;
                    break;
                }

                if (this.isOnGround)
                    this.setAnimState(WarriorAnimState.FIGHTING_IDLE);

                if (this.stunTime < this.stunWait)
                    this.stunTime += dt;
                else {
                    this.state = WarriorCommonState.ACTIVE;
                }
                this.moveVal *= 0.8;
                this.x += this.moveVal*dt;
                
                break;
            case WarriorCommonState.ACTIVE:

                if (!this.isOnGround) break;
                if (this.isDie || this.isWin) 
                {
                    this.state = WarriorCommonState.STUN;
                    break;
                }
                if (this.moveVal == 0) this.setAnimState(WarriorAnimState.FIGHTING_IDLE);
                if (dis > this.attackRange || dis < this.minAttackRange) {
                    if (this.checkValidAttackDir())
                    {
                        let val = Math.abs(this.moveVal);
                        if (dis > this.attackRange)
                        {
                            val += this.moveSpeed*0.05;
                            if (val > this.moveSpeed) val = this.moveSpeed;
                            this.moveVal = this.dir*val; // front
                            this.x += this.moveVal*dt;
                            this.setAnimState(WarriorAnimState.RUN);
                        }
                        else { // dis < this.minAttackRange
                            val += this.moveSpeed*0.05;
                            if (val > this.moveSpeed) val = this.moveSpeed;
                            this.moveVal = -this.dir*val; // back
                            this.x += this.moveVal*dt*0.8;
                            this.setAnimState(WarriorAnimState.BACKWARD);
                        } 
                    }
                }
                else {
                    this.moveVal *= 0.8;
                    if (Math.abs(this.moveVal) < 1) this.moveVal = 0;
                    this.x += this.moveVal*dt;

                    // if can not perform a skill, back to active state to check condition for valid skill attack again
                    if (this.reserveTime > 0) break;
                    if (!this.checkValidAttackDir()) break;
                    if (this.world.resting) break;
                    if (this.chooseSkill(dt))
                    {
                        this.moveVal = 0;
                        this.state = WarriorCommonState.FIGHTING;
                    }
                    else {
                        this.setAnimState(WarriorAnimState.FIGHTING_IDLE);
                    }
                }
                break;
            case WarriorCommonState.FIGHTING:
                this.updateFighting(dt);
                break;
            case WarriorCommonState.DIE:
                break;
            case WarriorCommonState.WIN:
                this.winTime -= dt;
                if (this.winTime <= 0)
                {
                    this.state = WarriorCommonState.IDLE;
                }
                break;
        }
        
    }

    protected chooseSkill(dt):boolean
    {
        return false;
    }

    public useSkill(ind:number)
    {
        this.activeSkill = this.skills[ind];
        this.activeSkill.start();
    }

    public stopSkill()
    {
        if (this.activeSkill) 
        {
            this.activeSkill.done();
            this.activeSkill = null;
        }
    }

    public onSkillDone()
    {
        this.activeSkill = null;
    }

    public hurt(damage:number, stunDur = 0.2)
    {
        cc.log('hurt == ' + this.name);
        this.stopSkill();
        this.setStunFor(stunDur);
        this.setHp(this.hp - damage);
        
        if (this.hp <= 0) this.die();
    }

    public setHp(hp)
    {
        if (hp < 0) hp = 0;
        if (hp > this.totalHp) hp = this.totalHp;
        this.hp = hp;
        this.world.onWarriorHpChange(this);
    }

    public die()
    {
        this.world.onWarriorDie(this);
        this.isDie = true;
    }

    public win()
    {
        this.isWin = true;
    }

    protected updateFighting(dt)
    {
    }

    protected setDir(dir:number)
    {
        if (!this.isOnGround) return;
        if (dir != this.dir)
        {
            // wait for changing direction in idle state
            this.setStunFor(0.2);

            // play change dir animation --
        }
        this.dir = dir;
        this.scaleX = dir;
    }

    public setStunFor(wait:number)
    {
        this.stunTime = 0;
        this.state = WarriorCommonState.STUN;
        this.stunWait = wait;
    }

    protected checkValidAttackDir():boolean
    {
        let moveDir = this.enemy.x - this.x >= 0? 1:-1;
        if (this.dir != moveDir) 
        {
            this.setDir(moveDir);
            return false;
        }
        return true;
    }

    protected findEnemy()
    {
        let wars = this.world.getChildren();

        for (let i = 0; i < wars.length; i++)
        {
            let war:BaseWarrior = wars[i] as any;
            if (war != this) 
            {
                this.enemy = war;
                break;
            }
        }
    }
}
