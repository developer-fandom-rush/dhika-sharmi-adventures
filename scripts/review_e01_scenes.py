#!/usr/bin/env python3
"""Curated E01 scene review. This is not a keyword-to-event parser."""
import copy, hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RAW=(ROOT/'raw/Dhika.txt').read_bytes()
LINES=RAW.decode('utf-8').split('\n')
EVENTS=copy.deepcopy(json.loads((ROOT/'data/female_action_review_e01_checked.json').read_text()))

def add(line,quote,action,actor,recipient=None,kind='physical',reality='actual',related=(),state=(),body=(),context=(),notes=(),position=None,contact='unknown',initiator='actor'):
    a=LINES[line-1].index(quote)
    actors=actor if isinstance(actor,list) else ([actor] if actor else [])
    recipients=recipient if isinstance(recipient,list) else ([recipient] if recipient else [])
    e={'event_id':f'E01-CHK-{len(EVENTS)+1:03d}','episode_id':'E01','line_id':f'E01-L{line-2:04d}',
       'record_kind':'checked_event','review_status':'scene_reviewed','female_centres':[],
       'characters_involved':sorted(set(actors+recipients)), 'actor_ids':actors,'recipient_ids':recipients,
       'observer_ids':[],'initiated_by':actors if initiator=='actor' else None,
       'action':action,'action_type':1 if kind=='mental' else (None if kind=='dialogue' else 2),
       'reality_status':reality,'event_state':list(state),'event_domain':kind,
       'related_character_ids':list(related),'intent':'unknown','consent':'not_stated',
       'body_parts_involved':[{'owner_id':owner,'part':part,'role':role} for owner,part,role in body],
       'clothing_state_by_character':{},'contact_layer':contact,'group_event_id':None,
       'simultaneous_group_id':None,'previous_event_by_female':{},
       'source':{'global_line':line,'episode_line':line-2,'start':a,'end':a+len(quote),'quote':quote},
       'context_global_lines':sorted(set(context)),'ambiguity_notes':list(notes)}
    if position:e['position_override']=position
    if kind in ['mental','reaction']:e['initiated_by']=None
    EVENTS.append(e)
    return e

# Morning handover, college arrival, and explicitly narrated habitual states.
add(19,'Holding her sleeping kid in one hand','carry_sleeping_child','dhika','pappu',kind='family',body=[('dhika','hand','acting_part')])
add(19,'the handbag slipping over her other shoulder','handbag_slips_on_shoulder','dhika',kind='physical',body=[('dhika','shoulder','supporting_part')],initiator=None)
add(25,'Give him to me','request_child_handover','uncle','dhika',kind='dialogue',notes=['Request is stated. The actual transfer is not described.'])
add(31,'Dhika vanished down the stairs','leave_downstairs','dhika')
add(32,'Dhika pulled her bike in into the college parking','arrive_by_bike','dhika')
add(32,'She heard a voice behind her','hear_bantu_behind','dhika','bantu',kind='perception',context=[33])
add(33,'Looking very pretty miss','compliment_appearance','bantu','dhika',kind='dialogue')
add(36,'she knew who it was','recognize_bantu_voice','dhika',kind='mental',reality='thought',related=['bantu'],context=[33])
add(36,'She just hoped no one else was around','hope_no_one_overhears','dhika',kind='mental',reality='thought',related=['bantu'],context=[33,35])
add(40,'Turning her head','turn_head_toward_bobby','dhika','bobby',body=[('dhika','head','acting_part')])
add(40,'she waved at Bobby','wave_at_bobby','dhika','bobby',context=[40])
add(40,'struggling, pushing his bike','push_bike','bobby',context=[40])
add(42,'that always intrigued Dhika','feel_intrigued_by_bobby','dhika',kind='mental',reality='historical_habit',related=['bobby'])
add(43,'Dhika liked Bobby a bit more','prefer_bobby','dhika',kind='mental',reality='historical_habit',related=['bobby'])
add(44,'Bantu never failed to compliment his teacher every single day','habitually_compliment','bantu','dhika',kind='dialogue',reality='historical_habit')
add(44,'she felt uncomfortable when he said pretty','initially_feel_uncomfortable','dhika',kind='reaction',reality='historical_actual',related=['bantu'],state=['uncomfortable'])
add(44,'she started to liked it','begin_liking_compliments','dhika',kind='mental',reality='historical_actual',related=['bantu'])
add(44,'Dhika secretly expects it','expect_daily_compliment','dhika',kind='mental',reality='historical_habit',related=['bantu'])
add(45,'The saree looks so good on you, miss','compliment_saree',None,'dhika',kind='dialogue',notes=['Raw speaker label is Dhika, but the utterance addresses miss. Context suggests another speaker; identity is left unresolved, not silently changed to Bantu.'],context=[33,44,45,46,47])
add(46,'Run to the class now','instruct_go_to_class','dhika',['bantu','bobby'],kind='dialogue',notes=['Instruction does not establish that both already departed.'])
add(50,'Dhika was always smiling','habitually_smile','dhika',reality='historical_habit',state=['smiling'])
add(52,"she knew that she turned a lot many heads",'recognize_attention','dhika',kind='mental',reality='historical_habit')
add(52,"Dhika made herself be self-cautious with her manners and her attire",'maintain_cautious_attire_and_manners','dhika',kind='mental',reality='historical_habit')
add(53,'Dhika always wore a full Saree or a Kurti with shawl','habitually_cover_with_saree_or_shawl','dhika',reality='historical_habit')

# Sharmi's greeting includes her own narrated feelings; Raj is backstory only.
add(60,'dressed in sleeveless blouses to the college','habitually_wear_sleeveless_blouse','sharmi',reality='historical_habit')
add(61,'she was always a bit envious of Dhika','feel_envious_of_dhika','sharmi',kind='mental',reality='historical_habit',related=['dhika'],state=['envious'])
add(61,'Raj had complemented the beauty of Dhika','previously_compliment_dhika','raj','dhika',kind='dialogue',reality='historical_actual',notes=['Raj is not present in the current college scene.'])
add(62,'Sharmi constantly teased Dhika','habitually_tease_friend','sharmi','dhika',kind='dialogue',reality='historical_habit')
add(64,'And like you have something bigger than most','tease_sharmi_back','dhika','sharmi',kind='dialogue')
add(65,'Giggling and laughing','laugh_together',['dhika','sharmi'],state=['giggling','laughing'])
add(65,'both entered the college','enter_college_together',['dhika','sharmi'])

# Uncle's physical posture, imagination, garment contact and interruption.
add(67,'Eyes closed','close_eyes','uncle',body=[('uncle','eyes','acting_part')],context=[67])
add(68,'Head swinging','move_head','uncle',body=[('uncle','head','acting_part')],context=[67,68])
add(69,'Wherree are youuu','call_for_uncle','aunty','uncle',kind='dialogue',notes=['Aunty is audible. Her presence inside Dhika’s bathroom is not established.'])
add(71,'grabbing the milk bottle from the fridge','take_milk_bottle','uncle',kind='object')
add(71,'Uncle ran back to his own house','run_back_home','uncle',context=[69,70,71])

