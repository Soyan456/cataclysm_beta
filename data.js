'use strict';
/* ====================== UNITS ====================== */
const MASS = {g:1, kg:1000, oz:28.3495231, lb:453.59237};
const VOL = {ml:1, L:1000, 'fl oz':29.5735296, cup:236.588237, tbsp:14.7867648, tsp:4.92892159};
const STEP = {srv:.5, g:10, kg:.1, oz:.5, lb:.25, ml:25, L:.25, 'fl oz':1, cup:.25, tbsp:1, tsp:1};
const KG_LB = 2.20462262;

/* ====================== FOODS ======================
 [id, name, cat, base(g|ml), kcal, protein, carbs, fat  (all per 100 base units), density g/ml, serving size (base units), serving label, tags] */
const FOOD_ROWS = [
 // protein
 ['chicken','Chicken breast, cooked','protein','g',165,31,0,3.6,1,120,'palm-size portion','lean'],
 ['chickenthigh','Chicken thigh, skinless, cooked','protein','g',209,26,0,10.9,1,100,'thigh',''],
 ['turkey','Turkey breast, cooked','protein','g',135,30,0,1,1,100,'portion','lean'],
 ['beef90','Ground beef 90% lean, cooked','protein','g',217,26.1,0,11.8,1,113,'4 oz patty',''],
 ['sirloin','Sirloin steak, cooked','protein','g',195,29,0,8,1,170,'6 oz steak',''],
 ['pork','Pork tenderloin, cooked','protein','g',143,26,0,3.5,1,113,'4 oz portion','lean'],
 ['salmon','Salmon, cooked','protein','g',206,22.1,0,12.4,1,142,'fillet',''],
 ['tuna','Tuna, canned in water','protein','g',116,25.5,0,0.8,1,142,'can','lean'],
 ['cod','Cod / white fish, cooked','protein','g',105,22.8,0,0.9,1,140,'fillet','lean'],
 ['shrimp','Shrimp, cooked','protein','g',99,24,0.2,0.3,1,113,'4 oz','lean'],
 ['egg','Egg, whole','protein','g',143,12.6,0.7,9.5,1,50,'large egg',''],
 ['eggwhite','Egg whites','protein','g',52,10.9,0.7,0.2,1,33,'large white','lean'],
 ['whey','Whey protein powder','protein','g',400,80,8,6,0.45,30,'scoop','lean'],
 ['tofu','Tofu, firm','protein','g',144,17.3,2.8,8.7,1,125,'serving',''],
 ['tempeh','Tempeh','protein','g',192,20.3,7.6,10.8,1,100,'serving',''],
 ['edamame','Edamame, cooked','protein','g',122,11.9,8.9,5.2,0.6,155,'1 cup',''],
 ['lentils','Lentils, cooked','protein','g',116,9,20.1,0.4,0.85,198,'1 cup',''],
 ['blackbeans','Black beans, cooked','protein','g',132,8.9,23.7,0.5,0.85,172,'1 cup',''],
 ['chickpeas','Chickpeas, cooked','protein','g',164,8.9,27.4,2.6,0.7,164,'1 cup',''],
 ['jerky','Beef jerky','protein','g',410,33.2,11,25.6,1,28,'1 oz','proc,dense'],
 ['bacon','Bacon, cooked','protein','g',541,37,1.4,42,1,8,'slice','proc,dense,fatty'],
 // dairy
 ['gyogurt','Greek yogurt, nonfat plain','dairy','g',59,10.2,3.6,0.4,1.05,170,'container','lean'],
 ['cottage','Cottage cheese, 2%','dairy','g',81,10.4,4.8,2.3,1.03,113,'1/2 cup','lean'],
 ['milk','Milk, whole','dairy','ml',63,3.3,4.9,3.3,1.03,240,'1 cup',''],
 ['skim','Milk, skim','dairy','ml',35,3.5,5.2,0.1,1.03,240,'1 cup','lean'],
 ['almondmilk','Almond milk, unsweetened','dairy','ml',15,0.6,0.6,1.2,1,240,'1 cup',''],
 ['cheddar','Cheddar cheese','dairy','g',403,24.9,1.3,33.1,1,28,'1 oz','dense,fatty'],
 ['mozz','Mozzarella, part-skim','dairy','g',254,24.3,2.8,15.9,1,28,'1 oz','fatty'],
 ['butter','Butter','fat','g',717,0.9,0.1,81,0.911,14,'tbsp','dense,fatty'],
 // carbs
 ['rice','White rice, cooked','carb','g',130,2.7,28.2,0.3,0.67,158,'1 cup',''],
 ['brownrice','Brown rice, cooked','carb','g',123,2.7,25.6,1,0.8,195,'1 cup',''],
 ['pasta','Pasta, cooked','carb','g',158,5.8,30.9,0.9,0.6,140,'1 cup',''],
 ['oats','Rolled oats, dry','carb','g',389,16.9,66.3,6.9,0.34,40,'1/2 cup',''],
 ['potato','Potato, baked','carb','g',93,2.5,21.2,0.1,0.9,173,'medium',''],
 ['sweetpotato','Sweet potato, baked','carb','g',90,2,20.7,0.2,0.9,130,'medium',''],
 ['bread','Whole wheat bread','carb','g',252,12.5,42.7,3.5,0.35,32,'slice',''],
 ['bagel','Bagel, plain','carb','g',257,10,50.9,1.6,0.5,98,'bagel',''],
 ['tortilla','Flour tortilla','carb','g',306,8.3,50.6,7.9,0.5,49,'medium',''],
 ['quinoa','Quinoa, cooked','carb','g',120,4.4,21.3,1.9,0.78,185,'1 cup',''],
 ['granola','Granola','carb','g',471,10,64,20,0.45,55,'1/2 cup','dense,sugar'],
 ['popcorn','Popcorn, air-popped','carb','g',387,12.9,77.8,4.5,0.034,24,'3 cups',''],
 // veg
 ['broccoli','Broccoli, cooked','veg','g',35,2.4,7.2,0.4,0.66,156,'1 cup',''],
 ['spinach','Spinach, raw','veg','g',23,2.9,3.6,0.4,0.13,30,'1 cup',''],
 ['romaine','Romaine lettuce','veg','g',17,1.2,3.3,0.3,0.2,85,'bowl',''],
 ['carrot','Carrot, raw','veg','g',41,0.9,9.6,0.2,0.55,61,'medium',''],
 ['bellpepper','Bell pepper, red','veg','g',31,1,6,0.3,0.5,119,'medium',''],
 ['greenbeans','Green beans, cooked','veg','g',35,1.9,7.9,0.3,0.55,125,'1 cup',''],
 ['cucumber','Cucumber','veg','g',15,0.7,3.6,0.1,0.9,100,'serving',''],
 ['tomato','Tomato','veg','g',18,0.9,3.9,0.2,0.95,123,'medium',''],
 ['asparagus','Asparagus, cooked','veg','g',22,2.4,4.1,0.2,0.9,90,'6 spears',''],
 ['mushroom','Mushrooms, cooked','veg','g',28,2.2,5.3,0.5,0.6,70,'serving',''],
 ['cauliflower','Cauliflower','veg','g',25,1.9,5,0.3,0.45,107,'1 cup',''],
 ['zucchini','Zucchini','veg','g',17,1.2,3.1,0.3,0.8,196,'medium',''],
 // fruit
 ['banana','Banana','fruit','g',89,1.1,22.8,0.3,0.9,118,'medium',''],
 ['apple','Apple','fruit','g',52,0.3,13.8,0.2,0.65,182,'medium',''],
 ['blueberry','Blueberries','fruit','g',57,0.7,14.5,0.3,0.62,148,'1 cup',''],
 ['strawberry','Strawberries','fruit','g',32,0.7,7.7,0.3,0.64,152,'1 cup',''],
 ['orange','Orange','fruit','g',47,0.9,11.8,0.1,0.9,131,'medium',''],
 ['grapes','Grapes','fruit','g',69,0.7,18.1,0.2,0.65,92,'1/2 cup',''],
 ['watermelon','Watermelon','fruit','g',30,0.6,7.6,0.2,0.64,152,'1 cup',''],
 // fats
 ['olive','Olive oil','fat','g',884,0,0,100,0.92,13.5,'tbsp','dense,fatty'],
 ['avocado','Avocado','fat','g',160,2,8.5,14.7,0.95,100,'1/2 avocado','fatty'],
 ['almonds','Almonds','fat','g',579,21.2,21.6,49.9,0.6,28,'1 oz','dense,fatty'],
 ['walnuts','Walnuts','fat','g',654,15.2,13.7,65.2,0.5,28,'1 oz','dense,fatty'],
 ['pb','Peanut butter','fat','g',588,25,20,50,1.07,32,'2 tbsp','dense,fatty'],
 ['chia','Chia seeds','fat','g',486,16.5,42.1,30.7,0.65,28,'2 tbsp','dense'],
 ['hummus','Hummus','fat','g',166,7.9,14.3,9.6,1,30,'2 tbsp',''],
 // drinks (ml)
 ['coffee','Coffee, black','drink','ml',1,0.1,0,0,1,240,'1 cup','caf'],
 ['diet','Diet soda','drink','ml',0,0,0,0,1,355,'can',''],
 ['soda','Soda (regular)','drink','ml',42,0,10.6,0,1.04,355,'can','sugar,liquid'],
 ['oj','Orange juice','drink','ml',45,0.7,10.4,0.2,1.04,240,'1 cup','sugar,liquid'],
 ['sports','Sports drink','drink','ml',26,0,6.4,0,1.02,355,'bottle','sugar,liquid'],
 ['energy','Energy drink','drink','ml',45,0,11,0,1.04,250,'can','sugar,liquid,caf'],
 ['beer','Beer, regular','drink','ml',43,0.5,3.6,0,1,355,'can','alc,liquid'],
 ['wine','Wine, red','drink','ml',85,0.1,2.6,0,0.99,150,'glass','alc,liquid'],
 // snacks / sweets / processed
 ['bar','Protein bar (typical)','snack','g',364,36,40,13,1,55,'bar','proc'],
 ['chips','Potato chips','snack','g',536,7,53,35,1,28,'1 oz','proc,dense,fried'],
 ['fries','French fries','snack','g',312,3.4,41,15,1,117,'medium order','proc,fried'],
 ['pizza','Pizza, cheese','snack','g',266,11,33,10,1,107,'slice','proc'],
 ['burger','Cheeseburger','snack','g',295,15,30,14,1,119,'burger','proc'],
 ['donut','Donut, glazed','sweet','g',421,4.9,51,23,1,60,'donut','proc,sugar,dense'],
 ['cookie','Cookie, chocolate chip','sweet','g',488,5.7,64,24,1,30,'cookie','proc,sugar,dense'],
 ['icecream','Ice cream, vanilla','sweet','g',207,3.5,23.6,11,0.55,66,'1/2 cup','sugar,dense'],
 ['darkchoc','Dark chocolate 70–85%','sweet','g',598,7.8,45.9,42.6,1,28,'1 oz','dense,sugar'],
 ['honey','Honey','sweet','g',304,0.3,82.4,0,1.42,21,'tbsp','sugar'],
];
const FOODS = FOOD_ROWS.map(r=>({id:r[0],n:r[1],cat:r[2],base:r[3],k:r[4],p:r[5],c:r[6],f:r[7],d:r[8],sv:r[9],sl:r[10],tg:(r[11]||'').split(',').filter(Boolean),std:true}));

