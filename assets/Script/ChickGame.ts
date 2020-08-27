import World from "./World";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChickGame extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Node)
    chick1: cc.Node = null;

    @property(cc.Node)
    chick2: cc.Node = null;

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

    update (dt) {
        this.world.update(dt);
        this.chick1.x = this.world.war1.x;
        this.chick1.y = this.world.war1.y;
        this.chick1.scaleX = this.world.war1.dir;

        this.chick2.x = this.world.war2.x;
        this.chick2.y = this.world.war2.y;
        this.chick2.scaleX = this.world.war2.dir;
    }
}