# Staff-room gazes, reactions and the ride setup.
add(72,'she saw Bantu and Bobby coming towards her','see_twins_approach','dhika',['bantu','bobby'],kind='perception')
add(72,'Bantu and Bobby coming towards her','approach_teacher',['bantu','bobby'],'dhika')
add(75,'Bobby was as usual silent and looking at them','watch_conversation','bobby',['dhika','bantu'],kind='perception',state=['silent'])
add(77,'you look very beautiful','compliment_appearance','bantu','dhika',kind='dialogue')
add(80,'you are the most beautiful person I have ever seen','compliment_appearance','bantu','dhika',kind='dialogue')
add(81,'Bobby was quite and smiling','smile','bobby',state=['smiling'],related=['dhika'])
add(81,'liked his teacher just like Bantu','like_teacher','bobby',kind='mental',reality='historical_habit',related=['dhika'])
add(82,'Dhika turned to Bobby','turn_toward_bobby','dhika','bobby')
add(82,'Bobby looking down at something from his corner eye','notice_bobby_gaze','dhika','bobby',kind='perception',context=[81,82])
add(82,'She look down to see what it is','look_down_at_own_hip','dhika','dhika',kind='perception',body=[('dhika','hip','viewed_part')])
add(82,"didn't cover it as she didn't want to embarrass Bobby",'leave_hip_uncovered','dhika',related=['bobby'],notes=['Leaving it uncovered is not permission to touch.'])
add(82,'She turned a little pink','blush','dhika',kind='reaction',state=['blushing'],related=['bobby'])
add(83,'can you please take us with you today','request_ride','bantu','dhika',kind='dialogue')
add(85,'petrol over and we didn\'t bring money today','give_false_ride_pretext','bantu','dhika',kind='dialogue',context=[90],notes=['Narrator contradicts the excuse in line 90.'])
add(86,'I will give money for petrol','offer_petrol_money','dhika','bantu',kind='dialogue')
add(89,'please give us lift','repeat_ride_request','bantu','dhika',kind='dialogue')
add(90,'Bantu wanted to ride with Dhika','want_shared_ride','bantu',kind='mental',reality='intended',related=['dhika'])
add(91,'I will take you both','agree_to_give_ride','dhika',['bantu','bobby'],kind='dialogue')
add(92,'She took her bag','take_bag','dhika',kind='object')
add(92,'went to the parking lot','walk_to_parking','dhika')
add(92,'Both the boys followed a little behind her','follow_to_parking',['bantu','bobby'],'dhika')
add(92,'He hit Bobby lightly in his shoulders','lightly_hit_shoulder','bantu','bobby',body=[('bobby','shoulders','target')],context=[92])
add(92,'winked at him','wink_at_bobby','bantu','bobby',body=[('bantu','eye','acting_part')],context=[92])
add(92,'Bobby blushed','blush','bobby',kind='reaction',state=['blushing'],related=['bantu'],context=[92])
add(92,'returned a smile','smile_back','bobby','bantu',state=['smiling'],context=[92])
add(93,'Bobby, give your bag to Bantu and climb in the middle','instruct_seating_and_bag_handover','dhika','bobby',kind='dialogue',notes=['Bag handover is instructed but not explicitly narrated as completed.'])
add(94,'He was secretly smiling','smile','bobby',state=['smiling'],related=['dhika'])
add(94,"didn't have courage to tell that to Bantu",'withhold_seating_desire','bobby',kind='mental',reality='thought',related=['bantu'],context=[94])
add(95,'Bobby run and climb the bike before him','run_and_mount_bike','bobby',context=[93,94,95])
add(95,'Scolding inside','feel_frustrated_about_seating','bantu',kind='mental',reality='thought',related=['bobby','dhika'],state=['frustrated'],context=[95])
add(95,'he too got in the bike','mount_bike','bantu',context=[93,95])
add(95,'they started to leave','depart_on_bike',['dhika','bobby','bantu'])
add(96,'Bantu, hold and sit Bobby','instruct_hold_bobby_for_balance','dhika','bantu',kind='dialogue',notes=['Do not convert this instruction into confirmed Bantu–Bobby contact.'])
add(97,'he said sadly','respond_sadly','bantu',kind='reaction',state=['sad'],related=['dhika','bobby'],context=[93,95,96,97])
add(98,'giggling silently','giggle','bobby',state=['giggling'],related=['dhika'])
add(101,'Dhika thought he is like innocent to hold her around the stomach like a child','interpret_bobby_as_innocent','dhika',kind='mental',reality='thought',related=['bobby'],context=[99,100,101])
add(101,"she didn't want to embarrass him",'avoid_embarrassing_bobby','dhika',kind='mental',reality='intended',related=['bobby'])
add(101,'kept quite and started driving in silence','drive_in_silence','dhika',related=['bobby'],notes=['Silence is not a willingness or consent label.'])
add(102,'she felt a light tapping in her stomach','feel_stomach_tapping','dhika',kind='reaction',related=['bobby'],body=[('dhika','stomach','sensed_part')],context=[99,102])
add(102,'She looked down','look_down_at_bobby_finger','dhika','bobby',kind='perception',context=[102])
add(102,'She also felt due to this','feel_hip_contact','dhika',kind='reaction',related=['bobby'],body=[('dhika','hip','sensed_part')],context=[102])
add(103,'her husband has touch her even in the hips','historical_husband_hip_contact','john','dhika',reality='historical_actual',body=[('dhika','hips','target')],notes=['Marital backstory; John is not on the bike. This does not establish clothing or a new action.'])
add(103,'they got down','dismount_bike',['dhika','bobby','bantu'])
add(104,'with a shy smile','smile_shyly','bobby','dhika',state=['shy','smiling'])
add(105,'he said sadly','respond_sadly','bantu',kind='reaction',state=['sad'],related=['dhika'])
add(106,'why are you sad Bantu','ask_about_bantu_sadness','dhika','bantu',kind='dialogue')
add(108,'Dhika said her byes and left','say_goodbye_and_leave','dhika',['bantu','bobby'])
add(108,'Bantu started cursing Bobby','curse_bobby_over_seating','bantu','bobby',kind='dialogue')
add(108,"didn't want to tell Bantu and make him more sad",'withhold_ride_contact_details','bobby',kind='mental',reality='intended',related=['bantu'],context=[99,102,108])

