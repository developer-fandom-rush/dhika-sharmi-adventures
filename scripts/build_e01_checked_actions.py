#!/usr/bin/env python3
"""Explicit E01 span annotations, checked against canonical text in this turn.

These annotations do not claim complete episode-level review.
"""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
LINES=(ROOT/'raw/Dhika.txt').read_text().split('\n')
EVENTS=[]

def event(line, quote, action, actor, recipient=None, body=(), reality='actual',
          state=(), intent='unknown', clothing=None, contact='unknown', notes=(),
          centres=('dhika',), group=None, action_type=2, context=()):
    text=LINES[line-1]; a=text.index(quote)
    actors=actor if isinstance(actor,list) else ([actor] if actor else [])
    recipients=recipient if isinstance(recipient,list) else ([recipient] if recipient else [])
    e={'event_id':f'E01-CHK-{len(EVENTS)+1:03d}','episode_id':'E01',
       'line_id':f'E01-L{line-2:04d}','record_kind':'checked_event','review_status':'checked_span',
       'female_centres':list(centres),'characters_involved':sorted(set(actors+recipients)),
       'actor_ids':actors,'recipient_ids':recipients,'observer_ids':[],
       'initiated_by':None if action.startswith('feel_') or action in ['blush','groan'] else (actors if actors else None),'action':action,'action_type':action_type,
       'reality_status':reality,'event_state':list(state),'intent':intent,
       'consent':'not_stated','body_parts_involved':[{'owner_id':owner,'part':part,'role':role} for owner,part,role in body],
       'clothing_state_by_character':clothing or {},'contact_layer':contact,
       'group_event_id':group,'simultaneous_group_id':None,'previous_event_by_female':{},
       'source':{'global_line':line,'episode_line':line-2,'start':a,'end':a+len(quote),'quote':quote},
       'context_global_lines':list(context),'ambiguity_notes':list(notes)}
    EVENTS.append(e)

