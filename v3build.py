import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda n:open(os.path.join(d,'v3',n)).read()
import hashlib,json,re
MODS=['config.js','fbconfig.js','appver.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','realmdata.js','art.js','art2.js','art3.js','sprhd.js','engine.js','engine2.js','worldgen.js','world4.js','worldgfx.js','worldgfx2.js','worldrt.js','bosstheme.js','bg.js','battle.js','audio.js','audio2.js','musicdata.js','ui.js','ui2.js','natures.js','feedback.js','account.js','legends.js','progression.js','tavern2.js','travel.js','insight.js','battlefx.js','nav.js','temper.js','journey.js','stuck.js','polish.js','towngfx.js','equip.js','equip2.js','party2.js','gearmig.js','town2.js','offline.js','describe.js','world3.js','chance.js','ceword.js','factions.js','mimic.js','mapheal.js','ailments.js','stsym.js','echocore.js','echo2.js','sanctum.js','comp2.js','comp.js','monsters2.js','archetype.js','fx2.js','learn.js','prog2.js','map.js','anim.js','battleui.js','autoset.js','shopfx.js','daylight.js','starter.js','tiers.js','sigskills.js','npc2.js','realms.js','roam.js','sites.js','rivals.js','sprites.js','capes.js','saves.js','cloud.js','update.js','allq.js','economy.js','p3shop.js','music2.js','sfx2.js','ambience.js','p4xp.js','p4party.js','p5settings.js','p5trans.js','p45hook.js','results.js','p2world.js','gfx6.js','gfx6world.js','gfx6battle.js','hdstage.js','hdspell.js','menus3.js','party3.js','v063prog.js','twists.js','icons.js','icons2.js','worldfx.js','battle3.js','remember.js','pacing.js','onboard.js','qready.js','hd2dgl.js','hd2d.js','pathguard.js','sprhd2.js']
# v0.5.1: the build ID is a hash of everything that goes into the page except appver.js itself (so it never depends on itself)
ver=re.search(r'APP_VER="([^"]+)"',r('appver.js')).group(1)
src='\n'.join(r(n) for n in MODS if n!='appver.js')+r('fonts.css')+r('style.css')+r('ui3.css')+r('menus3.css')+r('battle3.css')+r('shell.html')+r('liveboot.js')
build=hashlib.sha256(src.encode('utf-8')).hexdigest()[:12]
open(os.path.join(d,'v3','appver.js'),'w').write('const APP_VER="%s";const APP_BUILD="%s";\n'%(ver,build))
open(os.path.join(d,'version.json'),'w').write(json.dumps({'version':ver,'build':build},separators=(',',':'))+'\n')
js='\n'.join(r(n) for n in MODS)
boot='(function(){'+r('appver.js')+'\n'+r('liveboot.js')+'})();'
html=r('shell.html').replace('/*BOOT*/',boot).replace('/*CSS*/',r('fonts.css')+r('style.css')+r('ui3.css')+r('menus3.css')+r('battle3.css')).replace('/*JS*/',js)
open(os.path.join(d,'out','aurelis3.html'),'w').write(html)
open(os.path.join(d,'out','sw.js'),'w').write(r('sw.js'))
print(len(html),'bytes, version',ver,'build',build)