# Family and domestic actions stay explicitly nonsexual.
add(109,'she saw aunty coming towards her','see_aunty_approach','dhika','aunty',kind='perception')
add(109,'Pappu ran and jumped his mom','run_and_jump_to_mother','pappu','dhika',kind='family')
add(110,'Pappu drank milk only in the morning','report_child_feeding','aunty','dhika',kind='dialogue',reality='reported',related=['pappu'])
add(113,'Dhika smiled politely','smile_politely','dhika','aunty',state=['smiling'])
add(113,'went inside the house with Pappu','enter_home_with_child','dhika','pappu',kind='family')
add(113,'Pappu went to see Rhymes in the TV','watch_rhymes','pappu',kind='family')
add(113,'Dhika thought kids now a days know everything','think_about_child_using_devices','dhika',kind='mental',reality='thought',related=['pappu'])
add(115,'she went to bathroom','enter_bathroom','dhika')
add(116,'She noticed one bra was drying in the sink and one bra was lying on the floor','notice_bras_in_bathroom','dhika',kind='perception')
add(116,'She left it at the side of the tap on the sink','place_bra_beside_tap','dhika',kind='object')
add(116,'thought may be it slipped and fell down slowly','guess_bra_fell_by_itself','dhika',kind='mental',reality='hypothetical',notes=['She does not discover Uncle’s handling. Reader callback is kept separate from character knowledge.'])
add(117,'changed to a lovely kurti','change_into_kurti','dhika')
add(117,'went to kitchen','enter_kitchen','dhika')
add(117,'she remembered that she forgot to buy groceries','remember_missing_groceries','dhika',kind='mental',reality='remembered')
add(117,'dialed to Bindu Maami','phone_grocery_store','dhika','bindu_maami',kind='dialogue')
add(118,'She placed the order to maami','order_groceries','dhika','bindu_maami',kind='dialogue')
add(119,'heard the door bell ring','hear_delivery_bell','dhika',kind='perception',related=['chotu'])
add(119,'saw through the peep whole and saw Chotu standing here','see_chotu_at_door','dhika','chotu',kind='perception')
add(120,'she felt bad for him','feel_sympathy_for_chotu','dhika',kind='mental',reality='historical_habit',related=['chotu'],state=['sympathy'])
add(120,'giving him extra tips for delivery and tea or coffee','habitually_tip_and_offer_drink','dhika','chotu',kind='dialogue',reality='historical_habit')
add(120,'He always brought a chocolate to Pappu','habitually_bring_child_chocolate','chotu','pappu',kind='family',reality='historical_habit')
add(121,'she invited him inside to give him tea','previously_invite_chotu_inside','dhika','chotu',kind='dialogue',reality='historical_actual')
add(121,'Chotu was happy to be in the presence of her','feel_happy_in_dhika_company','chotu',kind='mental',reality='historical_habit',related=['dhika'],state=['happy'])
add(121,'she thought Chotu like her brother','think_of_chotu_as_brother_like','dhika',kind='mental',reality='historical_habit',related=['chotu'],notes=['Figurative perception, not a biological sibling relationship.'])
add(121,'He told her all the problems in his family','previously_confide_family_problems','chotu','dhika',kind='dialogue',reality='historical_habit')
add(121,'she used to give him advice','habitually_advise_chotu','dhika','chotu',kind='dialogue',reality='historical_habit')
add(122,'opened the door','open_door_for_chotu','dhika','chotu')
add(123,'he almost pushed her','almost_push_dhika','chotu','dhika',reality='near_action',notes=['Almost does not establish completed pushing or physical contact.'])
add(123,'placed the heavy bag on the floor','place_delivery_bag_on_floor','chotu',kind='object')
add(123,'started unpacking','unpack_groceries','chotu',kind='object')
add(126,'she giggled like a child','giggle','dhika',state=['giggling'],related=['chotu'])
add(127,'finished unpacking','finish_unpacking','chotu',kind='object')
add(127,'stood up','stand_up','chotu')
add(127,'gave the bill to her','hand_bill_to_dhika','chotu','dhika',kind='object')
add(128,'Looking at the bill','read_bill','dhika',kind='perception')
add(129,'ran outside before she could stop him','run_out_to_fetch_missing_item','chotu',related=['dhika'])
add(130,'She smiled','smile','dhika',state=['smiling'],related=['chotu'])
add(130,'went to arrange the store items in her fridge','arrange_groceries','dhika',kind='object')
add(130,'She felt the dupatta coming in between many a times','feel_dupatta_interfering','dhika',kind='perception')
add(130,'she got childish angry','feel_annoyed_by_dupatta','dhika',kind='reaction',state=['annoyed'])
add(130,'he rolled the cloth around him like a ghost','wrap_dupatta_in_play','pappu',kind='family')
add(130,'laughed at his mom','laugh_in_play','pappu','dhika',kind='family',state=['laughing'])
add(130,'Dhika too laughed with him','laugh_with_child','dhika','pappu',kind='family',state=['laughing'])
add(131,'saw Chotu','see_chotu_return','dhika','chotu',kind='perception')
add(131,"Pappu wouldn't give it",'keep_dupatta_in_play','pappu',kind='family')
add(131,'She tried pulling','try_retrieve_dupatta','dhika','pappu',kind='family',reality='attempt',notes=['Cloth is being pulled; pulling the child down is only a hypothetical risk in the next clause.'])
add(131,'she may pull Pappu down the floor','consider_risk_of_pulling_child_down','dhika',kind='mental',reality='hypothetical',related=['pappu'])
add(132,'Chotu kept ringing the bell','ring_doorbell','chotu','dhika',kind='object')
add(132,'he would get the money and leave from outside','expect_chotu_to_stay_outside','dhika',kind='mental',reality='hypothetical',related=['chotu'])
add(134,'Dhika opened the door','open_door_for_chotu','dhika','chotu')
add(134,'Chotu went inside','enter_home','chotu',related=['dhika'])
add(134,'started playing with him','play_with_child','chotu','pappu',kind='family')
add(135,'she closed the door and turned back','close_door_and_turn','dhika')
add(136,'He gave it to her','hand_noodles_packet','chotu','dhika',kind='object')
add(136,'asked for a cup of water','ask_for_water','chotu','dhika',kind='dialogue')
add(137,'Chotu noticed something little different in her dress','notice_dress_difference','chotu','dhika',kind='perception')
add(137,'Dhika was relieved','feel_relieved','dhika',kind='reaction',related=['chotu'],state=['relieved'],notes=['This is Dhika’s interpretation of his response, not proof that he noticed nothing.'])
add(137,'Chotu did not mind or notice','believe_chotu_did_not_notice','dhika',kind='mental',reality='thought',related=['chotu'],context=[137],notes=['Embedded in Dhika’s relief; the narrator separately says Chotu did notice a difference.'])
add(138,'he followed her','follow_into_kitchen','chotu','dhika',context=[137,138])
add(139,'do you want lemon juice','offer_juice','dhika','chotu',kind='dialogue')
add(140,'Maami will probably be looking for me','think_maami_may_need_him','chotu',kind='mental',reality='hypothetical',related=['bindu_maami'])
add(141,'go sit with Pappu','invite_chotu_to_wait','dhika','chotu',kind='dialogue')
add(142,'Chotu nodded','nod','chotu','dhika',body=[('chotu','head','acting_part')])
add(142,'went to hall','go_to_hall','chotu')
add(142,'wrestling and rolling on the floor','play_wrestling_and_rolling',['chotu','pappu'],kind='family')
add(142,'Dhika made the juice and brought two glasses','prepare_and_bring_juice','dhika',kind='object',related=['chotu'])
add(143,'she said with a giggle','giggle','dhika',state=['giggling'],related=['chotu'])
add(144,"Chotu's laugh vanishing",'stop_laughing','chotu',kind='reaction',state=['laughter_stops'],related=['dhika'],context=[143,144])
add(144,'he taking the glass from her','take_glass','chotu','dhika',kind='object',notes=['Object handover, not evidence of body-to-body touch.'])
add(144,'with a deep thought in his eyes','appear_preoccupied','chotu',kind='reaction',state=['preoccupied_appearance'],related=['dhika'],notes=['The actual content of his thoughts is not supplied.'])
add(144,'She gave it to him','hand_over_glass','dhika','chotu',kind='object')
add(144,'stood up','stand_up','dhika')
add(144,'she realized what happened','realize_absent_dupatta','dhika',kind='mental',reality='thought',related=['chotu'],context=[130,133,143,144,145])
add(146,'She looked at Chotu','look_at_chotu','dhika','chotu',kind='perception')
add(146,'who was still in dream state','appear_dazed','chotu',kind='reaction',state=['dazed_appearance'],related=['dhika'],notes=['Dream state describes his appearance; a literal dream or specific fantasy is not established.'])
add(146,'She realized something was wrong, but couldn\'t be sure','question_chotu_response','dhika',kind='mental',reality='uncertain_perception',related=['chotu'])
add(147,'why do you look stunned','ask_about_stunned_response','dhika','chotu',kind='dialogue')
add(149,'she said a little loud','call_chotu_loudly','dhika','chotu',kind='dialogue')
add(152,'he gulped the juice','gulp_juice','chotu',kind='object',related=['dhika'])
add(152,'left without even getting the money from her','leave_without_payment','chotu',related=['dhika'])
add(154,'Dhika went to clean the glasses','clean_glasses','dhika',kind='object')
add(154,'she realized that Chotu did not take money','notice_uncollected_payment','dhika',kind='mental',reality='thought',related=['chotu'])
add(154,'She immediately called Maami','phone_maami','dhika','bindu_maami',kind='dialogue')
add(157,'He said he wanted to leave soon and I let him go','report_chotu_departure','bindu_maami','dhika',kind='dialogue',reality='reported',related=['chotu'])
add(159,'she felt bad for him','feel_sympathy','dhika',kind='reaction',state=['sympathy'],related=['chotu'],context=[157,159])
add(159,'probably thinking about his poor family situation','guess_chotu_was_thinking_of_family','dhika',kind='mental',reality='hypothetical',related=['chotu'],context=[157,159],notes=['This is Dhika’s attribution; do not encode it as Chotu’s confirmed inner thought.'])
add(159,'She left her thoughts there','set_aside_thoughts','dhika',kind='mental',reality='thought',related=['chotu'])

