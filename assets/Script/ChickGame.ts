import {World} from "./World";
import { VVec2 } from "./VBaseTransform";
import { KickSkill } from "./BaseSkill";
import { BaseWarrior } from "./BaseWarrior";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChickGame extends cc.Component {
    @property(cc.Node)
    chick1: cc.Node = null;

    @property(cc.Node)
    chick2: cc.Node = null;

    @property(cc.Node)
    hit1: cc.Node = null;

    @property(cc.Node)
    hit2: cc.Node = null;

    @property(cc.ProgressBar)
    hpBar1: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    hpBar2: cc.ProgressBar = null;

    @property(cc.Node)
    anim1: cc.Node = null;

    @property(cc.Node)
    anim2: cc.Node = null;

    world:World;

    onLoad () {
        this.world = new World();

        // register ui hdl
        this.world.updateUIHpHdl = this.updateUIHpHdl.bind(this);
        this.world.chick1.setAnim(this.anim1);
        this.world.chick2.setAnim(this.anim2);
        this.world.reset();
    }

    start () {

    }

    onStartFighting()
    {
        this.world.reset();
        this.world.startFighting();
    }

    update(dt) 
    {
        this.world.update(dt);
        let wc1 = this.world.chick1;
        let wc2 = this.world.chick2;
        let c1 = this.chick1;
        let c2 = this.chick2;
        c1.x = wc1.x;
        c1.y = wc1.y;
        c1.scaleX = wc1.scaleX;

        c2.x = wc2.x;
        c2.y = wc2.y;
        c2.scaleX = wc2.scaleX;

        let p1 = wc1.toGlobal((wc1.skills[0] as KickSkill).hitPos);
        let p2 = wc2.toGlobal((wc2.skills[0] as KickSkill).hitPos);

        this.hit1.x = p1.x;
        this.hit1.y = p1.y;

        this.hit2.x = p2.x;
        this.hit2.y = p2.y;
    }

    public updateUIHpHdl(chick:BaseWarrior)
    {
        let hpBar:cc.ProgressBar = chick == this.world.chick1?this.hpBar1:this.hpBar2;

        hpBar.progress = chick.getHp()/chick.totalHp;
    }
}