event(21,'he never missed a chance to ogle at her','gaze_at_dhika','uncle','dhika',reality='historical_habit',notes=['Habitual description; not one newly counted encounter.'],context=[20,21])
event(35,'Blushing','blush','dhika',state=['blushing'],context=[33,34])
event(48,'Dhika had worn a beautiful pink cotton saree','wear_saree','dhika',clothing={'dhika':{'state':'clothed','description':'pink cotton saree','evidence_global_lines':[48]}})
event(56,"Pinching Dhika's waist",'pinch_waist','sharmi','dhika',body=[('dhika','waist','target')],context=[54,55,57],notes=['Sharmi identified by the following source line. Clothing contact layer is not specified.'],group='E01-G-FRIENDS',centres=('dhika','sharmi'))
event(64,'she put her tongue out','stick_out_tongue','dhika',body=[('dhika','tongue','acting_part')],context=[63,64])
event(67,'fingers fiddling with her bra','handle_dhika_bra','uncle','dhika',body=[('uncle','fingers','acting_part')],contact='garment_object',context=[67,68,71],notes=['Dhika is garment owner; she is not physically present in this action.'])
event(67,'Uncle imagined two milky breasts filled in those little cups','imagine_dhika_body','uncle','dhika',body=[('dhika','breasts','imagined_target')],reality='imagined',action_type=1,notes=['No actual contact with Dhika is established.'])
event(67,'a tiny set of fingers caressing the top of those bulging breasts','imagine_caress',None,'dhika',body=[(None,'fingers','imagined_acting_part'),('dhika','breasts','imagined_target')],reality='imagined',action_type=1,notes=['Imaginer is Uncle; owner of the imagined fingers is not explicitly identified.'],context=[67])
event(68,'he sniffed into the inside of her used bra','sniff_dhika_bra','uncle','dhika',contact='garment_object',context=[67,71],notes=['Object contact, not direct contact with the garment owner.'])
event(68,'he groaned','groan','uncle',state=['groaned'],notes=['Female centre is garment owner from scene context, not recipient of physical contact.'],context=[67,68,71])
event(71,"Dropping Dhika's bra on her bathroom floor",'drop_dhika_bra','uncle','dhika',contact='garment_object',context=[67,68,71])
event(79,'She was blushing inside','blush','dhika',state=['blushing'],context=[77,79])
event(81,'He saw Dhika saree at the hip was a little below and a small white hip was visible','see_exposed_hip','bobby','dhika',body=[('dhika','hip','viewed_part')],contact='no_contact',clothing={'dhika':{'state':'partially_exposed','description':'saree worn; small area of hip visible','evidence_global_lines':[81]}},notes=['Partial hip exposure does not mean unclothed.'])
event(82,'She felt embarrassed but didn\'t cover it','feel_embarrassed_and_leave_hip_uncovered','dhika',body=[('dhika','hip','visible_part')],state=['embarrassed'],notes=['Not covering herself is not consent to physical contact.'],context=[81,82])
event(92,'Bantu saw her beautiful apple like ass jiggling lightly when she walked','see_dhika_walking','bantu','dhika',body=[('dhika','buttocks','viewed_part')],contact='no_contact',notes=['Source description of movement; direct skin exposure is not stated.'],group='E01-G-RIDE')
event(92,'Bobby looking at her ass','look_at_dhika','bobby','dhika',body=[('dhika','buttocks','viewed_part')],contact='no_contact',group='E01-G-RIDE')
event(94,'He wanted to sit close to her','want_to_sit_close','bobby','dhika',reality='intended',action_type=1,notes=['Desire at this point; subsequent seating is a separate action.'],group='E01-G-RIDE')
event(95,'Bantu wanted to sit close to Dhika','want_to_sit_close','bantu','dhika',reality='intended',action_type=1,group='E01-G-RIDE')
event(96,'Bobby, you can hold me so that you don\'t miss balance','permit_holding_for_balance','dhika','bobby',reality='instruction',action_type=None,notes=['Permission for balance support is not blanket permission for all subsequent contact.'],group='E01-G-RIDE')
event(99,'put both his hands around her hip','put_hands_around_hip','bobby','dhika',body=[('bobby','hands','acting_part'),('dhika','hip','target')],group='E01-G-RIDE',context=[96,99,100])
event(99,'held her stomach tightly','hold_stomach','bobby','dhika',body=[('bobby','hands','acting_part'),('dhika','stomach','target')],group='E01-G-RIDE',notes=['Source states Dhika expected shoulder support instead. Her silence is not coded as willingness.'],context=[96,99,100,101])
event(100,'I meant him to hold my shoulders','intend_shoulder_support','dhika','bobby',body=[('dhika','shoulders','intended_target')],reality='intended',action_type=1,notes=['Shoulder contact did not occur in the cited action.'],group='E01-G-RIDE')
event(102,"Bobby's one finger was tapping her stomach over the saree",'tap_stomach','bobby','dhika',body=[('bobby','finger','acting_part'),('dhika','stomach','target')],contact='through_clothing',group='E01-G-RIDE',clothing={'dhika':{'state':'clothed','description':'stomach contact over saree','evidence_global_lines':[102]}})
event(102,'his hands at the side of the hips were moving slowly and rubbing against her bare hip','rub_bare_hip','bobby','dhika',body=[('bobby','hands','acting_part'),('dhika','hip','target')],contact='direct_skin',group='E01-G-RIDE',clothing={'dhika':{'state':'partially_exposed','description':'bare hip area; other clothing remains','evidence_global_lines':[81,102]}},notes=['Intent is unstated; do not automatically label accidental or seduced.'])
event(103,'She felt a chill go through her body','feel_chill','dhika',body=[('dhika','body','responding_part')],state=['chill','shy'],group='E01-G-RIDE',notes=['Chill is source-stated; arousal is not explicitly named.'],context=[102,103])
event(122,'She took her shawl and covered her modestly','cover_with_shawl','dhika',clothing={'dhika':{'state':'clothed','description':'shawl added','evidence_global_lines':[122]}})
event(130,'grabbed the dupatta and threw it on the sofa','remove_and_throw_dupatta','dhika',clothing={'dhika':{'state':'clothed','description':'kurti remains; dupatta removed','evidence_global_lines':[117,130]}},notes=['Removal of shawl is not complete undressing.'])
event(143,'she bent down to give it to him','bend_to_hand_glass','dhika','chotu',context=[130,131,132,133,143,145],intent='deliberate',notes=['Bending is deliberate; lack of shawl was noticed afterwards. Exposure was not established as deliberate here.'])
event(145,'what if he saw inside my dress','question_possible_viewing','dhika','chotu',reality='hypothetical',action_type=1,notes=['This is not proof Chotu saw a particular body part.'])
event(153,"Dhika couldn't be sure if he saw her cleavage or her bra or what if something more was visible",'question_possible_viewing','dhika','chotu',body=[('dhika','cleavage','hypothetical_viewed_part')],reality='uncertain_perception',action_type=1,notes=['Cleavage, bra, or further visibility remain uncertain for this first visit.'])
event(153,'She felt a little frightened but at the same time she felt a little excited','feel_mixed_response','dhika',state=['frightened','excited'])
event(164,'He said kisses','say_kisses_on_phone','john','dhika',contact='no_contact',notes=['Verbal phone sign-off, not an actual physical kiss.'],context=[161,164])
event(166,'changed into her Pyjamas and T shirt','change_sleepwear','dhika',clothing={'dhika':{'state':'clothed','description':'Pyjamas and T shirt','evidence_global_lines':[166]}})
event(167,'she hit her head','hit_own_head','dhika','dhika',body=[('dhika','head','target')])
event(168,'she hit her head again','hit_own_head_again','dhika','dhika',body=[('dhika','head','target')],notes=['Explicit repeat of previous self-directed gesture.'])
event(170,'She felt a tingle down the spine','feel_spinal_tingle','dhika',body=[('dhika','spine','responding_part')],state=['tingle'],context=[167,168,169,170])
event(170,'Did he see parts of my breast','question_possible_viewing','dhika','chotu',body=[('dhika','breast','hypothetical_viewed_part')],reality='hypothetical',action_type=1,notes=['Question remains unresolved; not actual viewing evidence.'])
event(174,'she wore a casual sleeveless low cut salwar','wear_sleeveless_salwar','dhika',clothing={'dhika':{'state':'clothed','description':'sleeveless low cut salwar','evidence_global_lines':[174]}})
event(204,'feeling little blushed','blush','dhika',state=['blushing'],context=[203,204])
event(210,'she looked herself in the mirror','look_at_self_in_mirror','dhika','dhika',contact='no_contact')
event(212,'she remembered her yesterday\'s bending down','remember_previous_bending','dhika',reality='remembered',action_type=1,notes=['Callback to earlier event; not a newly performed bend.'])
event(212,'she felt very very excited','feel_excited','dhika',state=['excited'])
event(212,'she removed her dupatta slowly','remove_dupatta','dhika',clothing={'dhika':{'state':'clothed','description':'dupatta removed; salwar remains','evidence_global_lines':[174,212]}},intent='deliberate')
event(213,'she could see her own cleavage','see_own_cleavage','dhika','dhika',body=[('dhika','cleavage','viewed_part')],contact='no_contact')
event(213,'bit her lip','bite_own_lip','dhika','dhika',body=[('dhika','lip','target')],state=['excited'],context=[213])
event(214,'she felt a great urge to find if he would see','want_to_test_viewing','dhika','chotu',reality='intended',action_type=1,notes=['Desire to test whether he would look; do not substitute a broad seduction label.'])
event(215,'went to hall without Dupatta','enter_hall_without_dupatta','dhika',clothing={'dhika':{'state':'clothed','description':'salwar remains; no dupatta','evidence_global_lines':[174,212,215]}},context=[214,215])
event(216,'Chotu saw that she did not wear dupatta','notice_absent_dupatta','chotu','dhika',contact='no_contact')
event(218,'she bent down','bend_down','dhika',context=[214,215,217,218])
event(218,'got on all fours','get_on_all_fours','dhika',context=[218])
event(218,'began wiping the floor','wipe_floor','dhika',contact='object_contact',context=[218])
event(219,'He could see only like 1/3rd of her boobs','see_partial_breast_area','chotu','dhika',body=[('dhika','breasts','viewed_part')],contact='no_contact',clothing={'dhika':{'state':'partially_exposed','description':'partial breast area visible through dress opening; salwar remains','evidence_global_lines':[174,213,215,219]}},notes=['Viewing is confirmed for this later scene; no touching or full nudity is stated.'],context=[218,219])
event(221,'she looked in the direction of Chotu','look_toward_chotu','dhika','chotu',contact='no_contact')
event(222,'Their eyes met','make_eye_contact',['dhika','chotu'],['dhika','chotu'],body=[('dhika','eyes','acting_part'),('chotu','eyes','acting_part')],contact='no_contact',notes=['Mutual event; initiator not established by this sentence.'],context=[221,222,223])
EVENTS[-1]['initiated_by']=None
event(223,'She was biting her lips very subtly','bite_own_lips','dhika','dhika',body=[('dhika','lips','target')],state=['excited','nervous'])
event(224,'Chotu stood up and took the money she gave earlier and left','leave_after_viewing','chotu',context=[219,221,222,223,224],notes=['Departure; no intervening physical contact is stated.'])
event(225,'she just flipped and dropped on her back','lie_back_on_floor','dhika',body=[('dhika','back','positioned_part')],state=['excited'])
event(226,'She covered her face','cover_own_face','dhika','dhika',body=[('dhika','face','target')],state=['excited','blushing','shy'])
event(226,'she felt a tingle ...... not down her spine but .... down there in-between her legs','feel_tingle_between_legs','dhika',body=[('dhika','between legs','responding_area_as_stated')],state=['tingle'],notes=['Source gives an area; a specific anatomical organ is not named.'])

(ROOT/'data/female_action_review_e01_checked.json').write_text(json.dumps(EVENTS,ensure_ascii=False,indent=2)+'\n')
print(f'{len(EVENTS)} checked E01 spans; episode completeness not asserted')