# John’s remote participation, night recall and next-day domestic context.
add(160,'She thought something must be urgent in office','guess_john_work_urgency','dhika',kind='mental',reality='hypothetical',related=['john'])
add(160,'she got a call from John','receive_john_call','john','dhika',kind='dialogue')
add(161,'I will not be coming home today','inform_overnight_work','john','dhika',kind='dialogue')
add(163,'still tired to play with him like usual','tease_john_on_phone','dhika','john',kind='dialogue',notes=['Source explicitly says childish play, not naughty play.'])
add(165,'one of the things she admires about him','admire_john_work_ethic','dhika',kind='mental',reality='historical_habit',related=['john'])
add(166,'She finished her dinner with Pappu','eat_dinner_with_child','dhika','pappu',kind='family')
add(166,'tucked him in his bed','put_child_to_bed','dhika','pappu',kind='family',notes=['Pappu has his own bed and room, explicitly stated.'])
add(166,'laid on bed','lie_on_bed','dhika')
add(167,'With John missing in bed','notice_john_absence','dhika',kind='mental',reality='thought',related=['john'])
add(167,'She remembered about what she did today.... bending without dupatta','recall_first_glass_scene','dhika',kind='mental',reality='remembered',related=['chotu'],context=[130,143,144,145,166,167])
add(168,'what if he had seen something','question_previous_viewing_again','dhika',kind='mental',reality='hypothetical',related=['chotu'],context=[143,145,166,167,168])
add(169,'What if he saw','continue_questioning_previous_viewing','dhika',kind='mental',reality='hypothetical',related=['chotu'],context=[167,168,169])
add(170,'not out of fear but out of excitement','feel_excited_by_possibility','dhika',kind='reaction',state=['excited'],related=['chotu'],context=[166,167,170])
add(170,'an unconscious smile appearing on her lips','smile_unconsciously','dhika',kind='reaction',state=['smiling'],related=['chotu'],body=[('dhika','lips','responding_part')])
add(170,'pushed the thoughts out of her mind','dismiss_viewing_thoughts','dhika',kind='mental',reality='thought',related=['chotu'])
add(170,'went to sleep','go_to_sleep','dhika')
add(172,'She woke up the next morning','wake_up','dhika')
add(172,'went to check on Pappu','check_sleeping_child','dhika','pappu',kind='family')
add(172,'called him but he did not pick the call','call_john_without_answer','dhika','john',kind='dialogue')
add(172,'probably he is taking rest in office','guess_john_resting','dhika',kind='mental',reality='hypothetical',related=['john'])
add(172,'prepare breakfast','prepare_breakfast','dhika',kind='object')
add(173,'John called her','phone_dhika','john','dhika',kind='dialogue')
add(173,'she was feeding Pappu','feed_child','dhika','pappu',kind='family')
add(173,'She teased him playfully','tease_john_about_bathing','dhika','john',kind='dialogue')
add(174,'She bathed him','bathe_child','dhika','pappu',kind='family')
add(174,'she also bathed','bathe_self','dhika',kind='domestic')
add(174,'she played sometime with Pappu','play_with_child','dhika','pappu',kind='family')
add(174,'they watched TV for a while','watch_tv_with_child',['dhika','pappu'],kind='family')
add(174,'she put Pappu to sleep','put_child_to_sleep','dhika','pappu',kind='family')
add(174,'she remembered something','remember_unpaid_groceries','dhika',kind='mental',reality='remembered',related=['chotu','bindu_maami'],context=[154,158,174])
add(174,"She didn't want to change her dress and go out",'prefer_not_to_change_and_go_out','dhika',kind='mental',reality='intended')
add(174,'called Maami and asked to send Chotu','request_chotu_visit','dhika','bindu_maami',kind='dialogue',related=['chotu'])
add(175,'She decided to wear a good dupatta','intend_to_wear_dupatta','dhika',kind='mental',reality='intended',related=['chotu'],notes=['The plan alone does not prove wearing it. Its later removal at 212 retrospectively confirms it was worn before that removal.'])
add(175,'feeling bored','feel_bored','dhika',kind='reaction',state=['bored'])
add(175,'she decided to talk a while with Chotu and give him something to eat','intend_company_and_meal','dhika',kind='mental',reality='intended',related=['chotu'])

# Lunch, kitchen conversation, current reactions and recalled compliments.
add(176,'ringing the bell and shouting joyfully','ring_and_call_at_door','chotu','dhika',kind='dialogue',state=['joyful'])
add(177,'opening the door','open_door_for_chotu','dhika','chotu')
add(178,'Scratching his head','scratch_own_head','chotu','chotu',body=[('chotu','head','target')])
add(178,'I suddenly remembered a work mom gave and had to run..he lied','give_false_departure_explanation','chotu','dhika',kind='dialogue',notes=['Narrator labels this explanation a lie. It is not a verified memory of that work.'])
add(180,'Chotu came in','enter_home','chotu',related=['dhika'])
add(180,'feeling hurry to get the money and leave','want_to_collect_money_and_leave','chotu',kind='mental',reality='intended',related=['dhika'])
add(183,'She has never given food to him, she thought','reflect_on_not_having_served_meal','dhika',kind='mental',reality='thought',related=['chotu'])
add(184,'would you like to eat with me today','invite_chotu_to_lunch','dhika','chotu',kind='dialogue')
add(185,'feeling surprised','feel_surprised','chotu',kind='reaction',state=['surprised'],related=['dhika'])
add(187,'Chotu decided to eat','agree_to_lunch','chotu',kind='mental',reality='intended',related=['dhika'])
add(187,'He helped her to take plates and food','help_carry_meal','chotu','dhika',kind='object')
add(187,'He refused to sit in the dining table','decline_table_seating','chotu','dhika',kind='dialogue')
add(187,'she decided to sit with him on the floor','choose_floor_seating','dhika',kind='mental',reality='intended',related=['chotu'])
add(189,'I want to sit and eat with you','express_desire_for_shared_meal','dhika','chotu',kind='dialogue')
add(190,'he felt moved','feel_moved','chotu',kind='reaction',state=['moved'],related=['dhika'],context=[184,187,189,190])
add(191,'both began eating','eat_lunch_together',['dhika','chotu'],related=['dhika','chotu'],context=[187,189,191],notes=['Floor seating is supported by the preceding seating exchange and shared meal; exact physical seating transition is not separately narrated.'])
add(192,'your food is really tasty','praise_cooking','chotu','dhika',kind='dialogue')
add(195,'he helped her to carry everything to kitchen and to the sink','carry_dishes_to_kitchen','chotu','dhika',kind='object')
add(196,'While standing behind her in the kitchen','stand_behind_dhika','chotu','dhika',position={'chotu':{'description':'standing behind Dhika in kitchen','evidence_global_lines':[196]}},context=[195,196])
add(196,'he noticed now that she is wearing a dress with no sleeves','notice_sleeveless_dress','chotu','dhika',kind='perception')
add(198,'feeling little shy','feel_shy_about_noticed_clothing','dhika',kind='reaction',state=['shy'],related=['chotu'],context=[196,197,198])
add(199,'you look beautiful in it','compliment_dhika_appearance','chotu','dhika',kind='dialogue')
add(200,'it is the first time Chotu has said her beautiful','recognize_first_chotu_compliment','dhika',kind='mental',reality='thought',related=['chotu'],context=[199,200])
add(201,'She remembered Bantu calling her pretty everyday','recall_bantu_compliments','dhika',kind='mental',reality='remembered',related=['bantu'],context=[33,44,199,200,201])
add(201,'she liked when someone complimented her','like_being_complimented','dhika',kind='mental',reality='thought',related=['bantu','chotu'])
add(203,'besides I can see it now','see_uncovered_arms','chotu','dhika',kind='perception',body=[('dhika','arms / hands as worded','viewed_part')],context=[196,202,203])
add(204,'I know you very well and trust you','express_trust','dhika','chotu',kind='dialogue')
add(206,'she giggled','giggle','dhika',state=['giggling'],related=['chotu'])
add(207,'He felt a little crush on her','feel_crush_on_dhika','chotu',kind='mental',reality='thought',state=['crush'],related=['dhika'])
add(207,'he saw her as a beautiful woman','newly_regard_dhika_as_beautiful','chotu',kind='mental',reality='thought',related=['dhika'])
add(208,'She asked him to wash his hands and wait in hall','instruct_wash_and_wait','dhika','chotu',kind='dialogue')
add(208,'He followed her instructions','follow_wash_and_wait_instruction','chotu',related=['dhika'],context=[208],notes=['Following the instruction is stated; hand washing is supported by that narration, not by a separately described washing movement.'])
add(208,'leaned on sofa','lean_on_sofa','chotu')
add(208,'sat down','sit_on_sofa','chotu')
add(209,'Dhika saw some food spilled','notice_spilled_food','dhika',kind='perception')
add(209,'decided to clean it','intend_to_clean_floor','dhika',kind='mental',reality='intended')
add(209,'went inside her bedroom to fetch cloth from bathroom','go_fetch_cleaning_cloth','dhika')

