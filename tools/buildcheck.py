# v0.18.5 cleanup step 2: build guards for the one-scope concatenated build (run by v3build.py; `python3 tools/buildcheck.py` alone also works).
# The game is 200 modules joined into one strict-mode IIFE, so a mistake in one file breaks the page silently or at load. These are the
# traps that have bitten every pass, checked before the page is written:
#   E1 a module in MODS that is not in v3/            E2 a v3/*.js that is in no list (a module written but never built: v0.16.4)
#   E3 a top-level const reassigned later (`{const f0=fn;fn=function...}` on a const, `NAME=...` at line start): TypeError at load
#   E4 a top-level name declared twice (const/let/class twice is a SyntaxError; two function declarations: the later wins silently)
#   W1 a `//` comment with code after it on the same line (the comment swallows the code: `const HB10={on:0}` in 0.16.x)
#   W2 node --check on the joined script when node is installed (a swallowed brace, a stray character)
# Errors stop the build (exit 1); warnings print. Baselines for things that are accepted on purpose are in ALLOW below.
import os,re,sys,subprocess,shutil
d=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V3=os.path.join(d,'v3')
# files in v3/ that are not game modules (served, built in by shell.html, or the service worker)
ALLOW_UNLISTED={'appver.js','liveboot.js','sw.js'}
# function declarations that are redefined on purpose (a later module replaces the whole body): add a name here only with the reason in the module
ALLOW_DUP_FUNC=set()
def run(MODS,quiet=False):
    errs=[];warns=[]
    have=set(f for f in os.listdir(V3) if f.endswith('.js'))
    for m in MODS:
        if m not in have:errs.append('E1 MODS names %s, which is not in v3/'%m)
    for f in sorted(have-set(MODS)-ALLOW_UNLISTED):
        errs.append('E2 v3/%s is in no build list (add it to MODS in v3build.py, or to ALLOW_UNLISTED in tools/buildcheck.py)'%f)
    src={m:open(os.path.join(V3,m),encoding='utf-8').read() for m in MODS if m in have}
    # Tokenise each module just enough to know the brace depth: strings, template literals (with ${} nesting), comments and regex
    # literals are skipped, so a declaration counts as top level only at depth 0 of the module itself.
    def top_level(s):
        """yields (kind,name,line) for const/let/var/function/class declarations at depth 0, and (None,name,line) for `name=` at depth 0"""
        i=0;n=len(s);depth=0;line=1;out=[];prev='';tstack=[]
        word=re.compile(r'[A-Za-z_$][\w$]*')
        def skip_str(q,i):
            i+=1
            while i<n and s[i]!=q:
                if s[i]=='\\':i+=1
                i+=1
            return i+1
        while i<n:
            c=s[i]
            if c=='\n':line+=1;i+=1;continue
            if c in ' \t\r':i+=1;continue
            if s.startswith('//',i):
                j=s.find('\n',i);i=n if j<0 else j;continue
            if s.startswith('/*',i):
                j=s.find('*/',i+2);seg=s[i:(n if j<0 else j+2)];line+=seg.count('\n');i=n if j<0 else j+2;continue
            if c in '\'"':
                j=skip_str(c,i);line+=s[i:j].count('\n');i=j;prev='str';continue
            if c=='`':
                # template: scan to the closing backtick, descending into ${ } by pushing the depth
                i+=1
                while i<n and s[i]!='`':
                    if s[i]=='\\':i+=2;continue
                    if s[i]=='\n':line+=1
                    if s.startswith('${',i):
                        tstack.append(depth);depth+=1;i+=2
                        # scan the expression until the matching close brace
                        while i<n and depth>tstack[-1]:
                            ch=s[i]
                            if ch=='\n':line+=1;i+=1;continue
                            if ch in '\'"':i=skip_str(ch,i);continue
                            if ch=='`':
                                # nested template: recurse cheaply by skipping to its end (no ${} handling inside)
                                k=i+1
                                while k<n and s[k]!='`':
                                    if s[k]=='\\':k+=1
                                    k+=1
                                i=k+1;continue
                            if ch=='{':depth+=1
                            elif ch=='}':depth-=1
                            i+=1
                        tstack.pop();continue
                    i+=1
                i+=1;prev='str';continue
            if c=='/' and (prev=='' or prev in '(,=:[!&|?{};+-*%<>~^' ):
                # regex literal
                j=i+1;cls=False
                while j<n:
                    ch=s[j]
                    if ch=='\\':j+=2;continue
                    if ch=='[':cls=True
                    elif ch==']':cls=False
                    elif ch=='/' and not cls:break
                    elif ch=='\n':break
                    j+=1
                j+=1
                while j<n and s[j] in 'gimsuyd':j+=1
                i=j;prev='re';continue
            if c=='{':depth+=1;i+=1;prev='{';continue
            if c=='}':depth-=1;i+=1;prev='}';continue
            if c in '()[]':depth+= 1 if c in '([' else -1;i+=1;prev=c;continue
            m=word.match(s,i)
            if m:
                w=m.group(0)
                if depth==0 and w in('const','let','var','function','class','async'):
                    j=m.end()
                    if w=='async':
                        mm=re.match(r'\s*function\s*\*?\s*([A-Za-z_$][\w$]*)',s[j:])
                        if mm:out.append(('function',mm.group(1),line));i=j+mm.end();prev='w';continue
                    elif w in('function','class'):
                        mm=re.match(r'\s*\*?\s*([A-Za-z_$][\w$]*)',s[j:])
                        if mm:out.append((w,mm.group(1),line))
                    else:
                        # const a=..., b=...;  take each name at the declaration's own depth
                        k=j;dd=0;expect=True
                        while k<n:
                            ch=s[k]
                            if ch in '\'"':k=skip_str(ch,k);continue
                            if ch=='`':
                                k+=1
                                while k<n and s[k]!='`':
                                    if s[k]=='\\':k+=1
                                    k+=1
                                k+=1;continue
                            if ch in '([{':dd+=1
                            elif ch in ')]}':
                                if dd==0:break
                                dd-=1
                            elif ch==';' and dd==0:break
                            elif ch=='\n' and dd==0 and not expect:
                                # a newline ends the declaration unless we are waiting for a name
                                nxt=s[k:k+40].lstrip()
                                if not nxt.startswith(','):break
                            elif ch==',' and dd==0:expect=True
                            elif expect and dd==0:
                                mm=word.match(s,k)
                                if mm:out.append((w,mm.group(0),line));k=mm.end();expect=False;continue
                            k+=1
                elif depth==0 and prev in('','{','}',';','\n') or (depth==0 and prev=='}'):
                    # a bare `name=` at depth 0 (not ==, not =>)
                    j=m.end();t=s[j:j+2]
                    if t.startswith('=') and not t.startswith('==') and not t.startswith('=>'):out.append((None,w,line))
                i=m.end();prev=w if w in('return','typeof','case','in','of','new','delete','void','throw') else 'w';
                if prev!='w':prev=''
                continue
            prev=c;i+=1
        return out
    decl={} # name -> [(kind,module,line)]
    assigns=[] # (module,name,line) for `name=` at depth 0
    tl={}
    for m in MODS:
        if m not in src:continue
        tl[m]=top_level(src[m])
        for kind,name,line in tl[m]:
            if kind:decl.setdefault(name,[]).append((kind,m,line))
            else:assigns.append((m,name,line))
    for n,ks in decl.items():
        if len(ks)>1:
            kinds=set(k for k,_,_ in ks)
            where=', '.join('%s:%d (%s)'%(mm,ln,k) for k,mm,ln in ks)
            if kinds-{'function'}:errs.append('E4 %s is declared at top level more than once: %s'%(n,where))
            elif n not in ALLOW_DUP_FUNC:warns.append('W4 function %s is declared twice (the later wins silently): %s'%(n,where))
    consts=set(n for n,ks in decl.items() if any(k=='const' for k,_,_ in ks))
    for m,name,line in assigns:
        if name in consts:errs.append('E3 %s:%d reassigns %s, which is a top-level const (declared in %s)'%(m,line,name,decl[name][0][1]))
    # the wrap idiom `{const f0=fn;fn=function` sits at depth 1 (inside its block), so scan it textually
    wrap=re.compile(r'\{\s*const\s+\w+\s*=\s*([A-Za-z_$][\w$]*)\s*;\s*\1\s*=')
    for m in MODS:
        if m not in src:continue
        for w in wrap.finditer(src[m]):
            if w.group(1) in consts:errs.append('E3 %s wraps and reassigns %s, which is a top-level const (declared in %s)'%(m,w.group(1),decl[w.group(1)][0][1]))
    # W1: `//` followed by code-like text on the same line. Only looks at `//` outside quotes and not part of a URL.
    for m in MODS:
        if m not in src:continue
        for i,l in enumerate(src[m].split('\n'),1):
            if '//' not in l or l.lstrip().startswith('//'):continue
            q=re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`|/(?:\\.|[^/\\\n])+/[gimsuy]*",'""',l)
            k=q.find('//')
            if k<0 or q[k-1:k]==':':continue
            tail=q[k+2:]
            if re.search(r';\s*(const|let|var|function|HOOK\.|if\(|try\{|\w+\s*=\s*function)',tail):
                warns.append('W1 %s:%d a // comment has code after it on the same line (use /* */): %s'%(m,i,l.strip()[:90]))
    # W2: syntax check of the joined script
    node=shutil.which('node')
    if node:
        js=';\n'.join(src[m] for m in MODS if m in src)
        tmp=os.path.join(d,'out','_check.js');os.makedirs(os.path.join(d,'out'),exist_ok=True)
        open(tmp,'w',encoding='utf-8').write('(function(){"use strict";\n'+js+'\n})();')
        p=subprocess.run([node,'--check',tmp],capture_output=True,text=True)
        if p.returncode:errs.append('W2 node --check failed on the joined script:\n'+(p.stderr or p.stdout).strip()[:1500])
        try:os.remove(tmp)
        except OSError:pass
    else:warns.append('W2 node not installed here, syntax check skipped')
    for w in warns:print('buildcheck:',w)
    for e in errs:print('buildcheck:',e)
    if not quiet and not errs:print('buildcheck: ok (%d modules, %d top-level names%s)'%(len(MODS),len(decl),'' if node else ', no node'))
    return not errs
if __name__=='__main__':
    sys.path.insert(0,d)
    g={};exec(re.search(r'^MODS=.*$',open(os.path.join(d,'v3build.py')).read(),re.M).group(0),g)
    sys.exit(0 if run(g['MODS']) else 1)
