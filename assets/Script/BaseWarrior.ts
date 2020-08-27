import { VBaseTransform } from "./VBaseTransform";
import EnvSettings from "./EnvSettings";
import VBaseNode from "./VBaseNode";
import World from "./World";
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
    public static CHANGE_DIR:number = 7;
}

export class BaseWarrior extends VBaseNode
{
    public skills:Array<BaseSkill>;

    public ga:number;
    public af:number;
    public name:string;
    public baseHeight:number;
    protected stateTransitionDurMap;
    public vx:number;
    public vy:number;
    public attackRange:number;
    public minAttackRange:number;
    public dir:number;
    public hp:number;

    enemy: BaseWarrior;
    isOnGround:boolean;
    state:number;
    world:World;
    
    stunTime:number;
    stunWait:number;
    moveSpeed:number;

    protected activeSkill:BaseSkill;

    constructor (world:World) {
        super();
        this.skills = [];
        this.world = world;
        this.stateTransitionDurMap = {};
        this.vx = 0;
        this.vy = 0;
        this.baseHeight = 50;
        this.moveSpeed = 300;
        this.attackRange = 150;
        this.minAttackRange = this.attackRange*0.9;
        this.isOnGround = false;
        this.enemy = null;
        this.dir = 1;
        this.stunTime = 0;
        this.stunWait = 0;
        this.ga = EnvSettings.ga*1.0;
        this.af = EnvSettings.af*1.0;
        this.activeSkill = null;
    }

    public setState(state:number)
    {
        this.state = state;
    }

    public checkBodyHit(enemy)
    {

    }

    public checkKickHit(enemy)
    {
        
    }

    public setAnimState(animState:number)
    {

    }

    public update(dt:number) 
    {
        super.update(dt);
        this.vy += this.ga;
        this.y += this.vy*dt;
        if (this.y < this.baseHeight)
        {
            this.y = this.baseHeight;
            this.isOnGround = true;
        }
        if (!this.enemy) this.findEnemy();
        let dis = Math.abs(this.x - this.enemy.x);
        switch(this.state)
        {
            case WarriorCommonState.IDLE:
                break;
            case WarriorCommonState.STUN:
                if (this.stunTime < this.stunWait)
                this.stunTime += dt;
                else {
                    this.state = WarriorCommonState.ACTIVE;
                }
                break;
            case WarriorCommonState.ACTIVE:
                if (dis > this.attackRange || dis < this.minAttackRange) {
                    if (this.checkValidAttackDir())
                    {
                        this.x += this.dir*this.moveSpeed*dt;
                        this.setAnimState(WarriorAnimState.RUN);
                    }
                }
                else {
                    this.updateFighting();
                }
                break;
    
        }
        
    }

    public useSkill(ind:number)
    {
        this.activeSkill = this.skills[ind];
        this.activeSkill.start();
    }

    public stopSkill()
    {
        if (this.activeSkill) this.activeSkill.stop();
        this.activeSkill = null;
    }

    protected updateFighting()
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
    }

    public setStunFor(wait:number)
    {
        this.stunTime = 0;
        this.state = WarriorCommonState.STUN;
        this.stunWait = wait;
    }

    protected checkValidAttackDir():boolean
    {
        let moveDir = this.enemy.x - this.x >= 0?1:-1;
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
