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
var VBaseNode_1 = require("./VBaseNode");
var VBaseTransform_1 = require("./VBaseTransform");
var BaseSkill = /** @class */ (function (_super) {
    __extends(BaseSkill, _super);
    function BaseSkill() {
        var _this = _super.call(this) || this;
        _this.damage = 10;
        _this.hitProb = 1.0;
        _this.prepareDur = 0;
        _this.reset();
        return _this;
    }
    BaseSkill.prototype.reset = function () {
        this.reserveTime = 0;
        this.isDone = true;
        this.active = false;
        this.prepareTime = 0;
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
    BaseSkill.prototype.done = function (stunDur) {
        if (stunDur === void 0) { stunDur = 0.; }
        if (this.isDone)
            return;
        //cc.log('done ' + this.owner.name);
        this.owner.onSkillDone();
        // make sure owner back to stune state
        this.owner.setStunFor(stunDur);
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
        var owner = this.owner;
        var dis = Math.abs(this.owner.x - this.owner.enemy.x);
        this.skillVx = dis * (1.2 + this.owner.world.getRand() * 0.6);
        this.skillVy = 500 + this.owner.world.getRand() * 300;
        owner.vx = owner.dir * this.skillVx;
        owner.vy = this.skillVy;
        this.lastIsOnGround = true;
        // play anim sequence ---
        // current -> crouch -> jumpHighBackWard -> attackMiddle1 -> jumpHighForward -> landing -> crouch
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
    KickSkill.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (!this.active)
            return;
        if (this.prepareTime < this.prepareDur) {
            this.prepareTime += dt;
            return;
        }
        var owner = this.owner;
        var enemy = this.owner.enemy;
        // check for skill exercution -------
        if (this.skillVy > 0 && this.owner.vy > 0 && this.owner.vy < this.skillVy * 0.9) {
            // check kick hit ---
            var p = owner.toGlobal(this.hitPos);
            var v = new VBaseTransform_1.VVec2(p.x - enemy.x, p.y - enemy.y);
            var dis = Math.sqrt(v.x * v.x + v.y * v.y);
            if (dis < enemy.hitRadius) {
                //cc.log('kick skill exercuted ---'  + this.owner.name);
                enemy.vy -= 30;
                // wait for landing
                enemy.hurt(this.damage, 1.0);
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
    };
    LowDodgeSkill.prototype.setOwner = function (owner) {
        _super.prototype.setOwner.call(this, owner);
    };
    LowDodgeSkill.prototype.done = function () {
        _super.prototype.done.call(this);
        cc.log('LowDodgeSkill done');
    };
    LowDodgeSkill.prototype.start = function () {
        _super.prototype.start.call(this);
        this.startX = this.owner.x;
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
        if (this.prepareTime < this.prepareDur) {
            this.prepareTime += dt;
            return;
        }
        this.owner.x += this.owner.dir * this.owner.moveSpeed * dt;
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
        