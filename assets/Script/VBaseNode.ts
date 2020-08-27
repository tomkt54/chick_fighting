import { VBaseTransform, VVec2, Mat3 } from "./VBaseTransform";

export default class VBaseNode extends VBaseTransform
{
    children:Array<VBaseNode>;
    parent:VBaseNode;
    constructor()
    {
        super();
        this.parent = null;
        this.children = [];
    }

    public update(dt:number)
    {
        for (let i = 0; i < this.children.length; i++)
        {
            this.children[i].update(dt);
        }
    }

    public getChildren():Array<VBaseNode>
    {
        return this.children;
    }

    public getParent():VBaseNode
    {
        return this.parent;
    }

    public setParent(p:VBaseNode)
    {
        if (this.parent) this.parent.removeChild(this); 
        this.parent = p;
    }

    public addChild(child:VBaseNode)
    {
        child.setParent(this);
        this.children.push(child);
    }

    public removeChild(child:VBaseNode)
    {
        for ( var i = 0; i < this.children.length; i++ )
		{
			if (this.children[i] === child)
			{
				this.children.splice(i, 1);
				break;
			}
        }
        
        child.setParent(null);
    }

    public toGlobal(p:VVec2)
    {
        let t = this.getTransform();
        let par = this.parent;
        while (par)
        {
            t = Mat3.multiply(par.getTransform(), t);
            par = par.parent;
        }
        return this.applyTransform(t, p);
    }

    public toLocal(p:VVec2)
    {
        let t = this.getTransform();
        let par = this.parent;
        while (par)
        {
            t = Mat3.multiply(par.getTransform(), t);
            par = par.parent;
        } 

        t = Mat3.getInvert(t);
        return this.applyTransform(t, p);
    }

}