# Mirror thoughts and floor-cleaning encounter: no physical recipient for thoughts.
add(211,'am I really still beautiful after having one kid','question_own_appearance','dhika',kind='mental',reality='thought',related=['chotu'],context=[199,200,210,211])
add(212,'looked at herself in mirror','look_at_self_in_mirror','dhika','dhika',kind='perception')
add(213,'She looked at her own body','look_at_own_body','dhika','dhika',kind='perception')
add(213,'She felt unknown excitement','feel_excited','dhika',kind='reaction',state=['excited'],related=['chotu'],context=[211,212,213,214])
add(213,'smiler herself blushingly','smile_and_blush','dhika',kind='reaction',state=['smiling','blushing'],related=['chotu'],context=[211,213])
add(214,"She wasn't sure if Chotu saw inside her dress yesterday",'recall_uncertain_previous_viewing','dhika',kind='mental',reality='remembered',related=['chotu'],context=[143,145,153,214],notes=['Recalls an unresolved possibility, not confirmed past viewing.'])
add(215,'she just took a waste cloth','take_cleaning_cloth','dhika',kind='object')
add(216,'he simply thought she missed and kept it in bedroom or bathroom','guess_dupatta_was_left_elsewhere','chotu',kind='mental',reality='hypothetical',related=['dhika'])
add(217,'Dhika felt very nervous and excited','feel_nervous_and_excited','dhika',kind='reaction',state=['nervous','excited'],related=['chotu'])
add(217,'she was going to be openly showing her cleavage','anticipate_exposure','dhika',kind='mental',reality='intended',related=['chotu'],body=[('dhika','cleavage','intended_viewed_part')],notes=['Intention at this point; the subsequent viewing is recorded separately.'])
add(219,'Chotu was shocked and wide eyed','react_wide_eyed','chotu',kind='reaction',state=['shocked','wide_eyed'],related=['dhika'],context=[218,219])
add(219,'He was so stunned and lost in the sight','feel_stunned_by_view','chotu',kind='reaction',state=['stunned'],related=['dhika'])
add(220,'Dhika was very very nervous','feel_nervous_while_cleaning','dhika',kind='reaction',state=['nervous'],related=['chotu'])
add(220,"didn't dare to look up and at Chotu",'avoid_looking_up','dhika',kind='mental',reality='intended',related=['chotu'])
add(220,'She kept wiping the floor for next 1 minute','continue_wiping_floor','dhika',contact='object_contact',notes=['Continuation of the same cleaning action, not another encounter.'])
add(220,'Chotu was still wide eyed','continue_wide_eyed_response','chotu',kind='reaction',state=['wide_eyed'],related=['dhika'])
add(221,'Dhika mustered all the courage she could','gather_courage_to_look','dhika',kind='mental',reality='thought',related=['chotu'])
add(223,'Dhika with excitement and nervousness in eyes','show_mixed_response','dhika',kind='reaction',state=['excited','nervous'],related=['chotu'],body=[('dhika','eyes','expressive_part')])
add(224,'Chotu stood up','stand_up','chotu',related=['dhika'])
add(224,'took the money she gave earlier','take_payment','chotu',kind='object',related=['dhika'],notes=['Earlier handing over money is reported retrospectively here; its exact line/time is not narrated.'])
add(225,'Dhika could not believe what she just did','reflect_on_own_action','dhika',kind='mental',reality='thought',related=['chotu'],context=[215,218,219,222,225])
add(225,'still feeling very excited','continue_feeling_excited','dhika',kind='reaction',state=['excited'],related=['chotu'])
add(225,'she dropped the cloth on the floor','drop_cleaning_cloth','dhika',kind='object')

# Scene boundaries follow setting, time and participant transitions. The ranges
# collectively cover every E01 segment, including profiles and source metadata.
SPECS=[
 (3,17,'Profile and source metadata','not a current scene','background',[],[],[9,10,13,14,16]),
 (18,31,'Morning neighbour handover','apartment / next-door entrance','Friday before college',['dhika','uncle','pappu'],[],[18,19,25,31]),
 (32,53,'College parking greeting','college parking','Friday morning, five past 8:30 as written',['dhika','bantu','bobby'],[],[32,33,38,40,48]),
 (54,65,'Sharmi joins her friend','college approach','same morning',['dhika','sharmi'],[],[54,56,57,65]),
 (66,71,'Uncle alone with the garment','Dhika’s bathroom / home','same-day cutaway; exact clock time not stated',['uncle'],['aunty'],[66,67,69,71]),
 (72,91,'Staff-room conversation','college staff room','Friday 4 PM',['dhika','bantu','bobby'],[],[72,81,90,91]),
 (92,95,'Walk to parking and seating','college parking / bike','Friday after staff-room visit',['dhika','bantu','bobby'],[],[92,93,94,95]),
 (96,108,'Three-person bike ride','bike, then drop-off','Friday afternoon',['dhika','bobby','bantu'],[],[93,95,96,99,101,103,108]),
 (109,114,'Return home with child','apartment entrance / home','Friday about 5 PM',['dhika','aunty','pappu'],[],[109,113,114]),
 (115,118,'Bathroom discovery and change','bathroom, then kitchen','Friday evening',['dhika'],[],[115,116,117,118]),
 (119,129,'First grocery delivery','Dhika’s home entrance','Friday, 20 minutes after order',['dhika','chotu'],[],[119,122,123,127,129]),
 (130,133,'Du­patta play and returning bell','home / sofa / doorway','Friday, about 10 minutes later',['dhika','pappu'],['chotu'],[130,131,132,133]),
 (134,154,'Returned delivery and juice','home: hall and kitchen','Friday evening',['dhika','chotu','pappu'],[],[134,137,138,142,143,144,145,152,154]),
 (155,159,'Call to the store and reinterpretation','Dhika at home; Maami remote','Friday evening',['dhika'],['bindu_maami'],[154,155,157,159]),
 (160,165,'John’s overnight-work call','Dhika at home; John at work','Friday 8 PM',['dhika'],['john'],[160,161,164,165]),
 (166,171,'Night in bed: recall and questioning','Dhika’s bedroom / bed','Friday night',['dhika'],[],[166,167,168,170]),
 (172,175,'Next-day family routine and visit plan','home; bathroom; phone','next morning, then afternoon; line 173 says 10 PM',['dhika','pappu'],['john','bindu_maami'],[172,173,174,175]),
 (176,194,'Chotu’s lunch visit','home / shared meal on floor','next-day lunch break',['dhika','chotu'],[],[176,182,187,189,191]),
 (195,207,'Kitchen conversation and compliments','kitchen / sink','after lunch',['dhika','chotu'],[],[195,196,199,201,203,207]),
 (208,209,'Separate rooms before cleaning','hall; bedroom / bathroom transition','about 30 minutes into visit',['dhika','chotu'],[],[208,209]),
 (210,214,'Mirror, recall and intention','bathroom mirror; Chotu remains in hall','same next-day visit',['dhika'],[],[208,209,210,212,214]),
 (215,226,'Floor cleaning, gaze and aftermath','hall / floor / sofa','same visit; one-minute interval narrated',['dhika','chotu'],[],[215,216,218,219,220,222,224,225,226]),
 (227,230,'Trailing source separators','not a current scene','metadata',[],[],[227,230]),
]

