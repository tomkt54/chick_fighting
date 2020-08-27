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
var BaseSkill = /** @class */ (function (_super) {
    __extends(BaseSkill, _super);
    function BaseSkill() {
        var _this = _super.call(this) || this;
        _this.damage = 10;
        _this.hitProb = 1.0;
        return _this;
    }
    BaseSkill.prototype.start = function () {
        this.active = true;
    };
    BaseSkill.prototype.stop = function () {
        this.active = false;
    };
    BaseSkill.prototype.update = function (dt) {
    };
    return BaseSkill;
}(VBaseNode_1.default));
exports.BaseSkill = BaseSkill;
var KickSkill = /** @class */ (function (_super) {
    __extends(KickSkill, _super);
    function KickSkill() {
        return _super.call(this) || this;
    }
    KickSkill.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
    };
    return KickSkill;
}(BaseSkill));
exports.KickSkill = KickSkill;

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
        