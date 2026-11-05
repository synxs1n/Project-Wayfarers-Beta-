import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda n:open(os.path.join(d,'v3',n)).read()
js='\n'.join(r(n) for n in ['config.js','fbconfig.js','appver.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','realmdata.js','art.js','art2.js','art3.js','engine.js','engine2.js','worldgen.js','world4.js','worldgfx.js','worldgfx2.js','worldrt.js','bosstheme.js','bg.js','battle.js','audio.js','audio2.js','musicdata.js','ui.js','ui2.js','natures.js','feedback.js','account.js','legends.js','progression.js','tavern2.js','travel.js','insight.js','battlefx.js','nav.js','temper.js','journey.js','stuck.js','polish.js','towngfx.js','equip.js','equip2.js','party2.js','gearmig.js','town2.js','offline.js','describe.js','world3.js','chance.js','ceword.js','factions.js','mimic.js','mapheal.js','ailments.js','stsym.js','echocore.js','echo2.js','sanctum.js','comp2.js','comp.js','monsters2.js','archetype.js','fx2.js','learn.js','prog2.js','map.js','anim.js','battleui.js','autoset.js','shopfx.js','daylight.js','starter.js','tiers.js','sigskills.js','npc2.js','realms.js','roam.js','sites.js','pathguard.js','rivals.js','sprites.js','capes.js','saves.js','cloud.js','update.js','allq.js','economy.js','music2.js','sfx2.js','ambience.js','gfx6.js','gfx6world.js','gfx6battle.js'])
boot='(function(){'+r('appver.js')+'\n'+r('liveboot.js')+'})();'
html=r('shell.html').replace('/*BOOT*/',boot).replace('/*CSS*/',r('fonts.css')+r('style.css')).replace('/*JS*/',js)
open(os.path.join(d,'out','aurelis3.html'),'w').write(html)
open(os.path.join(d,'out','sw.js'),'w').write(r('sw.js'))
print(len(html),'bytes')