/* ====================== MUSCLES / EXERCISES ====================== */
const MUSCLES = {
  chest:{n:'Chest',w:1.0}, back:{n:'Back',w:1.15}, shoulders:{n:'Shoulders',w:.9},
  biceps:{n:'Biceps',w:.7}, triceps:{n:'Triceps',w:.7},
  quads:{n:'Quads',w:1.0}, hams:{n:'Hamstrings',w:.8}, glutes:{n:'Glutes',w:.8}, calves:{n:'Calves',w:.6}, core:{n:'Core',w:.6}
};
const MUSCLE_KEYS = Object.keys(MUSCLES);
const GROUPS = {
  'Full Body':MUSCLE_KEYS,
  'Upper':['chest','back','shoulders','biceps','triceps'],
  'Lower':['quads','hams','glutes','calves','core'],
  'Push':['chest','shoulders','triceps'],
  'Pull':['back','biceps','core'],
  'Legs':['quads','hams','glutes','calves']
};
/* ex(id,name,equipment,primary,secondary,refLift,ratio,type,flags)
   ratio = estimated 1RM of this exercise as a fraction of the reference lift 1RM (per hand for dumbbells) */
const ex = (id,n,eq,p,s,ref,k,t,fl='')=>({id,n,eq,p:p.split(','),s:s?s.split(','):[],ref,k,t,main:fl.includes('main'),bw:fl.includes('bw'),time:fl.includes('time'),heavy:fl.includes('heavy'),bar:eq==='barbell'});
const EXERCISES = [
  // chest
  ex('bench','Barbell Bench Press','barbell','chest','shoulders,triceps','bench',1,'C','main'),
  ex('incbench','Incline Barbell Press','barbell','chest','shoulders,triceps','bench',.8,'C'),
  ex('dbbench','Dumbbell Bench Press','dumbbell','chest','shoulders,triceps','bench',.38,'C'),
  ex('dbincline','Incline Dumbbell Press','dumbbell','chest','shoulders,triceps','bench',.33,'C'),
  ex('pecfly','Cable / Machine Chest Fly','cable','chest','shoulders','bench',.25,'I'),
  ex('pushup','Push-Up','bodyweight','chest','shoulders,triceps','',0,'C','bw'),
  ex('dips','Parallel Bar Dips','bodyweight','chest,triceps','shoulders','',0,'C','bw'),
  // shoulders
  ex('ohp','Overhead Press','barbell','shoulders','triceps','ohp',1,'C','main'),
  ex('dbohp','Dumbbell Shoulder Press','dumbbell','shoulders','triceps','ohp',.38,'C'),
  ex('latraise','Dumbbell Lateral Raise','dumbbell','shoulders','','ohp',.16,'I'),
  ex('rearfly','Rear Delt Fly','dumbbell','shoulders','back','ohp',.14,'I'),
  ex('facepull','Cable Face Pull','cable','shoulders','back','row',.3,'I'),
  ex('pike','Pike Push-Up','bodyweight','shoulders','triceps','',0,'C','bw'),
  // triceps
  ex('cgbench','Close-Grip Bench Press','barbell','triceps','chest,shoulders','bench',.85,'C'),
  ex('pushdown','Cable Triceps Pushdown','cable','triceps','','bench',.4,'I'),
  ex('skull','Dumbbell Skull Crusher','dumbbell','triceps','','bench',.3,'I'),
  ex('dbext','Overhead Dumbbell Extension','dumbbell','triceps','','bench',.3,'I'),
  ex('benchdip','Bench Dips','bodyweight','triceps','chest,shoulders','',0,'I','bw'),
  // back
  ex('row','Barbell Row','barbell','back','biceps','row',1,'C','main'),
  ex('dbrow','One-Arm Dumbbell Row','dumbbell','back','biceps','row',.4,'C'),
  ex('pullup','Pull-Up','bodyweight','back','biceps','',0,'C','bw'),
  ex('latpd','Lat Pulldown','cable','back','biceps','row',.85,'C'),
  ex('cabrow','Seated Cable Row','cable','back','biceps','row',.85,'C'),
  ex('invrow','Inverted Row','bodyweight','back','biceps','',0,'C','bw'),
  ex('deadlift','Conventional Deadlift','barbell','back,hams,glutes','quads,core','deadlift',1,'C','main,heavy'),
  // biceps
  ex('bbcurl','Barbell Curl','barbell','biceps','','bench',.45,'I'),
  ex('dbcurl','Dumbbell Curl','dumbbell','biceps','','bench',.2,'I'),
  ex('hammer','Hammer Curl','dumbbell','biceps','','bench',.22,'I'),
  ex('inccurl','Incline Dumbbell Curl','dumbbell','biceps','','bench',.17,'I'),
  ex('chinup','Chin-Up','bodyweight','biceps,back','','',0,'C','bw'),
  // quads / legs
  ex('squat','Barbell Back Squat','barbell','quads,glutes','hams,core','squat',1,'C','main,heavy'),
  ex('frontsq','Front Squat','barbell','quads','glutes,core','squat',.8,'C','heavy'),
  ex('legpress','Leg Press','machine','quads,glutes','hams','squat',1.5,'C'),
  ex('goblet','Goblet Squat','dumbbell','quads,glutes','core','squat',.3,'C'),
  ex('lunge','Dumbbell Walking Lunge','dumbbell','quads,glutes','hams','squat',.3,'C'),
  ex('bss','Bulgarian Split Squat','dumbbell','quads,glutes','hams','squat',.28,'C'),
  ex('legext','Leg Extension','machine','quads','','squat',.5,'I'),
  ex('bwsquat','Bodyweight Squat','bodyweight','quads,glutes','','',0,'C','bw'),
  ex('bwlunge','Reverse Lunge','bodyweight','quads,glutes','hams','',0,'C','bw'),
  // hamstrings / glutes
  ex('rdl','Romanian Deadlift','barbell','hams,glutes','back','deadlift',.7,'C'),
  ex('dbrdl','Dumbbell Romanian Deadlift','dumbbell','hams,glutes','back','deadlift',.33,'C'),
  ex('legcurl','Leg Curl','machine','hams','','squat',.35,'I'),
  ex('hipthrust','Barbell Hip Thrust','barbell','glutes','hams','squat',1.2,'C'),
  ex('dbthrust','Dumbbell Hip Thrust','dumbbell','glutes','hams','squat',.4,'C'),
  ex('glutebridge','Single-Leg Glute Bridge','bodyweight','glutes','hams','',0,'I','bw'),
  ex('sldl','Single-Leg RDL (bodyweight)','bodyweight','hams,glutes','','',0,'C','bw'),
  // calves
  ex('calf','Standing Calf Raise','machine','calves','','squat',.8,'I'),
  ex('dbcalf','Dumbbell Calf Raise','dumbbell','calves','','squat',.3,'I'),
  ex('bwcalf','Bodyweight Calf Raise','bodyweight','calves','','',0,'I','bw'),
  // core
  ex('plank','Plank','bodyweight','core','','',0,'I','bw,time'),
  ex('deadbug','Dead Bug','bodyweight','core','','',0,'I','bw'),
  ex('hangleg','Hanging Leg Raise','bodyweight','core','','',0,'I','bw'),
  ex('cablecrunch','Cable Crunch','cable','core','','row',.6,'I'),
  ex('russian','Weighted Russian Twist','dumbbell','core','','bench',.1,'I'),
];
const EX_MAP = Object.fromEntries(EXERCISES.map(e=>[e.id,e]));
const EQUIP = {
  gym:new Set(['barbell','dumbbell','machine','cable','bodyweight']),
  dumbbells:new Set(['dumbbell','bodyweight']),
  bodyweight:new Set(['bodyweight'])
};
const MAIN_LIFTS = [
  {id:'bench',n:'Bench Press',ex:'bench'},{id:'squat',n:'Back Squat',ex:'squat'},{id:'deadlift',n:'Deadlift',ex:'deadlift'},
  {id:'ohp',n:'Overhead Press',ex:'ohp'},{id:'row',n:'Barbell Row',ex:'row'}
];
/* relative 1RM ratios of an "average trained lifter", used to estimate lifts the user hasn't entered */
const LIFT_RATIO = {bench:1, squat:1.3, deadlift:1.6, ohp:.62, row:.85};