def evidence(line,phrase=None):
    t=LINES[line-1]
    return {'global_line':line,'quote':t if phrase is None else phrase}

def cloth_state(description,refs,state='clothed',basis='scene_continuity'):
    return {'state':state,'description':description,'evidence_global_lines':refs,'basis':basis}

SAREE=cloth_state('Pink cotton saree; same-day outfit established retrospectively by line 48',[48],'clothed','same_day_confirmation')
KURTI=cloth_state('Kurti; its deep cut is clarified later at 133; no removal of the dress is stated',[117,133])
SHAWL=cloth_state('Kurti with shawl / dupatta covering added; the same kurti’s deep cut is clarified at 133',[117,122,133])
NO_SHAWL=cloth_state('Deep-cut kurti remains; shawl / dupatta removed',[117,130,133,145])
SLEEP=cloth_state('Pyjamas and T shirt',[166],'clothed','explicit')
SALWAR=cloth_state('Casual sleeveless low-cut salwar',[174],'clothed','explicit')
SALWAR_SHAWL=cloth_state('Sleeveless low-cut salwar. Dupatta is planned at 175 and confirmed worn immediately before its removal at 212; the exact earlier wearing time is not narrated',[174,175,212],'clothed','retrospective_confirmation_with_uncertain_start')
SALWAR_NO_SHAWL=cloth_state('Black sleeveless deep-cut dress / salwar; dupatta removed',[174,212,213,215])

def clothing_for(e):
    n=e['source']['global_line'];a=e['source']['start']
    # Do not treat a absent / imagined person as physically present. Clothing
    # on historical events cannot be taken from the current scene.
    if e['reality_status'] in ['historical_actual','historical_habit','reported']:return {}
    if 18<=n<=108 and not 66<=n<=71:d=copy.deepcopy(SAREE)
    elif 109<=n<=116:d=copy.deepcopy(SAREE)
    elif 117<=n<=121:d=copy.deepcopy(KURTI)
    elif n==122 or 123<=n<=129:d=copy.deepcopy(SHAWL)
    elif n==130:
        cut=LINES[129].index('grabbed the dupatta')
        d=copy.deepcopy(NO_SHAWL if a>=cut else SHAWL)
    elif 131<=n<=165:d=copy.deepcopy(NO_SHAWL)
    elif n==166:
        cut=LINES[165].index('changed into')
        d=copy.deepcopy(SLEEP if a>=cut else NO_SHAWL)
    elif 167<=n<=170:d=copy.deepcopy(SLEEP)
    elif 172<=n<=173:return {}
    elif n==174:
        cut=LINES[173].index('she wore a casual')
        if a<cut:return {}
        d=copy.deepcopy(SALWAR)
    elif n==175:d=cloth_state('Sleeveless low-cut salwar; wearing a dupatta is a plan at this point, not a completed wearing event',[174,175],'clothed','explicit_plan')
    elif 176<=n<=211:d=copy.deepcopy(SALWAR_SHAWL)
    elif n==212:
        cut=LINES[211].index('she removed her dupatta')
        d=copy.deepcopy(SALWAR_NO_SHAWL if a>=cut else SALWAR_SHAWL)
    elif 213<=n<=226:d=copy.deepcopy(SALWAR_NO_SHAWL)
    else:return {}
    if n in [81,82,99,100,101,102,103]:
        d['description']+='; exposed hip area explicitly described at 81 / 102'
        d['evidence_global_lines']=sorted(set(d['evidence_global_lines']+[81,102]));d['state']='partially_exposed'
    if 218<=n<=226 and a>=0:
        d['description']+='; partial chest area is visible during the bend at 219, not full nudity'
        d['evidence_global_lines']=sorted(set(d['evidence_global_lines']+[218,219]));d['state']='partially_exposed'
    return {'dhika':d}

def positions(e,scene):
    n=e['source']['global_line'];a=e['source']['start'];out={}
    if e['reality_status'] in ['historical_actual','historical_habit','reported']:return {}
    for actor in e['actor_ids']:
        if actor in scene['present_character_ids']:out[actor]={'description':'Posture not stated','evidence_global_lines':[],'certainty':'unknown'}
        elif actor in scene['remote_or_audible_character_ids']:out[actor]={'description':'Remote / audible; not in the same room','evidence_global_lines':scene['setting_evidence_global_lines'],'certainty':'context_supported'}
    def put(cid,desc,refs):out[cid]={'description':desc,'evidence_global_lines':refs,'certainty':'source_or_context_supported'}
    if 67<=n<=68:put('uncle','Posture not stated; eyes closed while handling the garment'+('; head moving' if n==68 else ''),[67,68] if n==68 else [67])
    if 96<=n<=102:
        for cid in ['dhika','bobby','bantu']:
            if cid in e['actor_ids'] or cid in e['recipient_ids']:
                put(cid,{'dhika':'On the bike, driving','bobby':'Seated immediately behind Dhika, in the middle','bantu':'On the rear of the bike'}[cid],[93,95,101])
    if 142<=n<=151:
        put('chotu','On the floor during the juice scene',[142,143])
        if n==143:put('dhika','Bending down to hand over the glass',[143])
        elif n==144 and a<LINES[143].index('stood up'):put('dhika','Bent down during glass handover',[143,144])
        elif n>=144:put('dhika','Standing after handing over the glass',[144])
    if 166<=n<=170:
        cut=LINES[165].index('laid on bed')
        if n>166 or a>=cut:put('dhika','Lying in her own bed in the bedroom',[166])
    if 187<=n<=194:put('dhika','Shared meal on the floor, supported by seating exchange',[187,189,191]);put('chotu','Shared meal on the floor, supported by seating exchange',[187,189,191])
    if 196<=n<=207:put('chotu','Standing behind Dhika in the kitchen',[196])
    if 210<=n<=214:
        put('dhika','In the bathroom at the mirror; standing versus sitting is not explicitly stated',[209,210])
    if 215<=n<=224:
        cut=LINES[223].index('Chotu stood up')
        put('chotu','Standing to leave' if n==224 and a>=cut else 'Seated opposite Dhika in the hall',[208,216,224] if n==224 else [208,216])
        if n>=218:
            if n==218 and a<LINES[217].index('got on all fours'):put('dhika','Bending down',[218])
            else:put('dhika','On all fours, cleaning the floor',[218,220])
    if n==225:
        cut=LINES[224].index('she just flipped')
        put('dhika','Lying on her back on the floor' if a>=cut else 'On all fours on the floor',[218,225])
    if n==226:put('dhika','Lying on her back on the floor',[225,226])
    out.update(e.pop('position_override',{}))
    return out

