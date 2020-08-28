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

    // chick
    public static CROUCH:number = 20;
    public static JUMP_HIGHT_FORWARD:number = 21;
    public static JUMP_HIGHT_BACKWARD:number = 22;
    public static ATTACK_MIDDLE_1:number = 23;
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
    state:number;
    world:World;
    
    stunTime:number;
    stunWait:number;
    public moveSpeed:number;
    moveVal:number;

    protected activeSkill:BaseSkill;

    constructor(world:World) {
        super();
        this.skills = [];
        this.world = world;
        this.stateTransitionDurMap = {};
        
        this.baseHeight = 60;
        this.hitRadius = 50;
        this.moveSpeed = 300;
        this.attackRange = 300;
        this.minAttackRange = this.attackRange*0.6;
        
        this.ga = EnvSettings.ga*1.0;
        this.af = EnvSettings.af*1.0;
        this.reset();
    }

    public reset()
    {
        this.vx = 0;
        this.vy = 0;
        this.enemy = null;
        this.activeSkill = null;
        this.state = WarriorCommonState.IDLE;
        this.isOnGround = false;
        this.dir = 1;
        this.stunTime = 0;
        this.stunWait = 0;
        this.moveVal = 0;
        this.reserveTime = 0;
        this.resetTransform();
        for (let i = 0; i < this.skills.length; i++) this.skills[i].reset();
    }

    public setState(state:number)
    {
        this.state = state;
    }

    public getIsOnGround():boolean
    {
        return this.isOnGround;
    }

    public setAnimState(animState:number, transDur:number = 0.1)
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
        }

        if (!this.enemy) this.findEnemy();
        let dis = Math.abs(this.x - this.enemy.x);
        switch(this.state)
        {
            case WarriorCommonState.IDLE:
                this.moveVal *= 0.9;
                break;
            case WarriorCommonState.STUN:
                this.moveVal *= 0.9;
                if (this.stunTime < this.stunWait)
                this.stunTime += dt;
                else {
                    this.state = WarriorCommonState.ACTIVE;
                }
                break;
            case WarriorCommonState.ACTIVE:

                if (!this.isOnGround) break;
                if (dis > this.attackRange || dis < this.minAttackRange) {
                    if (this.checkValidAttackDir())
                    {
                        if (dis > this.attackRange)
                        {
                            this.moveVal += this.moveSpeed*0.05;
                            if (this.moveVal > this.moveSpeed) this.moveVal = this.moveSpeed;
                            this.x += this.dir*this.moveVal*dt;
                            this.setAnimState(WarriorAnimState.RUN);
                            
                        }
                        else { // dis < this.minAttackRange
                            this.moveVal += this.moveSpeed*0.03;
                            if (this.moveVal > this.moveSpeed) this.moveVal = this.moveSpeed;
                            this.x -= this.dir*this.moveVal*dt*0.8;
                            this.setAnimState(WarriorAnimState.BACKWARD);
                        } 
                    }
                }
                else {
                    // if can not perform a skill, back to active state to check condition for valid skill attack again
                    if (this.reserveTime > 0) break;
                    if (!this.checkValidAttackDir()) break;
                    if (this.world.resting) break;
                    if (this.chooseSkill(dt))
                    {
                        this.state = WarriorCommonState.FIGHTING;
                        this.setAnimState(WarriorAnimState.FIGHTING_IDLE);
                    }
                }
                break;
            default:
                this.updateFighting(dt);
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
