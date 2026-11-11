import re,math
def tokenize(s):
    for m in re.finditer(r'\(|\)|"(?:[^"\\]|\\.)*"|[^\s()]+',s):
        t=m.group(0)
        yield t
def parse(s):
    st=[[]]
    for t in tokenize(s):
        if t=='(': st.append([])
        elif t==')': x=st.pop(); st[-1].append(x)
        else: st[-1].append(t[1:-1] if t.startswith('"') else t)
    return st[0][0]
def find(n,key): return [c for c in n if isinstance(c,list) and c and c[0]==key]
def one(n,key):
    r=find(n,key); return r[0] if r else None
def xy(n): return float(n[1]),float(n[2])
def arcpts(s,m,e,seg=24):
    (x1,y1),(x2,y2),(x3,y3)=s,m,e
    d=2*(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))
    if abs(d)<1e-12: return [s,e]
    ux=((x1*x1+y1*y1)*(y2-y3)+(x2*x2+y2*y2)*(y3-y1)+(x3*x3+y3*y3)*(y1-y2))/d
    uy=((x1*x1+y1*y1)*(x3-x2)+(x2*x2+y2*y2)*(x1-x3)+(x3*x3+y3*y3)*(x2-x1))/d
    r=math.hypot(x1-ux,y1-uy)
    a1=math.atan2(y1-uy,x1-ux);a2=math.atan2(y2-uy,x2-ux);a3=math.atan2(y3-uy,x3-ux)
    def norm(a): return a%(2*math.pi)
    # direction: ccw if a2 between a1..a3 going ccw
    ccw = norm(a2-a1) < norm(a3-a1)
    span = norm(a3-a1) if ccw else -norm(a1-a3)
    n=max(4,int(abs(span)/(2*math.pi)*seg*2))
    return [(ux+r*math.cos(a1+span*i/n),uy+r*math.sin(a1+span*i/n)) for i in range(n+1)]
def xform(p,at):
    x,y=p;ox,oy,rot=at
    a=-math.radians(rot)  # KiCad: rotation ccw in screen coordinates (y down)
    return (ox+x*math.cos(a)-y*math.sin(a), oy+x*math.sin(a)+y*math.cos(a))
def edges(board):
    segs=[];circles=[]
    def add(node,at=None):
        t=node[0];lay=one(node,'layer')
        if not lay or lay[1]!='Edge.Cuts': return
        T=(lambda p: xform(p,at)) if at else (lambda p:p)
        if t in('gr_line','fp_line'): segs.append([T(xy(one(node,'start'))),T(xy(one(node,'end')))])
        elif t in('gr_arc','fp_arc'): segs.append([T(p) for p in arcpts(xy(one(node,'start')),xy(one(node,'mid')),xy(one(node,'end')))])
        elif t in('gr_rect','fp_rect'):
            (a,b),(c,d)=xy(one(node,'start')),xy(one(node,'end'))
            pts=[(a,b),(c,b),(c,d),(a,d),(a,b)]
            for i in range(4): segs.append([T(pts[i]),T(pts[i+1])])
        elif t in('gr_circle','fp_circle'):
            c=T(xy(one(node,'center')));e=T(xy(one(node,'end')));circles.append((c,math.hypot(e[0]-c[0],e[1]-c[1])))
        elif t in('gr_poly','fp_poly'):
            pts=[T(xy(p)) for p in one(node,'pts') if p[0]=='xy'];pts.append(pts[0])
            for i in range(len(pts)-1): segs.append([pts[i],pts[i+1]])
    for n in board:
        if isinstance(n,list) and n and n[0].startswith('gr_'): add(n)
        if isinstance(n,list) and n and n[0]=='footprint':
            a=one(n,'at');at=(float(a[1]),float(a[2]),float(a[3]) if len(a)>3 and a[3]!='unlocked' else 0.0)
            for c in n:
                if isinstance(c,list) and c and c[0].startswith('fp_'): add(c,at)
    # chain
    loops=[];tol=0.02
    segs=[s for s in segs if len(s)>=2]
    while segs:
        cur=segs.pop(0)
        changed=True
        while changed:
            changed=False
            for i,s in enumerate(segs):
                if math.dist(cur[-1],s[0])<tol: cur+=s[1:];segs.pop(i);changed=True;break
                if math.dist(cur[-1],s[-1])<tol: cur+=s[::-1][1:];segs.pop(i);changed=True;break
            if math.dist(cur[0],cur[-1])<tol and len(cur)>3: break
        loops.append(cur)
    for c,r in circles:
        loops.append([(c[0]+r*math.cos(2*math.pi*i/48),c[1]+r*math.sin(2*math.pi*i/48)) for i in range(49)])
    return loops
def area(l): return 0.5*sum(l[i][0]*l[i+1][1]-l[i+1][0]*l[i][1] for i in range(len(l)-1))
def footprints(board):
    out=[]
    for n in find(board,'footprint'):
        a=one(n,'at');at=(float(a[1]),float(a[2]),float(a[3]) if len(a)>3 and a[3]!='unlocked' else 0.0)
        lay=one(n,'layer')[1]
        ref=None
        for p in find(n,'property'):
            if p[1]=='Reference': ref=p[2]
        if ref is None:
            for t in find(n,'fp_text'):
                if t[1]=='reference': ref=t[2]
        val=None
        for p in find(n,'property'):
            if p[1]=='Value': val=p[2]
        cy=[]
        for c in n:
            if isinstance(c,list) and c and c[0] in('fp_line','fp_rect','fp_poly','fp_circle','fp_arc'):
                l=one(c,'layer')
                if l and l[1].endswith('CrtYd'):
                    for k in('start','end','mid','center'):
                        q=one(c,k)
                        if q: cy.append(xform(xy(q),at))
                    pts=one(c,'pts')
                    if pts: cy+= [xform(xy(p),at) for p in pts if p[0]=='xy']
        holes=[]
        for p in find(n,'pad'):
            if p[2]=='np_thru_hole' or (p[2]=='thru_hole' and 'Mounting' in (one(n,'descr') or ['',''])[1]):
                d=one(p,'drill')
                if d and len(d)>1:
                    try: dia=float(d[1])
                    except: continue
                    if dia>=1.0: holes.append((xform(xy(one(p,'at')),at),dia))
        out.append(dict(ref=ref,val=val,at=at,layer=lay,crtyd=cy,holes=holes,lib=n[1]))
    return out
def thickness(board):
    g=one(board,'general'); t=one(g,'thickness') if g else None
    return float(t[1]) if t else 1.6
