export class VVec2
{
    public x:number;
    public y:number;
    constructor(x:number = 0, y: number = 0)
    {
        this.x = x;
        this.y = y;
    }

    public rotate(ang:number):VVec2
    {
        let v = new VVec2();
        v.x = Math.cos(ang)*this.x - Math.sin(ang)*this.y;
        v.y = Math.sin(ang)*this.x + Math.cos(ang)*this.y;
        return v;
    }

    public normalize()
    {
        let m = Math.sqrt(this.x*this.x + this.y*this.y);
        if (m == 1) return;
        this.x /= m;
        this.y /= m;
    }

    public scale(s)
    {
        this.x *= s;
        this.y *= s;
    }

    public getNorm()
    {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    public getAng(v:VVec2)
    {
        let ang = Math.acos((this.x*v.x + this.y*v.y)/(Math.sqrt(this.x*this.x + this.y*this.y)*Math.sqrt(v.x*v.x + v.y*v.y)));
        // tinh chat tich co huong --
        let vy = this.y*v.x - this.x*v.y;
        //sys.trace('vy === ' + vy);
        //if (vy < 0) ang = -ang;
        // ---
        return ang;
    }

    public getAng2(v:VVec2)
    {
        let ang = Math.acos((this.x*v.x + this.y*v.y)/(Math.sqrt(this.x*this.x + this.y*this.y)*Math.sqrt(v.x*v.x + v.y*v.y)));
        // tinh chat tich co huong --
        let vy = this.y*v.x - this.x*v.y;
        //sys.trace('vy === ' + vy);
        if (vy < 0) ang = -ang;
        // ---
        return ang;
    }
}

export class VVec3
{
    public x:number;
    public y:number;
    public z:number;
    constructor(x=0, y=0, z=0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public getModule()
    {
        return Math.abs(this.x*this.x + this.y*this.y + this.z*this.z);
    }
}

export class Mat3
{
    constructor()
    {
    }

    public static multiply(a:Array<number>, b:Array<number>)
    {
        let out = [];
        let a00 = a[0],
            a01 = a[1],
            a02 = a[2];
        let a10 = a[3],
            a11 = a[4],
            a12 = a[5];
        let a20 = a[6],
            a21 = a[7],
            a22 = a[8];
        let b00 = b[0],
            b01 = b[1],
            b02 = b[2];
        let b10 = b[3],
            b11 = b[4],
            b12 = b[5];
        let b20 = b[6],
            b21 = b[7],
            b22 = b[8];
        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;
        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;
        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
    
    public static getInvert(a:Array<number>) 
    {
        let out = [];
        let a00 = a[0],
            a01 = a[1],
            a02 = a[2];
        let a10 = a[3],
            a11 = a[4],
            a12 = a[5];
        let a20 = a[6],
            a21 = a[7],
            a22 = a[8];
        let b01 = a22 * a11 - a12 * a21;
        let b11 = -a22 * a10 + a12 * a20;
        let b21 = a21 * a10 - a11 * a20;
        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = b01 * det;
        out[1] = (-a22 * a01 + a02 * a21) * det;
        out[2] = (a12 * a01 - a02 * a11) * det;
        out[3] = b11 * det;
        out[4] = (a22 * a00 - a02 * a20) * det;
        out[5] = (-a12 * a00 + a02 * a10) * det;
        out[6] = b21 * det;
        out[7] = (-a21 * a00 + a01 * a20) * det;
        out[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    }
}

export class VBaseTransform
{
    public scaleX:number; // a
    public skewY:number; // b
    public skewX:number; // c
    public scaleY:number; // d
    public x:number;
    public y:number;

    public rot:number; // in dradient
    /*
    a c tx
    b d ty
    0 0 1
    */

    constructor()
    {
        this.scaleX = 1;
        this.scaleY = 1;
        this.skewY = 0;
        this.skewX = 0;
        this.x = 0;
        this.y = 0;
        this.rot = 0;
    }

    public getTransform()
    {
        let m = [this.scaleX, this.skewX, this.x, this.skewY, this.scaleY, this.y, 0, 0, 1];
        let rm = [Math.cos(this.rot), -Math.sin(this.rot), 0, Math.sin(this.rot), Math.cos(this.rot), 0, 0, 0, 1];
        let mm = Mat3.multiply(m, rm);
        return mm;
    }

    public applyTransform(t:Array<number>, p:VVec2)
    {
        return new VVec2(t[0]*p.x + t[1]*p.y + t[2], t[3]*p.x + t[4]*p.y + t[5]);
    }
}