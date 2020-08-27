import {World} from "./World";
import { VVec2 } from "./VBaseTransform";
import { KickSkill } from "./BaseSkill";

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

    world:World;

    onLoad () {
        this.world = new World();
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
}
