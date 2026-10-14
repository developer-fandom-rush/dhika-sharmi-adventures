"""Neighbour Uncle pair history; original source remains read-only."""
import json,re,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]; raw=(R/'raw/Dhika.txt').read_bytes(); L=raw.decode().split('\n')
E=json.loads((R/'data/female_action_review/manifest.json').read_text())['episodes']
SHA='7e7ee52792f41f18f0c0b1ce4fb3f62ba932eb333dbc72493e879b05dfd12dbb'
assert hashlib.sha256(raw).hexdigest()==SHA
S=[]; B=[]; A=[]
def scene(mid,title,sections,time):S.append(dict(meeting_id=mid,title=title,sections=sections,time_anchor=time))
def beat(a,b,title,reading,kind='conversation',mid=None,fields=(),recalls=()):B.append(dict(start=a,end=b,title=title,reading=reading,kind=kind,meeting_id=mid,state_fields=list(fields),recalls_meeting_ids=list(recalls)))
def act(lines,title,who,targets=(),frame='actual',context=()):
 if isinstance(lines,int):lines=[lines]
 A.append(dict(lines=lines,action=title,initiated_by=who,targets=targets,temporal_frame=frame,context=list(context)))
def t(owner,part,mode,layer='not_stated',note=None):return dict(owner=owner,body_part=part,mode=mode,contact_layer=layer,qualification=note,context_evidence_global_lines=[])
scene('U01','Neighbourly childcare handover',[(18,30)],'E01 morning before college; Uncle and Aunty are neighbours, not blood relatives.')
beat(18,30,'Established family care and a private gaze habit','Dhika leaves Pappu in their care. Narration identifies both neighbours as early 60s and describes Uncle’s private attraction. Family trust does not establish Dhika knows that attraction.','care','U01',('care','familiarity','uncertainty'))
beat(66,71,'Uncle alone with Dhika’s bra','He handles and sniffs her used bra while imagining her breasts, then drops it and fetches milk when Aunty calls. Imagined body contact is not actual contact with Dhika.','private_action',fields=('attraction_uncle','physical_history'))
beat(116,116,'Dhika sees the displaced bra but does not suspect him','She explains the bra on the floor as having slipped; this is her interpretation, not what the reader has seen.','interpretation',fields=('uncertainty','interpretation'))
scene('U02','Family lunch and bra discovery',[(258,302)],'E02 family gathering after the E01 encounters; continuous lunch, milk errand and return.')
beat(258,282,'Dress, compliment and unequal knowledge','John knows Uncle’s attraction and chooses a tight top. Dhika wears skirt/top without understanding John’s motive. Uncle compliments her and watches her breasts during lunch; John notices, Dhika does not.','gaze','U02',('attraction_uncle','clothing','uncertainty'))
beat(283,290,'Milk errand becomes witnessed garment handling','Uncle handles, sniffs and licks the bra in her bathroom. Dhika follows, sees the act and the twitching bulge under his shorts, then leaves silently. This is garment contact and clothed genital observation.','physical','U02',('physical_history','uncertainty'))
beat(291,302,'Excited recall, concealment and protective explanation','She recalls the sight, conceals having entered, considers leaving milk with Aunty to avoid another visit and does not tell John. Her compassionate explanation remains her own interpretation.','memory','U02',('attraction_dhika','interpretation','hesitation','uncertainty'))
beat(395,395,'Later dress choice remembers Uncle','She considers the skirt disrespectful around Uncle and recalls the earlier incident. This is a reference, not another meeting.','memory',fields=('clothing','interpretation'),recalls=('U02',))
scene('U03','Accidental bra view, disclosure and Delhi farewell',[(954,988)],'E05 changing clothes before John returns; Uncle announces travel to Delhi the next day.')
beat(954,974,'Unexpected visitor while she changes','She is in white shorts/red bra, grabs a towel when Uncle appears and invites him to sit. The towel does not mean she is naked beneath it.','setup','U03',('clothing','hesitation','initiative'))
beat(975,984,'Earlier bra handling becomes shared knowledge','Dhika says she saw him with the bra. Uncle apologizes and mentions his wife’s declining interest. She holds his hand and explicitly asks him not to repeat it; he agrees and asks them to care for Aunty during his absence.','disclosure','U03',('openness','care','boundary_response','uncertainty'))
beat(985,988,'A direct appearance compliment before leaving','Uncle says she looked hot; she blushes and thanks him. A compliment is separate from physical contact.','compliment','U03',('attraction_uncle','hesitation'))
beat(992,992,'Airport send-off and care for Aunty','John and Dhika take Aunty to send Uncle off, then spend time with her.','care',fields=('care','separation'))
beat(2198,2198,'His absence affects Dhika’s clothing comfort','Narrator explicitly says she does not mind short dresses at Aunty’s while Uncle is away.','absence',fields=('clothing','separation'))
beat(2847,2847,'Extended stay discussed with Aunty','Dhika and Aunty discuss Uncle’s extended stay. No new direct pair action is assigned.','absence',fields=('separation',))
scene('U04','Return from Swiss: accidental naked observation',[(5160,5195)],'E28 after the Swiss trip; she enters to surprise Aunty. Repeated text at 5173–5175 is retained without double-counting.')
beat(5160,5176,'Uncle’s solo activity unexpectedly witnessed','Dhika encounters adult TV content and Uncle masturbating; only his penis head is initially visible from her angle. He covers his crotch with a small towel and stands. TV performers are not Uncle–Dhika actions.','physical','U04',('physical_history','hesitation'))
beat(5177,5195,'Apology, departure and private recollection','He is frightened, watches her thighs/legs, and she apologizes and leaves. Back in bed she recalls the visible penis head and worries about facing him.','memory','U04',('attraction_dhika','hesitation','separation'))
beat(5406,5416,'Uncle memory within a different pair’s scene','Images of Uncle and Bobby enter her thoughts during Chotu contact. Uncle is absent: remembered anatomy is not new Uncle contact.','memory',fields=('attraction_dhika',),recalls=('U04',))
beat(5534,5571,'John learns about the accidental view and bra discoveries','She clarifies she saw only the tip. Both reveal separately catching his bra handling. John’s teasing and her private assessment remain distinct; they do not tell Aunty.','disclosure',fields=('openness','relationship_with_john','uncertainty'),recalls=('U02','U04'))
beat(5648,5649,'Absence and Dhika’s guess about avoidance','Aunty says he is visiting a friend. Dhika wonders whether embarrassment is the reason; that cause is not confirmed.','interpretation',fields=('separation','interpretation'))
scene('U05','Awkward family visit before John travels',[(6105,6118)],'E33 before John leaves for Pune; Aunty and John are present.')
beat(6105,6118,'Shared awkwardness and wish to repair it','He avoids her eyes and answers briefly. She misses his usual warmth and wants to talk alone, but the visitors leave first.','response','U05',('hesitation','repair'))
beat(6119,6129,'John supports a private conversation','Their history of practical help and childcare explains existing trust. She explicitly plans to speak after dropping John at the airport.','setup',fields=('care','trust_statement','repair'),recalls=('U05',))
scene('U06','Door help, parcel and coffee reconciliation',[(6130,6153),(6162,6185)],'One visit continues from E33 into E34, after the airport drop; the chapter boundary is not another meeting.')
beat(6130,6145,'Help opening the door becomes a coffee invitation','Dhika asks for door help and insists he stay for coffee despite his reluctance. Her intention is to restore normal warmth.','care','U06',('care','initiative','repair'))
beat(6146,6153,'Parcel creates a separate knowledge concern','He brings the parcel in; she worries about him reading the Stranger’s note. The gift is not evidence that Uncle is the Stranger.','uncertainty','U06',('uncertainty',))
beat(6162,6179,'Apology and the ambiguous naked-view remark','He says he was ashamed of being caught; her towel joke prompts “But not naked.” She wonders what he means. The interpretation is uncertain, not an established request to see her naked.','disclosure','U06',('openness','hesitation','interpretation'))
beat(6180,6185,'Normal conversation and family dinner resume','She asks to put the incident behind them. He asks about her trip/work; they return to Aunty’s for dinner. This scene explicitly repairs awkwardness.','repair','U06',('repair','familiarity'))
scene('U07','Unexpected bathroom-door exposure',[(6460,6482)],'E35 before lunch; he explains he followed Pappu for safety. No body action is attributed to the child.')
beat(6460,6475,'Bra/panty view and quick covering','Uncle sees her in bra/panty with approximately 50% breast cleavage visible. She covers with her arms then towel; he averts his eyes, apologizes and leaves with a last glance.','physical','U07',('physical_history','clothing','hesitation'))
beat(6478,6482,'Locking the door and worrying what he thinks','Her thoughts about his reaction are not direct access to his mind.','inner_thought','U07',('hesitation','interpretation'))
scene('U08','Brief handover before errands',[(6503,6512)],'E35 around 4.30 PM; she says she will be away two hours.')
beat(6503,6512,'Ordinary handover carries morning embarrassment','Uncle receives her at his door; she recalls the bathroom incident and leaves quickly.','memory','U08',('care','hesitation'))
scene('U09','Early return discovers unauthorized bathroom use',[(6516,6568)],'E35 tailor cancels, so she returns earlier than the stated two hours.')
beat(6516,6538,'Unexpected sounds and a half-naked view','She first fears an intruder, then sees Uncle from behind, half naked and masturbating in her bathroom.','physical','U09',('physical_history','uncertainty'))
beat(6539,6553,'Anger, pity, uncertainty and waiting','She hears movement, a grunt and running water; source does not show a precise fluid destination here. She decides to ask why he uses her house.','inner_thought','U09',('interpretation','care','hesitation'))
beat(6554,6568,'He leaves before her explanation can begin','He says she was not due back for two hours and walks away. She calls after him, feels bad and plans another approach; she withholds it from John and Aunty for now.','separation','U09',('repair','separation','uncertainty'))
beat(6872,6877,'Aunty’s absence establishes later opportunity','Aunty visits her sister; Uncle remains home. This family arrangement is context, not a pair physical milestone.','setup',fields=('familiarity',))
scene('U10','Late-night conversation and bathroom permission',[(7294,7390)],'E39 around 10.30 PM; Aunty away. She returns home by 11 PM. Permission concerns use of a place, not all physical contact.')
beat(7294,7315,'Spare-key entry and accidental naked view','Dhika enters to speak, sees Uncle naked and erect. He tries to cover with an inadequate cloth and sits embarrassed.','physical','U10',('physical_history','hesitation'))
beat(7316,7344,'She stays to understand rather than leave again','She sits beside him, asks him to look at her and appeals to their long-standing love/familiarity.','conversation','U10',('care','repair','openness'))
beat(7345,7364,'His explanation changes what she knows','He says his wife no longer has sex with him, fears hurting her if discovered and admits using Dhika’s bathroom when she is absent. His account is reported personal history.','disclosure','U10',('openness','uncertainty','role'))
beat(7365,7379,'TV interruption, reassurance and practical permission','The TV restarts their visual attention. Dhika offers her bathroom even when she is home; he eventually nods after hesitation. This is explicit place-access permission.','permission','U10',('care','trust_statement','hesitation'))
beat(7380,7390,'Dhika initiates hug, then leaves','As she bends to hug the seated Uncle, he sees cleavage and her thighs touch his leg. His erection rises; at the door she sees the covering slip. TV acts remain separate from their contact.','physical','U10',('physical_history','initiative','attraction_uncle'))
beat(7410,7410,'Cross-pair carryover after Uncle visit','Narration links Uncle’s naked view with her excitement during the later Bobby interaction. This is causal narration, not another Uncle encounter.','memory',fields=('attraction_dhika',),recalls=('U10',))
beat(7495,7495,'Later Bobby scene explicitly recalls Uncle','Narration supplies continuing excitement from Uncle’s encounter as context for her reaction to Bobby.','memory',fields=('attraction_dhika',),recalls=('U10',))
scene('U11','Next-morning coffee and confirming access',[(7519,7570)],'E40 Wednesday around 11 AM; Aunty expected back in the evening.')
beat(7519,7536,'Uncle revisits the permission and she confirms it','He worries about being a problem. Dhika reassures him and makes coffee; agreement concerns bathroom access.','conversation','U11',('care','openness','trust_statement'))
beat(7537,7553,'Private imagined future use and anatomy comparison','While preparing coffee she imagines his future visit, recalls the bra and naked penis, and privately compares him with John. None of these thoughts is enacted contact or shared dialogue.','inner_thought','U11',('attraction_dhika','uncertainty'))
beat(7554,7570,'Leg gaze, shorts compliment and her reaction','She sits with a leg near her chest; he looks at legs/hind thighs and compliments her shorts. She blushes and privately considers a different dress next time.','gaze','U11',('clothing','attraction_uncle','hesitation'))
beat(7636,7640,'Bathing recall combines Bobby and Uncle memories','The swaying penis memory recurs alongside Bobby’s earlier action. Retain her stated heat between her legs, without assigning Uncle a new action.','memory',fields=('attraction_dhika',),recalls=('U10',))
beat(7966,7987,'Desire, respect and deferred disclosure','Dhika recalls Uncle but worries playful behaviour could disrupt their respected relationship. She thinks John should hear her bathroom arrangement in person.','inner_thought',fields=('attraction_dhika','hesitation','relationship_with_john'),recalls=('U10',))
scene('U12','Company visit, shared TV and first direct genital touch',[(8036,8161)],'E42 around 5.30 PM during rain; Aunty shopping. TV content is contextual, never a performed Uncle–Dhika act.')
beat(8036,8083,'Company-seeking visit becomes TV viewing','Wearing a short blue gown over bra/panty, she enters to seek company, sits watching adult TV, presses her thighs and spills water on her own dress. Uncle appears; she wonders how long he watched.','setup','U12',('clothing','attraction_dhika','uncertainty'))
beat(8084,8116,'He sits naked; clothing-removal suggestion follows','She observes his body and penis. He glances under her gown and suggests removing the soaked outer dress while assuming inner clothes. A suggestion is not completed undressing.','conversation','U12',('physical_history','clothing','openness'))
beat(8117,8138,'She removes the gown and turns toward him','Bra and striped panties remain. He watches cleavage; she turns her torso toward him. Narrator distinguishes her private wish concerning TV content from real contact.','physical','U12',('clothing','physical_history','initiative','attraction_dhika'))
beat(8139,8156,'Shoulder touch, request and initial no','Her right hand touches his shoulder. Uncle asks repeatedly for genital touch; she initially says no. Preserve the initial refusal separately from what she later does.','request','U12',('physical_history','boundary_response','openness'))
beat(8157,8161,'Brief left-hand genital contact and ejaculation','She touches his penis between thumb/forefinger; he ejaculates onto his own chest. She releases quickly, with one testicle caress. No TV intercourse or oral act is assigned to them.','physical','U12',('physical_history','initiative'))
beat(8170,8174,'Private recall and simultaneous guilt','E43 remembers the prior touch and testicle caress; no repeat orgasm is counted. Later handjob material in this chapter concerns John.','memory',fields=('attraction_dhika','hesitation'),recalls=('U12',))
beat(8812,8831,'John discovers the borrowed bra first in source order','John sees her lace bra at Uncle’s house. E46 then explains its loan through a backstory; source order is not event order.','third_party_report',fields=('relationship_with_john','uncertainty'))
scene('U13','Towel encounter, personal history and bra loan',[(8841,8985)],'E46 explicitly “Aftermath - the Backstory”: around 5 PM, before E45 John’s discovery at 7.30 PM.')
beat(8841,8886,'Unexpected entrance, apology and 25-year disclosure','She is in a small towel after showering. Uncle watches breasts/buttocks; she apologizes for the earlier touch and he says it was the first such touch in about 25 years. This is his statement, not a calculated exact age history.','disclosure','U13',('hesitation','openness','clothing'))
beat(8887,8937,'Questions about his marriage and an explicit local limit','She sits beside him and asks what happened. He hints at a costly mistake but postpones the full story. She explicitly says the earlier touch should not happen again.','conversation','U13',('openness','boundary_response','uncertainty'))
beat(8938,8955,'Bathroom request and separate dressing','He asks to use her bathroom and enters before she finishes speaking, closes it partially and removes shorts. She changes to white panties, black shorts and a braless tank top while he faces away.','physical','U13',('clothing','physical_history','trust_statement'))
beat(8956,8975,'Open-door masturbation witnessed; fluid stays on floor','She sees his penis as he turns, sits watching and dries her hair. Wind opens the door: he sees her braless top/panty gap, ejaculates onto the bathroom floor and closes the door. The source explicitly says it falls beneath him, not onto her.','physical','U13',('physical_history','attraction_dhika','uncertainty'))
beat(8976,8985,'He asks to borrow the bra; she nods approval','He takes the lace bra from the sink and asks. She nods after contemplating his attempt to open up. Clothing loan is not direct breast contact.','permission','U13',('openness','trust_statement','physical_history'))
scene('U14','Returned bra, requests and shirt unbuttoning',[(9592,9682)],'E49 about 15 minutes after John leaves; E50 at 9704 reports Uncle leaving after the warning.')
beat(9592,9630,'Unexpected arrival, dressing and returned garment','She initially mistakes him for John while lying topless in panties. He sees exposed back/buttocks; she asks him to wait, puts on bra and John’s shirt, then invites him back. He returns a washed/folded bra; she imagines how he used it, without confirmation.','physical','U14',('clothing','physical_history','uncertainty'))
beat(9631,9655,'Increasingly direct remarks and a request','Uncle says he liked what he saw and requests more visibility, then asks her to open buttons. She teases and opens the first three.','conversation','U14',('openness','initiative','clothing'))
beat(9656,9676,'Additional buttons open, inner clothes remain','She opens the remaining buttons, showing black bra, cleavage, stomach/navel and panties. She makes eye contact; he watches. Bare breasts or genital exposure are not established by this action.','physical','U14',('physical_history','clothing','initiative'))
beat(9677,9682,'His clothed self-touch and her timing warning','He presses his erection through shorts; she warns that John could return anytime. E50 confirms he left with a sad face, not a new orgasm.','boundary','U14',('boundary_response','physical_history'))
scene('U15','Early drive after taking Aunty to treatment',[(9692,9699),(9784,9798)],'E50 early morning. Internal John flashback in the chapter is not Uncle contact.')
beat(9692,9699,'Practical family travel and coffee offer','They return together after dropping Aunty near Dhika’s parents. She offers a coffee stop; he declines and they head home.','care','U15',('care','familiarity'))
beat(9704,9705,'Reported ending of the previous-night visit','Narrator reports he left sad after she warned John might return; this closes U14 and does not create another meeting.','reported_actual',fields=('separation',),recalls=('U14',))
beat(9784,9798,'Quiet drive, uncertain interpretation and teasing farewell','He points out a missed exit. She wonders whether he misunderstood her warning but does not ask; she teases him about Aunty’s absence at home. His motive is not established.','interpretation','U15',('openness','interpretation'))
beat(9816,9817,'A later visitor guess is not a new Uncle visit','She guesses Uncle might be at the door and recalls his recent unannounced entrances. It is Bobby instead.','memory',fields=('familiarity',))
scene('U16','Broken bathroom and plumber coordination',[(10190,10260),(10269,10278)],'E52 “Two days ago” flashback continues into E53. Neighbour Uncle and plumber Iroh remain distinct.')
beat(10190,10225,'Emergency call, protection and later gaze','Bathroom breaks. John advises calling Uncle; he rushes over while she is in towel/panty, first checks her safety, then looks at thighs and cleavage. Care and gaze are separate actions.','care','U16',('care','clothing','attraction_uncle'))
beat(10226,10246,'Repair help and changing clothes','She asks for the plumber’s number. He returns with an appointment after she changes to shorts/T-shirt. She wonders how to dress for the incoming workers.','care','U16',('care','clothing','interpretation'))
beat(10247,10260,'Iroh and Zuko arrive: three adult men, distinct roles','Neighbour Uncle shows the workers the damage. “Uncle: This is my nephew, Zuko” at 10253 belongs to plumber Iroh’s introduction, not the neighbour.','group_context','U16',('care','uncertainty'))
beat(10269,10278,'Neighbour Uncle volunteers to supervise','He helps arrange the next-day temporary repair and volunteers to watch the house while Dhika/John are absent. Plumber dialogue remains plumber dialogue.','care','U16',('care','trust_statement'))
scene('U17','Early shower visit after an incompletely narrated night',[(10294,10340)],'E53 “One day ago” around 5 AM; recollection names a previous-night act that is not directly shown in the reviewed source.')
beat(10294,10319,'Insomnia, remembered stimulation and clothed self-touch','She recalls an earlier-night act and ejaculation, touches her own nipples through a flimsy top, considers how he would react and puts a robe over braless top/panty. Do not invent the missing act mechanism.','memory','U17',('attraction_dhika','physical_history','uncertainty'))
beat(10320,10333,'Shower permission and his quick departure','He allows her to use his shower but leaves for a walk before her thought of dropping the robe is enacted. The wished-for robe drop is not a view he actually receives.','conversation','U17',('care','hesitation','separation'))
beat(10334,10340,'Portrait prompts recollection of his marriage story','Only after he leaves does she remove the robe. Aunty’s portrait recalls his story; exact details of that story are not supplied here.','memory','U17',('interpretation','uncertainty'))
beat(10354,10355,'His absence explicitly mentioned to the twins','She says she is using his shower and he went for a walk. This does not put Uncle in the twins’ video call.','third_party_report',fields=('uncertainty',))
beat(10416,10427,'Practical thanks and disclosure postponed','John asks her to thank him for supervising repair. She privately says she already did more, but postpones telling John. The unnamed extra act is not reconstructed.','disclosure',fields=('care','relationship_with_john','uncertainty'))
beat(10598,10598,'Return from Uncle’s house anchors Stranger communication','A passing reference dates a brief unblocking of the Stranger. It does not identify Uncle as the Stranger.','context',fields=('uncertainty',))
beat(10629,10629,'Private concern about explaining the bra loan','She considers what to tell John; this is inner thought.','inner_thought',fields=('relationship_with_john','uncertainty'))
beat(10657,10657,'John supplies a laundry explanation to others','His claim that the bra was mixed with neighbours’ laundry is a cover account, not the source-backed explanation of the loan.','third_party_report',fields=('uncertainty','relationship_with_john'))
scene('U18','Milk visit, reassurance and bathroom use',[(10840,10916),(10928,10948)],'E56 before noon: arrival just before 11.30 AM; narrated retrospectively while she drinks coffee. Sharmi then wakes; Chotu arrives later.')
beat(10840,10860,'Practical milk delivery and private bodily response','Uncle brings milk and sits quietly; she asks him to forget the earlier incident. He uses her bathroom; she hears sounds and feels a jolt between her legs, pressing her thighs together. Hearing is not confirmed visual contact.','care','U18',('care','repair','attraction_dhika','physical_history'))
beat(10861,10916,'Sharmi hears him and receives a limited account','Dhika explains permission for bathroom sessions, but declines his marital secret. Known visits since permission are fewer than five; unknown earlier visits are not assigned invented dates.','disclosure','U18',('uncertainty','openness'))
beat(10928,10948,'Uncle meets Sharmi with Dhika and Chotu present','Sharmi invites reluctant Uncle to coffee and leads him by the hand. Dhika watches his gaze at Sharmi’s panty-covered buttocks and feels a private bodily response. This is not Uncle touching Dhika.','group_context','U18',('uncertainty','attraction_dhika'))
beat(10966,11019,'Dhika privately observes Uncle–Sharmi contact','From the bedroom doorway Dhika witnesses Sharmi’s display, invitation and Uncle’s left-hand breast/nipple touch. Her own genital twitch and below-navel self-touch are observer responses, not contact by Uncle.','observed_other_pair',fields=('uncertainty','attraction_dhika','physical_history'))
beat(11096,11098,'Sharmi names Uncle in later aftermath','She describes him as naive/naughty. No additional Uncle–Sharmi mechanism is reported here; do not infer unseen actions.','third_party_report',fields=('uncertainty',))
beat(11322,11358,'John receives a partial account, with final act deferred','Dhika recounts accidental view, TV touch and bra loan/return. She withholds Uncle’s marriage story and a later surprising act, saying it is a story for another time. His acceptance does not prove he knows the withheld details.','disclosure',fields=('openness','relationship_with_john','uncertainty'))
scene('U19','Second bathroom failure and extended repair plan',[(11441,11460)],'E58 after the first temporary fix; proposed three-day repair before Pappu’s birthday.')
beat(11441,11455,'Uncle switches off water and coordinates workers','He detects leakage, shuts the water line and helps arrange Iroh and workers staying for repairs. Ordinary care continues after intimate events.','care','U19',('care','familiarity'))
beat(11456,11460,'John suggests staying next door; she questions it','The sleeping arrangement is only discussed; it is not an enacted three-person encounter.','proposal','U19',('boundary_response','uncertainty'))
beat(11515,11515,'Date of her emotional message linked to his story','John notices the message timestamp matches the night she says she heard Uncle’s story. No actual story content is provided here.','third_party_report',fields=('uncertainty','relationship_with_john'))
beat(13191,13191,'Birthday absence announced','John says the neighbours cannot attend. This does not erase the earlier morning preparation visit.','absence',fields=('separation',))
beat(13203,13224,'Birthday morning practical conversation and her concern','Uncle discusses bathroom/house refurbishment with John. Chotu enters; Dhika covers at the sound of Uncle’s voice, then sees Chotu at the bedroom door. Her accusation about exposure is not evidence that Uncle saw her naked.','group_context',fields=('care','uncertainty'))
# Actions: concise clinical indexing; full original paragraphs always authoritative.
act([25,26,29],'Childcare handover and reassurance','uncle',[],context=[18,21,24])
act([67,68,71],'Handle/sniff used bra, imagine breasts, then drop garment','uncle',[t('dhika','bra_garment','handle_and_sniff','garment_only','No direct breast contact. Imagined breasts are separate from garment handling.')])
act(67,'Imagined breasts and caressing fingers','uncle',[t('dhika','breasts','imagined_view_or_caress','imagined_in_bra')],'imagined')
act([276,278,282],'Compliment and clothed breast gaze at lunch','uncle',[t('dhika','breasts','look','tight_top_no_cleavage')])
act([284,287],'Sniff and lick bra cups; Dhika observes','uncle',[t('dhika','bra_cups_garment','sniff_and_lick','garment_only')])
act([287,288],'Dhika sees twitching erection under shorts','dhika',[t('uncle','penis','look','through_shorts')])
act([961,963,967],'Uncle sees bra before Dhika covers with towel','uncle',[t('dhika','breasts','look','red_bra')],context=[954,960,964,966])
act(981,'Dhika holds his hand while requesting no repetition','dhika',[t('uncle','hand','hold')],context=[977,980,982])
act([5169,5171,5176],'Dhika witnesses masturbation and initial penis-head view','dhika',[t('uncle','penis_head','look','bare'),t('uncle','penis','solo_activity_observed','bare','Rhythmic sound and later disclosure support masturbation; the hand movement is not described in this initial view.')],context=[5165,5168])
act([5180,5182],'Mutual body observation after he covers crotch','both',[t('uncle','body','look','naked_with_towel_over_crotch'),t('dhika','thighs_and_legs','look','short_dress_and_jacket')])
act([6135,6136,6148],'Receive key, open door and carry parcel','uncle',[t('uncle','hands','practical_help')])
act([6467,6469,6472,6475],'Uncle sees bra/panty cleavage; Dhika covers and he leaves','uncle',[t('dhika','breasts_cleavage','look','bra_approximately_half_visible'),t('dhika','panty_garment','look','panties')])
act(6538,'Dhika sees Uncle half naked masturbating from behind','dhika',[t('uncle','body','look','half_naked'),t('uncle','penis','self_masturbation','not_fully_visible_from_her_angle')])
act([7308,7313,7315],'Naked body and penis observed before cloth covering','dhika',[t('uncle','penis','look','bare_then_small_cloth')])
act([7380,7381,7382],'Dhika hugs seated Uncle; thigh-to-leg contact and cleavage gaze','dhika',[t('dhika','breasts_cleavage','look','low_cut_top'),t('dhika','thighs','touch_his_leg','shorts'),t('uncle','leg','thigh_contact','as_narrated')])
act([7389,7390],'Dhika looks as cloth slips and penis becomes visible','dhika',[t('uncle','penis','look','bare')])
act([7554,7556,7557],'Uncle looks at legs and hind thighs during coffee','uncle',[t('dhika','legs_and_hind_thighs','look','shorts')],context=[7559])
act([8072,8074,8075],'Watching TV: thigh pressing, vaginal wetness and spilled water','dhika',[t('dhika','thighs','self_press','blue_gown'),t('dhika','vulva_vagina_as_source_pussy','felt_wetness','internal_response'),t('dhika','dress_garment','water_spill','wet_fabric')],'self_response',context=[8010,8040])
act([8084,8085,8091],'Uncle sits naked; Dhika observes penis','uncle',[t('uncle','penis','look','bare')])
act([8095,8096],'Uncle briefly sees panties under raised gown','uncle',[t('dhika','panty_garment','look','gown_raised')])
act(8104,'Suggestion to remove wet outer dress','uncle',[t('dhika','dress_garment','spoken_request','wet_gown')],'spoken_not_completed',context=[8108])
act([8117,8118,8119],'Dhika removes gown; bra and panties remain','dhika',[t('dhika','breasts','look','full_black_bra'),t('dhika','panty_garment','look','striped_panties')])
act([8123,8129],'Private wetness and imagined TV action','dhika',[t('dhika','vulva_vagina_as_source_pussy','felt_wetness','internal_response')],'private_response_or_imagination')
act([8130,8131],'Dhika turns toward Uncle; he watches cleavage','dhika',[t('dhika','breasts_cleavage','look','bra_remains')])
act(8141,'Her right hand touches his shoulder','dhika',[t('uncle','shoulder','hand_touch','bare_skin')])
act([8143,8150,8151],'Request for genital touch and her initial no','uncle',[t('uncle','penis','request_and_initial_refusal','bare')],'spoken_not_completed')
act([8157,8158,8159,8160,8161],'Brief penile touch; ejaculation on his chest; testicle caress','dhika',[t('uncle','penis','thumb_forefinger_touch','bare'),t('uncle','chest','semen_deposition','own_chest'),t('uncle','testicles','caress_once','bare')])
act([8862,8863,8909,8936],'Uncle looks at cleavage, thighs and partly visible buttock','uncle',[t('dhika','breasts_cleavage','look','small_towel'),t('dhika','thighs','look','small_towel'),t('dhika','buttock','look','towel_side_gap')])
act([8951,8953,8954,8955],'He undresses in bathroom; she dresses separately','uncle',[t('uncle','thighs_and_legs','look','bare'),t('dhika','breasts','clothing_state','braless_tank_top'),t('dhika','panty_garment','clothing_state','white_panty_under_black_shorts')])
act([8965,8967,8968],'Dhika watches masturbation while sitting and drying hair','uncle',[t('uncle','penis','self_masturbation_observed','bare')])
act([8970,8971,8972,8973,8974,8975],'Open door: gaze and ejaculation onto bathroom floor','uncle',[t('dhika','breasts','look','braless_top'),t('dhika','panty_garment','look','visible_between_legs'),t('uncle','penis','ejaculation','floor_not_onto_dhika')])
act([8979,8980,8985],'Uncle requests bra loan and Dhika nods approval','uncle',[t('dhika','bra_garment','loan','garment_only')])
act([9594,9597,9598,9604,9606],'Unannounced arrival sees bare back/buttocks; she dresses','uncle',[t('dhika','back','look','bare'),t('dhika','buttocks','look','partly_bare_with_panties'),t('dhika','breasts','turn_exposes','topless','Extent of his breast view not independently specified; source at 9639 says he did not see anything.')])
act([9614,9616],'Return washed and folded bra','uncle',[t('dhika','bra_garment','return','garment_only')])
act([9621,9624],'Imagined use of bra against his penis','dhika',[t('uncle','penis','imagined_garment_rubbing','imagined')],'imagined')
act([9651,9653,9659,9665,9673,9675,9676],'Dhika unbuttons shirt for gaze; bra/panties remain','dhika',[t('dhika','breasts_cleavage','look','black_bra'),t('dhika','stomach_navel','look','visible_skin'),t('dhika','panty_garment','look','black_panties')])
act([9677,9682],'Uncle presses erection under shorts; she warns John may return','uncle',[t('uncle','penis','self_press','through_shorts')])
act([10222,10224],'Gaze follows initial safety concern','uncle',[t('dhika','thighs','look','small_towel'),t('dhika','breasts_cleavage','look','small_towel')])
act([10301,10302,10304],'Remembered ejaculation with her own nipple touch','dhika',[t('dhika','nipples','self_touch','through_flimsy_top')],'memory_and_self_contact')
act(10327,'Private wish to drop robe before he leaves','dhika',[t('dhika','robe_garment','imagined_removal','robe_over_top_and_panties')],'imagined_not_enacted')
act(10334,'Robe removed after Uncle has left','dhika',[t('dhika','robe_garment','remove','uncle_absent')],'self_action_uncle_absent')
act([10843,10855,10856],'Bathroom masturbation heard; her thigh pressing response','uncle',[t('uncle','penis','masturbation_heard','not_visually_confirmed_here'),t('dhika','between_legs_unspecified','felt_jolt','private_response'),t('dhika','thighs','self_press','not_stated')])
act([10948,11018,11019],'Dhika responds privately while observing Sharmi–Uncle','dhika',[t('dhika','vulva_vagina_as_source_pussy','felt_twitch','private_response'),t('dhika','below_navel','self_clutch','not_stated')],'observer_self_response')
UD=(S.copy(),B.copy(),A.copy()); S.clear(); B.clear(); A.clear()
scene('US01','Introduction and kitchen-table encounter',[(10928,10948),(10966,11019)],'E56 late morning/noon; Dhika observes from bedroom doorway, Chotu is in bedroom during the table sequence.')
beat(10868,10916,'Sharmi hears Uncle and learns limited background','Before meeting him she hears bathroom sounds. Dhika explains access permission but declines to reveal his marriage story. Sharmi asks if she has seen his penis; doorbell interrupts the question.','context',fields=('uncertainty','openness'))
beat(10928,10938,'Introduction and initial visual response','Dhika introduces Uncle to Sharmi. He sees her in semi-transparent robe, braless with green panties visible; embarrassment is explicitly distinguished from lust.','gaze','US01',('clothing','hesitation','familiarity'))
beat(10939,10948,'Sharmi invites and leads him by the hand','He initially declines coffee; she insists, takes his hand and leads him toward the kitchen. He watches her panty-covered buttocks as the robe lifts.','physical','US01',('initiative','physical_history','attraction_uncle'))
beat(10966,10985,'Water-soaked robe and towel handling','Uncle looks at thighs, inner thighs and chest. The source first shows the robe already wet; it does not show the spill happen. She asks for a towel and presses/wipes her breasts through the robe, exposing more skin.','physical','US01',('clothing','physical_history','initiative'))
beat(10986,11003,'Questions, his misunderstanding and bare breast display','She asks whether he likes them. He offers to leave and thinks she will wait until he finishes coffee; instead she opens the robe past her nipples and wipes bare breasts/nipples. His expectation and the reader’s knowledge differ.','conversation','US01',('openness','uncertainty','physical_history'))
beat(11004,11014,'Visible erection, compliment and invitation to touch','She looks at his clothed bulge and asks about her nipples; he initially thinks she means coffee, then calls them cute. She invites him to touch. Offer is separate from the following actual action.','request','US01',('openness','initiative','attraction_uncle'))
beat(11015,11019,'His left-hand breast/nipple contact and observer response','He supports/tugs beneath her left breast and tweaks the nipple with his thumb. She moans and her bust jerks; Dhika feels a private twitch and touches below her own navel. No Uncle contact with Dhika is assigned.','physical','US01',('physical_history','initiative'))
beat(11096,11098,'Later Sharmi reference: only reported aftermath','In a later Dhika–Sharmi scene she names Uncle and calls him naive/naughty. There is no additional narrated Uncle mechanism to extract from these words.','memory',fields=('uncertainty',),recalls=('US01',))
act([10928,10929],'Introduction: Uncle observes robe/panty appearance','uncle',[t('sharmi','breasts','look','braless_semi_transparent_robe'),t('sharmi','panty_garment','look','green_panties')],context=[10862,10864])
act(10944,'Sharmi takes Uncle’s hand and leads him to kitchen','sharmi',[t('uncle','hand','hold_and_lead')])
act([10946,10948],'Uncle looks at panty-covered buttocks as robe lifts','uncle',[t('sharmi','buttocks','look','panties_visible_under_lifted_robe')])
act([10972,10974,10977],'Gaze at thighs, inner thighs and wet robe over chest','uncle',[t('sharmi','thighs_inner_thighs','look','raised_robe'),t('sharmi','breasts','look','wet_semi_transparent_robe')])
act([10980,10981,10983,10985],'Towel passed; Sharmi wipes/presses breasts herself','sharmi',[t('sharmi','breasts','self_wipe_and_press','robe_then_partly_exposed')])
act([10997,10998,11000],'Sharmi opens robe and wipes bare breasts/nipples','sharmi',[t('sharmi','breasts','self_wipe_and_expose','bare'),t('sharmi','nipples','towel_touch','bare')])
act(11004,'Sharmi sees Uncle’s bulge under shorts','sharmi',[t('uncle','penis','look','through_shorts')])
act([11008,11009,11012,11014],'Nipple gaze, compliment and offer of touch','sharmi',[t('sharmi','nipples','look_and_spoken_offer','bare')],'spoken_offer_then_later_action')
act([11015,11016,11017],'Uncle left hand supports left breast and tweaks nipple','uncle',[t('sharmi','left_breast','support_and_gentle_tug','bare'),t('sharmi','left_nipple','thumb_tweak','bare')])
US=(S.copy(),B.copy(),A.copy())
# Avoid silently combining unrelated plumber honorifics with neighbour Uncle.
IROH_ONLY={10251,10252,10253,10258,10271,10276,10423,*range(12802,12897)}
def ref(n):
 e=next(e for e in E if e['global_line_start']<=n<=e['global_line_end'])
 return dict(global_line=n,episode_id=e['episode_id'],episode_line=n-e['global_line_start']+1,text=L[n-1])