/* ====================== GOALS ====================== */
const GOALS = {
  fatloss:{n:'Fat loss', d:'Lose fat, keep muscle', protein:2.4, weekly:10, main:[5,6],mainSets:3, acc:[8,10],accSets:3, iso:[12,15],isoSets:2, cardio:150},
  lose:{n:'Weight loss', d:'Reach a goal weight', protein:2.3, weekly:10, main:[5,6],mainSets:3, acc:[8,12],accSets:3, iso:[12,15],isoSets:2, cardio:150},
  muscle:{n:'Muscle gain', d:'Lean bulk', protein:2.0, weekly:14, main:[6,8],mainSets:4, acc:[8,12],accSets:3, iso:[10,15],isoSets:3, cardio:60},
  gain:{n:'Weight gain', d:'Reach a goal weight', protein:1.9, weekly:12, main:[6,8],mainSets:4, acc:[8,12],accSets:3, iso:[10,15],isoSets:3, cardio:60},
  recomp:{n:'Recomposition', d:'Lose fat + build muscle', protein:2.3, weekly:12, main:[6,8],mainSets:4, acc:[8,12],accSets:3, iso:[10,15],isoSets:3, cardio:90},
  maintain:{n:'Maintain', d:'Stay where you are', protein:1.8, weekly:9, main:[6,8],mainSets:3, acc:[8,12],accSets:3, iso:[12,15],isoSets:2, cardio:90},
};
const ACTIVITY = {
  sedentary:{m:1.2,n:'Sedentary',d:'Desk job, little exercise'},
  light:{m:1.375,n:'Light',d:'Exercise 1–3 days/week'},
  moderate:{m:1.55,n:'Moderate',d:'Exercise 3–5 days/week'},
  very:{m:1.725,n:'Very active',d:'Hard exercise 6–7 days/week'},
  athlete:{m:1.9,n:'Athlete',d:'Physical job + daily training'},
};
const CARDIO = {
  walk:{n:'Walking',met:3.8},brisk:{n:'Brisk walk / incline',met:5},run:{n:'Running',met:9.8},cycle:{n:'Cycling',met:7.5},
  row:{n:'Rowing',met:7},swim:{n:'Swimming',met:7},hiit:{n:'HIIT',met:9},elliptical:{n:'Elliptical',met:5.5},
  stairs:{n:'Stair climber',met:8.5},rope:{n:'Jump rope',met:11},hike:{n:'Hiking',met:6.3},sport:{n:'Sports',met:7}
};