def main():
    # Repair earlier annotations instead of making a second parallel canon.
    for e in EVENTS[:59]:
        e['related_character_ids']=[]
        e['event_domain']='mental' if e['action_type']==1 else ('reaction' if e['action'].startswith('feel_') or e['action'] in ['blush','groan'] else 'physical')
        if e['action'] in ['say_kisses_on_phone','permit_holding_for_balance']:e['event_domain']='dialogue'
        if e['action'].startswith(('see_','look_','gaze_','notice_')):e['event_domain']='perception'
        if e['contact_layer']=='garment_object':e['event_domain']='object'
        if e['event_domain']=='mental':
            e['related_character_ids']=list(e['recipient_ids']);e['recipient_ids']=[]
        if e['event_id']=='E01-CHK-008':
            e['mental_subject_id']='uncle';e['related_character_ids']=['dhika'];e['recipient_ids']=[]
        if e['event_id']=='E01-CHK-014':
            q='She felt embarrassed';a=LINES[81].index(q);e['source'].update(start=a,end=a+len(q),quote=q);e['action']='feel_embarrassed'
        if e['event_domain']=='reaction':
            e['initiated_by']=None
            if e['source']['global_line'] in [35,79]:e['related_character_ids']=['bantu']
            elif e['source']['global_line'] in [82,103]:e['related_character_ids']=['bobby']
            elif e['source']['global_line'] in [153,170,204,212,226]:e['related_character_ids']=['chotu']
        if e['source']['global_line'] in [167,168,170,213,223,225,226] and not e['related_character_ids']:e['related_character_ids']=['chotu']
        if e['action']=='remember_previous_bending':e['related_character_ids']=['chotu']
        if e['action']=='leave_after_viewing':e['related_character_ids']=['dhika']
    EVENTS.sort(key=lambda e:(e['source']['global_line'],e['source']['start'],e['event_id']))
    scenes=[]
    for i,(start,end,title,location,time,present,remote,refs) in enumerate(SPECS):
        scene={'scene_id':f'E01-S{i:02d}','global_line_start':start,'global_line_end':end,'title':title,
               'location':location,'time':time,'present_character_ids':present,'remote_or_audible_character_ids':remote,
               'setting_evidence_global_lines':refs,'event_ids':[],'boundary_basis':'setting / participant / time transition or metadata'}
        if start==172:scene['ambiguity_notes']=['Next-morning context conflicts with the literal 10 PM at line 173. Preserve both; do not silently change it to 10 AM.']
        scenes.append(scene)
    by_id={e['event_id']:e for e in EVENTS}
    previous_female={};previous_person={};scene_previous={}
    mental_refs={167:[143,145,153],168:[143,145],169:[143,145],170:[143,145,153],201:[33,44],212:[143,145,167,170],214:[143,145,153]}
    for order,e in enumerate(EVENTS,1):
        n=e['source']['global_line'];scene=next(s for s in scenes if s['global_line_start']<=n<=s['global_line_end'])
        scene['event_ids'].append(e['event_id']);e['scene_id']=scene['scene_id'];e['sequence_in_episode']=order;e['review_status']='scene_reviewed'
        e['mental_subject_id']=e.get('mental_subject_id') or (e['actor_ids'][0] if e['event_domain']=='mental' and len(e['actor_ids'])==1 else None)
        e['characters_involved']=sorted(set(e['actor_ids']+e['recipient_ids']+([e['mental_subject_id']] if e['mental_subject_id'] else [])))
        e['scene_context']={'location':scene['location'],'time':scene['time'],'present_character_ids':scene['present_character_ids'],
                            'remote_or_audible_character_ids':scene['remote_or_audible_character_ids'],'evidence_global_lines':scene['setting_evidence_global_lines'],
                            'context_applies_to':'narrative_frame_only' if e['reality_status'] in ['historical_actual','historical_habit','reported'] else 'current_event'}
        e['body_position_by_character']=positions(e,scene)
        e['clothing_state_by_character']=clothing_for(e)
        if scene['scene_id']=='E01-S03':e['clothing_state_by_character']['sharmi']=cloth_state('Sleeveless blouses are described as habitual college attire; exact current outfit is not explicitly confirmed',[60],'unknown','habitual_description')
        if e['event_domain']=='mental':
            e['current_mental_event']=True
            e['represented_action_status']=e['reality_status']
        for cid in scene['present_character_ids']:
            if cid not in e['clothing_state_by_character']:e['clothing_state_by_character'][cid]=cloth_state('Not stated for this character',[],'unknown','unknown')
        # Context references support each field, including later clarification.
        refs=set(e['context_global_lines'])|set(scene['setting_evidence_global_lines'])|{n}
        for v in e['clothing_state_by_character'].values():refs.update(v['evidence_global_lines'])
        for v in e['body_position_by_character'].values():refs.update(v['evidence_global_lines'])
        e['context_global_lines']=sorted(refs)
        e['female_centres']=sorted(set(e['characters_involved']+e['related_character_ids'])&{'dhika','sharmi','aunty','bindu_maami'})
        if not e['female_centres'] and 'dhika' in scene['present_character_ids']:e['female_centres']=['dhika']
        e['previous_event_by_female']={cid:previous_female.get(cid) for cid in e['female_centres']}
        for cid in e['female_centres']:previous_female[cid]=e['event_id']
        e['previous_event_by_character']={cid:previous_person.get(cid) for cid in e['characters_involved']}
        for cid in e['characters_involved']:previous_person[cid]=e['event_id']
        e['previous_event_in_scene']=scene_previous.get(scene['scene_id']);scene_previous[scene['scene_id']]=e['event_id']
        if len(scene['present_character_ids'])>=3:e['group_event_id']=scene['scene_id']+'-GROUP'
        e['trigger_event_ids']=[];e['recall_of_event_ids']=[];e['reaction_to_event_ids']=[]
        if e['event_domain']=='mental' and e['reality_status']=='remembered' and n in mental_refs:
            e['recall_of_event_ids']=[p['event_id'] for p in EVENTS if p['source']['global_line'] in mental_refs[n] and p['sequence_in_episode']<order and p['event_domain']!='reaction']
        # Sequence is not causation: trigger/response links are curated below,
        # never assigned to whichever action happens to be nearest.
        if e['action']=='continue_wiping_floor':e['continuation_of_event_id']='E01-CHK-051'
        if e['action']=='continue_wide_eyed_response':e['continuation_of_event_id']=next(p['event_id'] for p in EVENTS if p['action']=='react_wide_eyed')
        if e['action']=='guess_bra_fell_by_itself':e['reader_callback_event_ids']=['E01-CHK-011'];e['character_knows_callback']=False
        e['scope']='family_domestic' if e['event_domain']=='family' or 'pappu' in e['characters_involved'] else 'adult_character_or_self'
    # Explicit cross-scene reaction associations (not mechanically guessed).
    def ids_at(line,actions=None):return [e['event_id'] for e in EVENTS if e['source']['global_line']==line and (actions is None or e['action'] in actions)]
    for e in EVENTS:
        n=e['source']['global_line'];action=e['action']
        if e['event_domain']=='reaction':
            associations={
                (35,'blush'):[(33,['compliment_appearance'])],
                (44,'initially_feel_uncomfortable'):[(44,['habitually_compliment'])],
                (68,'groan'):[(67,['handle_dhika_bra','imagine_dhika_body'])],
                (79,'blush'):[(77,['compliment_appearance'])],
                (82,'feel_embarrassed'):[(81,['see_exposed_hip']),(82,['notice_bobby_gaze'])],
                (82,'blush'):[(82,['notice_bobby_gaze'])],
                (92,'blush'):[(92,['lightly_hit_shoulder','wink_at_bobby'])],
                (97,'respond_sadly'):[(95,['run_and_mount_bike'])],
                (102,'feel_stomach_tapping'):[(102,['tap_stomach'])],
                (102,'feel_hip_contact'):[(102,['rub_bare_hip'])],
                (105,'respond_sadly'):[(95,['run_and_mount_bike'])],
                (130,'feel_annoyed_by_dupatta'):[(130,['feel_dupatta_interfering'])],
                (137,'feel_relieved'):[(137,['believe_chotu_did_not_notice'])],
                (144,'stop_laughing'):[(143,['bend_to_hand_glass'])],
                (144,'appear_preoccupied'):[(143,['bend_to_hand_glass'])],
                (146,'appear_dazed'):[(143,['bend_to_hand_glass'])],
                (159,'feel_sympathy'):[(157,['report_chotu_departure'])],
                (170,'feel_excited_by_possibility'):[(167,['recall_first_glass_scene']),(169,['continue_questioning_previous_viewing'])],
                (170,'feel_spinal_tingle'):[(169,['continue_questioning_previous_viewing'])],
                (170,'smile_unconsciously'):[(170,['question_possible_viewing'])],
                (185,'feel_surprised'):[(184,['invite_chotu_to_lunch'])],
                (190,'feel_moved'):[(187,['choose_floor_seating']),(189,['express_desire_for_shared_meal'])],
                (198,'feel_shy_about_noticed_clothing'):[(196,['notice_sleeveless_dress'])],
                (204,'blush'):[(203,['see_uncovered_arms'])],
                (212,'feel_excited'):[(212,['remember_previous_bending'])],
                (213,'feel_excited'):[(213,['see_own_cleavage'])],
                (213,'smile_and_blush'):[(213,['see_own_cleavage'])],
                (217,'feel_nervous_and_excited'):[(214,['want_to_test_viewing']),(215,['enter_hall_without_dupatta'])],
                (219,'feel_stunned_by_view'):[(219,['see_partial_breast_area'])],
                (220,'continue_wide_eyed_response'):[(219,['see_partial_breast_area','react_wide_eyed'])],
                (223,'show_mixed_response'):[(222,['make_eye_contact'])],
                (225,'continue_feeling_excited'):[(225,['reflect_on_own_action'])],
                (226,'feel_tingle_between_legs'):[(225,['reflect_on_own_action','lie_back_on_floor'])],
            }
            e['reaction_to_event_ids']=[ref for line,acts in associations.get((n,action),[]) for ref in ids_at(line,acts)]
            e['response_link_basis']='source-linked context, not a claim of sole causation'
        if e['action']=='feel_chill':e['reaction_to_event_ids']=ids_at(102,['tap_stomach','rub_bare_hip'])
        if e['action']=='feel_mixed_response':e['reaction_to_event_ids']=ids_at(143,['bend_to_hand_glass'])+ids_at(144,['stop_laughing','appear_preoccupied'])
        if e['action'] in ['feel_sympathy','guess_chotu_was_thinking_of_family']:e['trigger_event_ids']=ids_at(157,['report_chotu_departure'])
        if e['action']=='feel_excited' and e['source']['global_line']==212:e['trigger_event_ids']=['E01-CHK-041']
        if e['action']=='realize_absent_dupatta':e['trigger_event_ids']=ids_at(143,['bend_to_hand_glass'])
        if e['action']=='recognize_first_chotu_compliment':e['trigger_event_ids']=ids_at(199,['compliment_dhika_appearance'])
        if e['action']=='feel_nervous_while_cleaning':e['reaction_to_event_ids']=ids_at(218,['bend_down','get_on_all_fours','wipe_floor'])
        if e['action']=='react_wide_eyed':e['reaction_to_event_ids']=ids_at(218,['bend_down'])+ids_at(219,['see_partial_breast_area'])
        if (e['event_domain']=='mental' and 'chotu' in e['related_character_ids'] and 167<=n<=170) or (e['event_domain']=='mental' and n in [212,214] and action in ['remember_previous_bending','recall_uncertain_previous_viewing','want_to_test_viewing']):
            e['about_prior_event_ids']=ids_at(143,['bend_to_hand_glass'])+ids_at(145,['question_possible_viewing'])
            e['referenced_scene_context']={'scene_id':'E01-S12','location':'hall / juice handover','time':'previous Friday evening',
                'clothing_state_by_character':{'dhika':copy.deepcopy(NO_SHAWL)},'body_position_by_character':{'dhika':{'description':'bending to give glass','evidence_global_lines':[143]}},
                'evidence_global_lines':[117,130,133,143,144,145,153],
                'viewing_status':'uncertain, as described in 145 and 153'}
        if e['action']=='recall_bantu_compliments':e['about_prior_event_ids']=ids_at(33,['compliment_appearance'])+ids_at(44,['habitually_compliment'])
        if e['action'] in ['take_glass','hand_over_glass'] and n==144:e['joint_event_id']='E01-JOINT-GLASS-HANDOVER';e['counting_note']='Two actor perspectives on the same handover, not two separate handovers.'
        if e['action'] in ['groan','sniff_dhika_bra'] and n==68:e['simultaneous_group_id']='E01-S04-GROAN-SNIFF'
        if e['action']=='look_at_dhika' and n==92:e['observer_ids']=['bantu'];e['context_global_lines']=sorted(set(e['context_global_lines']+[92]))
        if e['action'] in ['put_hands_around_hip','hold_stomach','tap_stomach','rub_bare_hip']:
            e['knowledge_context']={'bantu':{'description':'Bobby does not tell Bantu what he did; do not assume Bantu observed the contact','evidence_global_lines':[108]}}
            e['context_global_lines']=sorted(set(e['context_global_lines']+[108]))
    # Link supported reaction/context states to the triggering action cards.
    for e in EVENTS:e['linked_response_event_ids']=[]
    for e in EVENTS:
        for ref in e['reaction_to_event_ids']:
            by_id[ref]['linked_response_event_ids'].append(e['event_id'])
    # Every line receives a reviewed disposition, not a default pending flag.
    profiles=set([9,10,11,12,13,14,20,21,22,37,41,42,43,44,48,49,50,51,52,53,57,58,59,60,61,62,90,120,121,133,162,165,171])
    lines=[]
    for n in range(3,231):
        scene=next(s for s in scenes if s['global_line_start']<=n<=s['global_line_end'])
        es=[e['event_id'] for e in EVENTS if e['source']['global_line']==n]
        t=LINES[n-1]
        meta=not t.strip('\u200b ').strip() or t.startswith(('EPISODE ','URL:','===')) or n in [7,15,16,17,66]
        disposition='metadata_or_separator' if meta else 'event_evidence' if es else 'profile_or_background' if n in profiles else 'dialogue_or_scene_context'
        lines.append({'global_line':n,'episode_line':n-2,'scene_id':scene['scene_id'],'review_status':'reviewed',
                      'disposition':disposition,'event_ids':es,'text':t,
                      'review_note':'No additional current physical or mental event asserted; retained as context.' if not es and not meta else ''})
    out={'schema_version':'e01-scene-review-2.0','source_sha256':hashlib.sha256(RAW).hexdigest(),'episode_id':'E01',
         'review_scope':'Current and explicitly narrated historical physical/visual actions, mental events, reactions, relevant interaction dialogue, and separate family/domestic context. Every E01 source segment reviewed; ambiguous or unperformed events remain marked.',
         'review_status':'scene_review_complete_with_source_ambiguities','source_line_count':228,
         'scene_count':len(scenes),'event_count':len(EVENTS),'scenes':scenes,'events':EVENTS,'lines':lines,
         'source_ambiguities':[{'global_line':45,'issue':'Speaker label conflicts with addressing miss; preserved without automatic reassignment.'},
                               {'global_line':173,'issue':'Next-morning sequence contains literal 10 PM; preserved.'},
                               {'global_line':67,'issue':'Owner of imagined fingers is not named; imaginer is Uncle.'}],
         'alias_corrections':{'Ron':'john','Roh':'john','Babu':'chotu'},
         'negative_canon':[{'evidence_global_lines':[143,144,145,153],'fact':'First visit viewing remains uncertain; no Chotu–Dhika touch or kiss stated.'},
                           {'evidence_global_lines':[218,219,222,224],'fact':'Second scene confirms viewing and eye contact; no Chotu–Dhika body contact or kiss stated.'}]}
    (ROOT/'data/e01_scene_review.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
    print(json.dumps({'scenes':len(scenes),'events':len(EVENTS),'reviewed_lines':len(lines),'source_ambiguities':len(out['source_ambiguities'])}))

if __name__=='__main__':main()