def build(pair,title,spec):
 scenes,beats,actions=spec;out=[]
 for e in E:
  lo,hi=e['global_line_start'],e['global_line_end'];chosen=set();bs=[];ms=[];ps=[]
  for s in scenes:
   sections=[(max(lo,a),min(hi,b)) for a,b in s['sections'] if a<=hi and b>=lo]
   if sections:
    ns=sorted({i for a,b in sections for i in range(a,b+1)});chosen.update(ns)
    ms.append(dict(meeting_id=s['meeting_id'],title=s['title'],time_anchor=s['time_anchor'],time_anchor_evidence=[ref(ns[0])],sections=sections))
  for b in beats:
   a,z=max(lo,b['start']),min(hi,b['end'])
   if a>z:continue
   chosen.update(range(a,z+1));bs.append(dict(**{k:v for k,v in b.items() if k not in ('start','end')},start=a,end=z,episode=int(e['episode_id'][1:]),beat_id=f'{pair}-{e["episode_id"]}-B{len(bs)+1:02}',evidence_global_lines=list(range(a,z+1)),story_sequence_order=a,reading_status='source_grounded_interpretation'))
  for j,a in enumerate(actions):
   ns=[n for n in a['lines'] if lo<=n<=hi]
   if not ns:continue
   chosen.update(ns);chosen.update(n for n in a['context'] if lo<=n<=hi)
   ev=[dict(**ref(n),quote=L[n-1]) for n in ns]
   ps.append(dict(action_id=f'{pair}-A{j+1:03}',action=a['action'],initiated_by=a['initiated_by'],temporal_frame=a['temporal_frame'],evidence=ev,body_targets=[dict(**{k:v for k,v in t.items() if k!='context_evidence_global_lines'},evidence_global_lines=ns,context_evidence_global_lines=a['context']) for t in a['targets']],body_annotation_status='curated_source_targets'))
  mentions=[]
  if pair=='UD':
   mentions=[n for n in range(lo,hi+1) if re.search(r'\buncle\b',L[n-1],re.I) and n not in IROH_ONLY]
   chosen.update(mentions)
  source=[ref(n) for n in sorted(chosen)]
  idx=[]
  for s in source:
   tags=['character_labelled_line; speech_vs_inner_voice_requires_context' if re.match(r'^\s*(?:Dhika|Sharmi|Uncle):',s['text'],re.I) else 'narration_or_context']
   for pat,tag in [(r'\b(think\w*|thought\w*|wonder\w*|remember\w*|recall\w*|imag\w*|mind|wish\w*)\b','literal_cognition_or_recall_wording'),(r'\b(heat|wet\w*|tingl\w*|arous\w*|hardon|erection|twitch\w*|blush\w*|shy\w*|warm\w*|jolt|moan\w*)\b','literal_body_response_or_material_wording'),(r'\b(look\w*|saw|see\w*|eyes|gaze|stare\w*|glanc\w*)\b','literal_observation_wording')]:
    if re.search(pat,s['text'],re.I):tags.append(tag)
   idx.append(dict(**s,source_form_tags=tags))
  unassigned=[n for n in mentions if not any(b['start']<=n<=b['end'] for b in bs)]
  out.append(dict(episode_id=e['episode_id'],source_range=[lo,hi],meetings=ms,bond_beats=bs,physical_actions=ps,source_lines=source,writing_style_source_index=idx,body_discussion_and_desire=[],explicit_reference_lines=mentions,reference_only_lines=unassigned,absence_note=None if chosen else 'No pair-specific scene or explicit neighbour-Uncle reference assigned. This is not proof of an unseen event.'))
 groups=[dict(meeting_id=s['meeting_id'],title=s['title'],time_anchor=s['time_anchor'],episode_sections=[dict(episode=e['episode_id'],start=max(a,e['global_line_start']),end=min(b,e['global_line_end'])) for a,b in s['sections'] for e in E if a<=e['global_line_end'] and b>=e['global_line_start']]) for s in scenes]
 uncertainties=[dict(lines=[5171,5174],issue='Repeated face/penis-head paragraph at the E28 boundary is one observation, not two.'),dict(lines=[8036,8840,8812,10293],issue='Several chapters use flashback or backstory. Source order is retained; calendar ordering is not guessed.'),dict(lines=[10253],issue='The speaker introduces nephew Zuko and belongs to plumber Iroh; not neighbour Uncle.'),dict(lines=[10301,10307,10851,11331,11354,11515],issue='Later passages refer to a marriage story and a surprising final act not directly narrated in the reviewed raw sequence. Exact references retained; missing mechanism is not invented.'),dict(lines=[10909],issue='Known bathroom visits after permission are fewer than five; prior unknown visits have no invented count or dates.'),dict(lines=[10974,11096],issue='Wet robe is first shown already soaked. Later Sharmi aftermath does not establish additional offscreen Uncle contact.'),dict(lines=[8150,8937],issue='Initial refusal and local request against repetition remain separate from later actual actions.'),dict(lines=[8973,8974],issue='E46 ejaculation is onto floor beneath Uncle, not onto Dhika.'),dict(lines=[13221,13224],issue='Dhika hears Uncle but the bedroom visitor is Chotu; no confirmed Uncle view of her naked body is added.')]
 style_specs=[
 (18,30,'Care and narrator knowledge','Ordinary practical dialogue is accompanied by narrator-only attraction; Dhika is not assigned that knowledge.'),
 (284,302,'Witnessed action, concealed knowledge and recall','The observed bra act is followed by private recall and an outward explanation that conceals what she saw. Source spelling/anatomy stays intact.'),
 (975,984,'Disclosure and an explicit local request','A private observation becomes shared through dialogue; hand holding and a no-repetition request are separately narrated.'),
 (6162,6184,'Repair conversation and interpretation uncertainty','Direct apology and answers establish repair. Her interpretation of “But not naked” remains a question rather than established intent.'),
 (7294,7390,'Practical permission and private observation','Arrival, accidental viewing, questions, personal disclosure, permission and hug remain distinct. TV events are separately contextual.'),
 (8036,8161,'TV context, gaze, private sensations and actual contact','The source alternates external TV scenes, inner voice, dialogue and actual actions. The card chronology never transfers TV acts to the pair.'),
 (8841,8985,'Backstory order and later garment evidence','Narrative backstory supplies the earlier context for John’s garment discovery. A verbal local limit, place permission and garment loan have different scopes.'),
 (9592,9682,'Requests, dressing changes and a timing warning','Private imagination of garment use is not confirmed by his return. Button opening retains bra/panty layers; a timing warning closes the sequence.'),
 (10840,10916,'Sound, recall and unequal disclosure','Sounds are heard from a different room; bodily response is narrated privately. Sharmi receives only part of the history.'),
 (10928,11019,'Observer perspective and unequal knowledge','Dhika observes from a doorway. Source distinguishes Uncle’s mistaken expectations, Sharmi’s dialogue, her self-actions and his actual left-hand touch.')]
 observations=[dict(title=text,lines=list(range(a,b+1)),observation=note,evidence=[ref(i) for i in range(a,b+1)]) for a,b,text,note in style_specs if pair=='UD' or a==10928]
 return dict(title=title,pair_key=pair,scope=dict(pair=['uncle','dhika' if pair=='UD' else 'sharmi'],episodes='E01–E69',source_sha256=SHA,source_path='raw/Dhika.txt'),counts=dict(episode_slots=69,meeting_groups=len(scenes),bond_beats=len(beats),physical_reference_records=sum(len(e['physical_actions']) for e in out),preserved_context_lines=sum(len(e['source_lines']) for e in out)),episodes=out,meeting_groups=groups,source_uncertainties=uncertainties,evidence_links=[],style_observations=observations,body_tracking_policy=dict(knowledge='Narration/inner thoughts do not establish another character knows them. Dialogue and response need scene context.',coverage='Curated scenes, exact source and reference-only lines are separate. Name coverage is not exhaustive semantic certification.'),future_planning=dict(status='no_predictions_generated'))
D=dict(schema_version='uncle-pairs-1.0',identity=dict(neighbour_uncle_evidence=[ref(20),ref(21)],sharmi_age_approximation=ref(5874),excluded_character='plumber Iroh / Zuko’s uncle'),pairs={'UD':build('UD','Uncle & Dhika',UD),'US':build('US','Uncle & Sharmi',US)})
(R/'data/uncle_pair_tracker.json').write_text(json.dumps(D,ensure_ascii=False,separators=(',',':'))+'\n')
for p in D['pairs'].values():
 for e in p['episodes']:
  for s in e['source_lines']:assert s['text']==L[s['global_line']-1]
  assert set(e['explicit_reference_lines'])<={s['global_line'] for s in e['source_lines']}
  for a in e['physical_actions']:
   for s in a['evidence']:assert s['quote']==L[s['global_line']-1]
 print(p['title'],p['counts'])
print('PASS: all evidence exact; both 69-slot datasets built; neighbour/plumber identity separated.')
