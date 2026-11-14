import json,struct,numpy as np,sys
CT={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def load(path):
    b=open(path,'rb').read();assert b[:4]==b'glTF'
    off=12;js=None;bin_=None
    while off<len(b):
        ln,ty=struct.unpack('<II',b[off:off+8]);d=b[off+8:off+8+ln]
        if ty==0x4E4F534A: js=json.loads(d)
        else: bin_=d
        off+=8+ln
    return js,bin_
def acc(js,bin_,i):
    a=js['accessors'][i];bv=js['bufferViews'][a['bufferView']];n=NC[a['type']];dt=CT[a['componentType']]
    o=bv.get('byteOffset',0)+a.get('byteOffset',0);st=bv.get('byteStride',0);cnt=a['count']
    isz=np.dtype(dt).itemsize*n
    if st and st!=isz:
        arr=np.frombuffer(bin_,dtype=np.uint8,count=st*cnt,offset=o).reshape(cnt,st)[:,:isz].copy().view(dt).reshape(cnt,n)
    else: arr=np.frombuffer(bin_,dtype=dt,count=cnt*n,offset=o).reshape(cnt,n)
    return arr
def mat(node):
    if 'matrix' in node: return np.array(node['matrix']).reshape(4,4).T
    M=np.eye(4)
    t=node.get('translation',[0,0,0]);r=node.get('rotation',[0,0,0,1]);s=node.get('scale',[1,1,1])
    x,y,z,w=r
    R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M[:3,:3]=R*np.array(s);M[:3,3]=t;return M
def walk(js,bin_):
    """yield (path names, world matrix, positions world, indices, material idx) per primitive"""
    out=[]
    def rec(ni,P,names):
        n=js['nodes'][ni];M=P@mat(n);nm=names+[n.get('name','')]
        if 'mesh' in n:
            for pr in js['meshes'][n['mesh']]['primitives']:
                p=acc(js,bin_,pr['attributes']['POSITION']).astype(float)
                pw=(M[:3,:3]@p.T).T+M[:3,3]
                idx=acc(js,bin_,pr['indices']).ravel() if 'indices' in pr else np.arange(len(p))
                out.append((nm,pw,idx,pr.get('material',-1)))
        for c in n.get('children',[]): rec(c,M,nm)
    for r in js['scenes'][js.get('scene',0)]['nodes']: rec(r,np.eye(4),[])
    return out