/* ====================== FITNESS TESTS ====================== */
const CATS = [
  {id:'strength',n:'Strength',d:'Relative max strength (lift ÷ bodyweight)'},
  {id:'power',n:'Power',d:'Explosive force'},
  {id:'aerobic',n:'Aerobic',d:'Endurance engine (VO₂ max)'},
  {id:'anaerobic',n:'Anaerobic',d:'Hard efforts and repeat sprints'},
  {id:'endurance',n:'Muscular Endurance',d:'Reps and holds'},
  {id:'flex',n:'Flexibility',d:'Mobility and range of motion'},
  {id:'focus',n:'Mental Focus',d:'Reaction, attention, working memory'},
  {id:'mind',n:'Mental Health',d:'Self-reported wellbeing'},
];
/* tb: score tables [value, score]; m / f. Interpolated linearly; lower-is-better tables simply descend. */
const TESTS = [
  {id:'bench',cat:'strength',n:'Bench press',auto:'lift',tb:{m:[[.4,0],[.75,25],[1,50],[1.35,75],[1.6,90],[2,100]],f:[[.2,0],[.45,25],[.7,50],[1,75],[1.2,90],[1.5,100]]}},
  {id:'squat',cat:'strength',n:'Back squat',auto:'lift',tb:{m:[[.6,0],[1,25],[1.5,50],[2,75],[2.4,90],[2.8,100]],f:[[.45,0],[.8,25],[1.2,50],[1.6,75],[2,90],[2.3,100]]}},
  {id:'deadlift',cat:'strength',n:'Deadlift',auto:'lift',tb:{m:[[.75,0],[1.25,25],[1.75,50],[2.25,75],[2.75,90],[3.2,100]],f:[[.6,0],[1,25],[1.5,50],[1.9,75],[2.3,90],[2.7,100]]}},
  {id:'ohp',cat:'strength',n:'Overhead press',auto:'lift',tb:{m:[[.3,0],[.55,25],[.75,50],[.95,75],[1.15,90],[1.4,100]],f:[[.15,0],[.35,25],[.5,50],[.7,75],[.85,90],[1.05,100]]}},
  {id:'vjump',cat:'power',n:'Vertical jump',kind:'len',how:'Stand sideways to a wall, mark your standing reach, jump as high as you can and mark again. Measure the gap. Best of 3.',
    tb:{m:[[20,0],[35,25],[50,50],[62,75],[72,90],[85,100]],f:[[15,0],[25,25],[38,50],[48,75],[58,90],[70,100]]}},
  {id:'bjump',cat:'power',n:'Standing broad jump',kind:'len',how:'Feet behind a line, swing your arms and jump forward as far as possible, landing on both feet. Measure from the line to your rearmost heel. Best of 3.',
    tb:{m:[[120,0],[180,25],[225,50],[260,75],[285,90],[310,100]],f:[[90,0],[140,25],[180,50],[215,75],[240,90],[265,100]]}},
  {id:'vo2',cat:'aerobic',n:'VO₂ max estimate',kind:'vo2',
    tb:{m:[[25,0],[35,25],[42,50],[50,75],[56,90],[65,100]],f:[[20,0],[29,25],[35,50],[42,75],[48,90],[58,100]]}},
  {id:'rhr',cat:'aerobic',n:'Resting heart rate',kind:'num',unit:'bpm',how:'Measure your pulse for 60 seconds right after waking, before getting up. Average 3 mornings if you can.',
    tb:{m:[[45,100],[52,90],[60,75],[68,50],[80,25],[100,0]],f:[[48,100],[56,90],[64,75],[72,50],[84,25],[104,0]]}},
  {id:'burpee',cat:'anaerobic',n:'Burpees in 60 seconds',kind:'reps',how:'Full burpees with chest to floor and a jump at the top. Count clean reps in one minute.',
    tb:{m:[[8,0],[15,25],[22,50],[29,75],[34,90],[40,100]],f:[[5,0],[12,25],[18,50],[24,75],[29,90],[35,100]]}},
  {id:'run400',cat:'anaerobic',n:'400 m all-out run',kind:'time',how:'One lap of a standard track, run as fast as you can. Enter your time as m:ss.',
    tb:{m:[[58,100],[70,90],[80,75],[95,50],[120,25],[160,0]],f:[[66,100],[80,90],[92,75],[110,50],[140,25],[190,0]]}},
  {id:'pushups',cat:'endurance',n:'Max push-ups',kind:'reps',how:'Strict form: chest to a fist-height or the floor, full lockout. Count reps until form breaks.',
    tb:{m:[[3,0],[15,25],[30,50],[45,75],[60,90],[80,100]],f:[[1,0],[8,25],[18,50],[30,75],[42,90],[60,100]]}},
  {id:'plank',cat:'endurance',n:'Plank hold',kind:'time',how:'Forearm plank with a straight line from head to heels. Stop when your hips sag. Enter time as m:ss.',
    tb:{m:[[15,0],[45,25],[90,50],[150,75],[210,90],[300,100]],f:[[15,0],[45,25],[90,50],[150,75],[210,90],[300,100]]}},
  {id:'pullups',cat:'endurance',n:'Max pull-ups',kind:'reps',how:'Dead hang to chin over the bar, no kipping. Count strict reps.',
    tb:{m:[[0,0],[3,25],[8,50],[14,75],[20,90],[28,100]],f:[[0,0],[1,25],[4,50],[9,75],[14,90],[20,100]]}},
  {id:'sitreach',cat:'flex',n:'Sit-and-reach',kind:'len',signed:true,how:'Sit with legs straight, reach forward along a ruler. 0 = your toes. Reaching past your toes is positive, short of them is negative.',
    tb:{m:[[-15,0],[-5,25],[5,50],[15,75],[25,90],[35,100]],f:[[-10,0],[0,25],[10,50],[20,75],[29,90],[38,100]]}},
  {id:'backscratch',cat:'flex',n:'Shoulder reach (back scratch)',kind:'len',signed:true,how:'Reach one hand over your shoulder and the other up your back. Measure the gap between fingertips: overlap is positive, a gap is negative. Use your worse side.',
    tb:{m:[[-15,0],[-8,25],[0,50],[4,75],[8,90],[12,100]],f:[[-12,0],[-5,25],[2,50],[6,75],[10,90],[14,100]]}},
  {id:'squathold',cat:'flex',n:'Deep squat hold',kind:'time',how:'Sink into a full squat, heels flat, torso upright, no support. Time how long you can stay comfortably. Enter as m:ss.',
    tb:{m:[[0,0],[15,25],[45,50],[90,75],[150,90],[240,100]],f:[[0,0],[15,25],[45,50],[90,75],[150,90],[240,100]]}},
  {id:'reaction',cat:'focus',n:'Reaction time',kind:'app',tb:{m:[[170,100],[200,90],[230,75],[280,50],[350,25],[450,0]],f:[[170,100],[200,90],[230,75],[280,50],[350,25],[450,0]]}},
  {id:'stroop',cat:'focus',n:'Stroop focus test',kind:'app'},
  {id:'digits',cat:'focus',n:'Digit memory',kind:'app',tb:{m:[[3,0],[5,25],[7,50],[9,75],[11,90],[13,100]],f:[[3,0],[5,25],[7,50],[9,75],[11,90],[13,100]]}},
  {id:'wellbeing',cat:'mind',n:'Wellbeing check-in',kind:'app'},
];
const TEST_MAP = Object.fromEntries(TESTS.map(t=>[t.id,t]));
const STROOP_COLORS = [['RED','#ff4d5e'],['BLUE','#4da3ff'],['GREEN','#3be08f'],['YELLOW','#ffd24d']];
const WELLBEING_ITEMS = [
  'I have felt calm and relaxed',
  'I have felt energetic and rested',
  'I have felt cheerful and in good spirits',
  'I have been able to concentrate on what I was doing',
  'My sleep has refreshed me',
  'I have looked forward to things',
  'I have felt connected to people I care about',
  'I have felt confident handling my daily demands',
];
