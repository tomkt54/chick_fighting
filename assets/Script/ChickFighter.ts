import { WarriorAnimState, BaseWarrior, WarriorCommonState } from "./BaseWarrior";
import { World } from "./World";
import { BaseSkill, KickSkill, LowDodgeSkill } from "./BaseSkill";
import EnvSettings from "./EnvSettings";

export class ChickFighter extends BaseWarrior
{
    public static SKILL_KICK = 0;
    public static LOW_DODGE = 1;

    constructor(world:World)
    {
        super(world);
        
        let kick = new KickSkill();
        kick.setOwner(this);
        this.skills[ChickFighter.SKILL_KICK] = kick;

        let dodge = new LowDodgeSkill();
        dodge.setOwner(this);
        this.skills[ChickFighter.LOW_DODGE] = dodge;

        this.animStateMap[WarriorAnimState.IDLE] = 'IdleStrong';
        this.animLoopMap[WarriorAnimState.IDLE] = true;

        this.animStateMap[WarriorAnimState.RUN] = 'WalkForward50';
        this.animLoopMap[WarriorAnimState.RUN] = true;

        this.animStateMap[WarriorAnimState.BACKWARD] = 'WalkBackward50';
        this.animLoopMap[WarriorAnimState.BACKWARD] = true;

        this.animStateMap[WarriorAnimState.FIGHTING_IDLE] = 'IdleThreaten2';
        this.animLoopMap[WarriorAnimState.FIGHTING_IDLE] = true;

        this.animStateMap[WarriorAnimState.JUMP_HIGHT_BACKWARD] = 'JumpHighBackward';
        this.animLoopMap[WarriorAnimState.JUMP_HIGHT_BACKWARD] = true;

        this.animStateMap[WarriorAnimState.JUMP_HIGHT_FORWARD] = 'JumpHighForward';
        this.animLoopMap[WarriorAnimState.JUMP_HIGHT_FORWARD] = true;

        this.animStateMap[WarriorAnimState.ATTACK_MIDDLE_1] = 'AttackMid1';
        this.animLoopMap[WarriorAnimState.ATTACK_MIDDLE_1] = false;

        this.animStateMap[WarriorAnimState.LANDING] = 'Landing';
        this.animLoopMap[WarriorAnimState.LANDING] = false;

        this.animStateMap[WarriorAnimState.FALLING] = 'LandingFail';
        this.animLoopMap[WarriorAnimState.FALLING] = false;

        this.animStateMap[WarriorAnimState.DIE] = 'DieGround';
        this.animLoopMap[WarriorAnimState.DIE] = false;

        this.animStateMap[WarriorAnimState.WIN] = 'Win';
        this.animLoopMap[WarriorAnimState.WIN] = false;

        this.animStateMap[WarriorAnimState.DOWN] = 'Crouch';
        this.animLoopMap[WarriorAnimState.DOWN] = false;

        this.transDurMap[WarriorAnimState.IDLE + '__' + WarriorAnimState.RUN] = 0.03;
        this.transDurMap[WarriorAnimState.FIGHTING_IDLE + '__' + WarriorAnimState.RUN] = 0.03;
        this.transDurMap[WarriorAnimState.RUN + '__' + WarriorAnimState.FIGHTING_IDLE] = 0.1;
        this.transDurMap[WarriorAnimState.RUN + '__' + WarriorAnimState.IDLE] = 0.1;
        this.transDurMap[WarriorAnimState.WIN + '__' + WarriorAnimState.IDLE] = 0.5;
        this.transDurMap[WarriorAnimState.LANDING + '__' + WarriorAnimState.FIGHTING_IDLE] = 0;
        this.transDurMap[WarriorAnimState.FALLING + '__' + WarriorAnimState.FIGHTING_IDLE] = 0;

        this.transDurMap[WarriorAnimState.LANDING + '__' + WarriorAnimState.DOWN] = 0;
        this.transDurMap[WarriorAnimState.FALLING + '__' + WarriorAnimState.DOWN] = 0;

        this.transDurMap[WarriorAnimState.JUMP_HIGHT_FORWARD + '__' + WarriorAnimState.LANDING] = 0.15;
        this.transDurMap[WarriorAnimState.ATTACK_MIDDLE_1 + '__' + WarriorAnimState.LANDING] = 0.15;

        this.transDurMap[WarriorAnimState.DOWN + '__' + WarriorAnimState.FIGHTING_IDLE] = 0.1;

        this.transDurMap[WarriorAnimState.JUMP_HIGHT_BACKWARD + '__' + WarriorAnimState.ATTACK_MIDDLE_1] = 0.05;
    }

