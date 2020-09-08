(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/BaseSkill.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'fe322SHMHRP27PUq6zZqsOE', 'BaseSkill', __filename);
// Script/BaseSkill.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseWarrior_1 = require("./BaseWarrior");
var VBaseNode_1 = require("./VBaseNode");
var VBaseTransform_1 = require("./VBaseTransform");
var BaseSkill = /** @class */ (function (_super) {
    __extends(BaseSkill, _super);
    function BaseSkill() {
        var _this = _super.call(this) || this;
        _this.damage = 10;
        _this.hitProb = 1.0;
        _this.prepareDur = 0;
        _this.doneStunDur = 0;
        _this.reset();
        return _this;
    }
    BaseSkill.prototype.reset = function () {
        this.reserveTime = 0;
        this.isDone = true;
        this.active = false;
        this.prepareTime = this.prepareDur;
    };
    BaseSkill.prototype.setOwner = function (owner) {
        this.owner = owner;
        this.reset();
    };
    BaseSkill.prototype.start = function () {
        this.reset();
        this.isDone = false;
        this.active = true;
    };
    BaseSkill.prototype.done = function () {
        if (this.isDone)
            return;
        //cc.log('done ' + this.owner.name);
        this.owner.onSkillDone();
        // make sure owner back to stune state
        this.owner.setStunFor(this.doneStunDur);
        this.owner.reserveTime = this.reserveTime;
        this.isDone = true;
    };
    BaseSkill.prototype.checkSkillDone = function () {
        return false;
    };
    BaseSkill.prototype.update = function (dt) {
        // incase the skill not yet exercuted, how it will be done? --
        if (this.checkSkillDone())
            this.done();
        // -----------------------------------------
    };
    BaseSkill.prototype.deactive = function () {
        this.active = false;
    };
    return BaseSkill;
}(VBaseNode_1.VBaseNode));
exports.BaseSkill = BaseSkill;
var KickSkill = /** @class */ (function (_super) {
    __extends(KickSkill, _super);
    function KickSkill() {
        var _this = _super.call(this) || this;
        _this.hitPos = new VBaseTransform_1.VVec2();
        _this.lastIsOnGround = true;
        _this.damage = 25;
        _this.doneStunDur = 0.1;
        _this.alwaysAttack = false;
        return _this;
    }
    KickSkill.prototype.setOwner = function (owner) {
        _super.prototype.setOwner.call(this, owner);
        this.hitPos.x = owner.hitRadius * 1.6;
        this.hitPos.y = -owner.hitRadius * 0.2;
    };
    KickSkill.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.lastIsOnGround = true;
        this.prepareDur = 0.1;
        this.reserveTime = 0.1; //s
    };
    KickSkill.prototype.start = function () {
        _super.prototype.start.call(this);
        this.alwaysAttack = this.owner.world.getRand() < 0.3;
        var owner = this.owner;
        var dis = Math.abs(this.owner.x - this.owner.enemy.x);
        this.skillVx = dis * (1.2 + this.owner.world.getRand() * 0.8);
        this.skillVy = 840 + this.owner.world.getRand() * 300;
        owner.vx = owner.dir * this.skillVx;
        owner.vy = this.skillVy;
        this.lastIsOnGround = true;
        // play anim sequence ---
        // current -> crouch -> jumpHighBackWard -> attackMiddle1 -> jumpHighForward -> landing -> crouch
    };
    KickSkill.prototype.done = function () {
        _super.prototype.done.call(this);
        cc.log('kick done.');
    };
    KickSkill.prototype.calLandingDur = function () {
        return 1.0;
    };
    KickSkill.prototype.checkSkillDone = function () {
        if (!this.lastIsOnGround && this.owner.getIsOnGround()) {
            //cc.log('kick skill end ' + this.owner.name);
            return true;
        }
        this.lastIsOnGround = this.owner.getIsOnGround();
        return false;
    };
    KickSkill.prototype.checkWillAttack = function () {
        if (this.alwaysAttack)
            return true;
        var dis = Math.abs(this.owner.y - this.owner.enemy.y);
        if (!this.owner.enemy.isOnGround) {
            return true;
        }
        return false;
    };
    KickSkill.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (this.owner.vy < 0) {
            if (Math.abs(this.owner.vy) > this.skillVy * 0.1) {
                this.owner.setAnimState(BaseWarrior_1.WarriorAnimState.LANDING);
            }
        }
        if (this.prepareTime > 0) {
            this.prepareTime -= dt;
            if (this.prepareTime <= 0) {
                this.owner.setAnimState(BaseWarrior_1.WarriorAnimState.JUMP_HIGHT_BACKWARD);
            }
            return;
        }
        // update jump kick anim ---
        if (this.owner.vy > 0) {
            if (this.owner.vy < this.skillVy * 0.1) {
                this.owner.setAnimState(BaseWarrior_1.WarriorAnimState.JUMP_HIGHT_FORWARD);
            }
            else if (this.active && this.owner.vy < this.skillVy * 0.95) {
                if (this.checkWillAttack()) {
                    this.owner.setAnimState(BaseWarrior_1.WarriorAnimState.ATTACK_MIDDLE_1);
                }
            }
        }
        if (!this.active)
            return;
        // ------------------------
        var owner = this.owner;
        var enemy = this.owner.enemy;
        // check for skill exercution -------
        if (this.checkWillAttack() && this.owner.vy > 0 && this.owner.vy < this.skillVy * 0.9) {
            // check kick hit ---
            var p = owner.toGlobal(this.hitPos);
            var v = new VBaseTransform_1.VVec2(p.x - enemy.x, p.y - enemy.y);
            var dis = Math.sqrt(v.x * v.x + v.y * v.y);
            if (dis < enemy.hitRadius) {
                //cc.log('kick skill exercuted ---'  + this.owner.name);
                enemy.vy -= 20 + this.owner.world.getRand() * 10;
                // wait for landing
                var critical = this.owner.world.getRand() * this.damage * 0.3;
                enemy.hurt(this.damage + critical, 1.0);
                this.deactive();
                return;
            }
        }
        // ---------------------
    };
    return KickSkill;
}(BaseSkill));
exports.KickSkill = KickSkill;
var LowDodgeSkill = /** @class */ (function (_super) {
    __extends(LowDodgeSkill, _super);
    function LowDodgeSkill() {
        return _super.call(this) || this;
    }
    LowDodgeSkill.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.startX = 0;
        this.dodgeDis = 200;
        this.prepareDur = 0.1;
        this.moveVal = 0;
    };
    LowDodgeSkill.prototype.setOwner = function (owner) {
        _super.prototype.setOwner.call(this, owner);
    };
    LowDodgeSkill.prototype.done = function () {
        //cc.log('LowDodgeSkill done -----------');
        _super.prototype.done.call(this);
        this.owner.setAnimState(BaseWarrior_1.WarriorAnimState.FIGHTING_IDLE);
        // for scale down moving speed
        this.owner.moveVal = this.moveVal;
        this.owner.targetScaleY = this.owner.defaultScaleY;
    };
    LowDodgeSkill.prototype.start = function () {
        //cc.log('LowDodgeSkill start -----------------------------');
        _super.prototype.start.call(this);
        this.startX = this.owner.x;
        this.prepareDur = this.owner.world.getRand() * 0.2;
        this.owner.targetScaleY = this.owner.defaultScaleY * 0.8;
    };
    LowDodgeSkill.prototype.checkSkillDone = function () {
        if (Math.abs(this.owner.x - this.startX) > this.dodgeDis) {
            return true;
        }
        return false;
    };
    LowDodgeSkill.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (!this.active)
            return;
        if (this.prepareTime > 0) {
            this.prepareTime -= dt;
            if (this.prepareTime <= 0)
                this.owner.setAnimState(BaseWarrior_1.WarriorAnimState.RUN);
            return;
        }
        var val = Math.abs(this.moveVal);
        val += this.owner.moveSpeed * 0.05;
        if (val > this.owner.moveSpeed)
            val = this.owner.moveSpeed;
        this.moveVal = this.owner.dir * val; // front
        this.owner.x += this.moveVal * dt * 1.5;
        // for spine timescale update on owner ---
        this.owner.moveVal = this.moveVal;
        // ------------
    };
    return LowDodgeSkill;
}(BaseSkill));
exports.LowDodgeSkill = LowDodgeSkill;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=BaseSkill.js.map
        