import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda n:open(os.path.join(d,'v3',n)).read()
import hashlib,json,re
MODS=['config.js','hooks.js','fbconfig.js','appver.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','realmdata.js','art.js','art2.js','art3.js','sprhd.js','engine.js','engine2.js','worldgen.js','world4.js','worldgfx.js','worldgfx2.js','worldrt.js','bosstheme.js','bg.js','battle.js','audio.js','audio2.js','musicdata.js','ui.js','ui2.js','natures.js','feedback.js','account.js','legends.js','progression.js','tavern2.js','travel.js','insight.js','battlefx.js','nav.js','temper.js','journey.js','metastats.js','stuck.js','polish.js','towngfx.js','equip.js','equip2.js','party2.js','gearmig.js','town2.js','offline.js','describe.js','world3.js','chance.js','ceword.js','factions.js','mimic.js','mapheal.js','ailments.js','stsym.js','echocore.js','echo2.js','sanctum.js','comp2.js','comp.js','monsters2.js','archetype.js','fx2.js','learn.js','prog2.js','map.js','anim.js','battleui.js','autoset.js','shopfx.js','daylight.js','starter.js','tiers.js','sigskills.js','roles.js','atk6.js','natures6.js','npc2.js','realms.js','roam.js','sites.js','rivals.js','sprites.js','capes.js','saves.js','cloud.js','update.js','allq.js','economy.js','p3shop.js','music2.js','sfx2.js','ambience.js','p4xp.js','p4party.js','p5settings.js','keymap.js','deskscale.js','p5trans.js','p45hook.js','results.js','p2world.js','gfx6.js','gfx6world.js','gfx6battle.js','hdstage.js','hdspell.js','menus3.js','party3.js','v063prog.js','twists.js','icons.js','icons2.js','worldfx.js','battle3.js','battle5.js','battle4.js','chain5.js','remember.js','pacing.js','comp3.js','onboard.js','goals.js','recruit3.js','bigmap.js','guild7.js','summon8.js','duellines.js','rivalghost.js','qready.js','hd2dgl.js','hd2d.js','weather7.js','pathguard.js','dungeon8.js','sprhd2.js','logo.js','title7.js','visuals7.js','field9.js','junk9.js','complete9.js','look9.js','handin9.js','guidance9.js','bonds9.js','menus9.js','battle9.js','npcmark9.js','rift9.js','riftkeeper9.js','arena9.js','charms9.js','holy9.js','skillfilt9.js','lore9.js','roles9.js','bosses9.js','heropose9.js','npcart9.js','bosses10.js','endgame10.js','anim10.js','sanctlook10.js','voidsky10.js','equipbtn10.js','scale10.js','rk10.js','sitelook10.js','worldzoom10.js','breach10.js','portrait10.js','econ11.js','fixes11.js','arena11.js','mats11.js','echo11.js','battle11.js','dmg11.js','res11.js','sheet11.js','fxkind11.js','breachlook11.js','nav11.js','skillrows11.js','menus11.js','zoomfix11.js','perf12.js','party12.js','skills12.js','records12.js','world12.js','titles12.js','kits12.js','menus12.js','worldart12.js']
# v0.5.1: the build ID is a hash of everything that goes into the page except appver.js itself (so it never depends on itself)
ver=re.search(r'APP_VER="([^"]+)"',r('appver.js')).group(1)

# v0.10.1: the v0.5.3 "Gilded Night" skin (ui3.css) is scoped under html:not(.flat) so the Flat look (gfx6.js, the Low tier) keeps the
# original style.css menus. Comments are dropped; every selector of every rule (also inside @media) gets the prefix; @keyframes are kept.
import re as _re
def scope_css(css,pre='html:not(.flat)'):
    css=_re.sub(r'/\*.*?\*/','',css,flags=_re.S)
    out=[];i=0;n=len(css);depth=0;ctx=[]  # ctx: 'media' or 'kf' per open brace
    buf=''
    def sel(txt):
        parts=[];
        for p in txt.split(','):
            p=p.strip()
            if not p:continue
            # specificity is kept as it was (the skin wins over style.css by source order, and later sheets win over it the same way):
            # :root gets :root:not(.flat) (it must beat style.css's :root), html... keeps (0,0,1) with :where, the rest a zero weight prefix
            if p==':root':parts.append(':root:not(.flat)')
            elif p=='html':parts.append('html:where(:not(.flat))')
            elif p.startswith('html'):parts.append('html:where(:not(.flat))'+p[4:])
            else:parts.append(':where('+pre+') '+p)
        return ','.join(parts)
    while i<n:
        c=css[i]
        if c in '"\'':
            j=css.find(c,i+1);buf+=css[i:j+1];i=j+1;continue
        if c=='{':
            head=buf.strip();buf=''
            if head.startswith('@keyframes') or (ctx and ctx[-1]=='kf'):
                ctx.append('kf');out.append(head+'{')
            elif head.startswith('@'):
                ctx.append('media');out.append(head+'{')
            else:
                ctx.append('rule');out.append(sel(head)+'{')
            i+=1;continue
        if c=='}':
            out.append(buf+'}');buf='';ctx.pop();i+=1;continue
        buf+=c;i+=1
    return ''.join(out)+buf
# v0.18.5 cleanup step 2: build guards (tools/buildcheck.py) stop the build on a missing or unlisted module, a reassigned top-level
# const, a duplicate top-level name or a syntax error in the joined script, and warn on the `//` swallow and duplicate functions
import sys
sys.path.insert(0,os.path.join(d,'tools'))
import buildcheck
if not buildcheck.run(MODS):sys.exit('v3build: build guards failed (see buildcheck lines above)')
src='\n'.join(r(n) for n in MODS if n!='appver.js')+r('fonts.css')+r('style.css')+scope_css(r('ui3.css'))+r('menus3.css')+r('battle3.css')+r('battle5.css')+r('battle4.css')+r('titles12.css')+r('shell.html')+r('liveboot.js')
build=hashlib.sha256(src.encode('utf-8')).hexdigest()[:12]
open(os.path.join(d,'v3','appver.js'),'w').write('const APP_VER="%s";const APP_BUILD="%s";\n'%(ver,build))
open(os.path.join(d,'version.json'),'w').write(json.dumps({'version':ver,'build':build},separators=(',',':'))+'\n')
js='\n'.join(r(n) for n in MODS)
boot='(function(){'+r('appver.js')+'\n'+r('liveboot.js')+'})();'
html=r('shell.html').replace('/*BOOT*/',boot).replace('/*CSS*/',r('fonts.css')+r('style.css')+scope_css(r('ui3.css'))+r('menus3.css')+r('battle3.css')+r('battle5.css')+r('battle4.css')+r('titles12.css')).replace('/*JS*/',js)
open(os.path.join(d,'out','aurelis3.html'),'w').write(html)
open(os.path.join(d,'out','sw.js'),'w').write(r('sw.js'))
print(len(html),'bytes, version',ver,'build',build)