    protected updateFighting(dt)
    {
        super.updateFighting(dt);
        // must call it after if (!this.activeSkill) this.useSkill(ChickFighter.SKILL_KICK);
        // because the this.activeSkill.update(dt); may set this.activeSkill = null => then this.useSkill(ChickFighter.SKILL_KICK); will be call again
        if (this.activeSkill && !this.activeSkill.isDone) this.activeSkill.update(dt);
    }

    public hurt(damage:number, stunDur = 0.2)
    {
        super.hurt(damage);
        
        if (this.isOnGround)
        {
        }
        else {
            this.setAnimState(WarriorAnimState.FALLING);
        }
        
    }

    protected chooseSkill(dt):boolean
    {
        if (this.activeSkill) return false;

        let enemy = this.enemy;
        let world = this.world;
        let used = false;
        
        let kickProb = 0.05;
        if (enemy.vy > 0 && enemy.y > enemy.baseHeight && enemy.y < enemy.baseHeight*1.4)
        {
            kickProb = 0.2;
        }
        // kick
        if (!used)
        {
            if (world.getRand() < kickProb)
            {
                used = true;
                this.useSkill(ChickFighter.SKILL_KICK);
            }
        }

        // dodge
        if (!used && enemy.vy > 0 && enemy.y > enemy.baseHeight*1.1)
        {
            
            let dodgeSkill:LowDodgeSkill = this.skills[ChickFighter.LOW_DODGE] as any;
            if (this.x < EnvSettings.SCREEN_W*0.2 || this.x > EnvSettings.SCREEN_W*0.8)
            {
                used = true;
                this.useSkill(ChickFighter.LOW_DODGE);
                dodgeSkill.dodgeDis = 500 + this.world.getRand()*200;
            }
            else if (world.getRand() < 0.15)
            {
                used = true;
                dodgeSkill.dodgeDis = 300;
                this.useSkill(ChickFighter.LOW_DODGE);
            }
        }
        
        return used;
    }

    public playAnim(state:number)
    {
        if (!this.animStateMap[state]) return;
        if (!this.anim) return;
        this.mixAnimTime = 0;
        this.curAnimState = state;
        let track = 0;
        var spine:sp.Skeleton = this.anim.getComponent(sp.Skeleton);

        //cc.log(this.name + ' play anim ' + this.animStateMap[state]);
        spine.setAnimation(track, this.animStateMap[state], this.animLoopMap[state]);
        // reset time scale
        spine.timeScale = 1.0;
    }

    public mixAnim(state:number)
    {
        if (!this.animStateMap[state]) return;

        let fromTo = this.curAnimState + '__' + state;
        let transDur = this.transDurMap[fromTo];
        if (transDur == undefined) transDur = 0.05;
        if (this.curAnimState < 0 || transDur == 0)
        {
            this.playAnim(state);
            return;
        }
        
        this.mixAnimTime = transDur;
        var spine:sp.Skeleton = this.anim.getComponent(sp.Skeleton);
        //cc.log('mix anim : ' + this.animStateMap[this.curAnimState] + '___' + this.animStateMap[state] + ' in dur: ' + transDur);
        spine.setMix(this.animStateMap[this.curAnimState], this.animStateMap[state], transDur);
        this.curAnimState = state;
    }

    public update(dt)
    {
        super.update(dt);
        if (this.anim)
        {
            this.anim.scaleY += (this.targetScaleY - this.anim.scaleY)*0.15;
            switch (this.curAnimState)
            {
                case WarriorAnimState.RUN:
                case WarriorAnimState.BACKWARD:
                    var spine:sp.Skeleton = this.anim.getComponent(sp.Skeleton);
                    let timeScale = this.world.baseTimeScale*Math.abs(this.moveVal)/120;
                    if (timeScale < this.world.baseTimeScale) timeScale = this.world.baseTimeScale;
                    spine.timeScale = timeScale;
                    break;
                default:
                    break;
            }
        }
        
        if (this.mixAnimTime > 0)
        {
            this.mixAnimTime -= dt;
            if (this.mixAnimTime <= 0)
            {
                this.playAnim(this.curAnimState);
            }
        }
    }
    
}