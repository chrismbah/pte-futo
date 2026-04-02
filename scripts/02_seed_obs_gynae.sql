-- Obstetrics & Gynaecology: 200 questions
DO $$
DECLARE
  qz_id UUID;
  q_id UUID;
BEGIN

-- Create the quiz
INSERT INTO quizzes (title, description, total_questions, duration_minutes, pass_score, is_published)
VALUES ('Obstetrics & Gynaecology', 'Comprehensive O&G quiz covering antenatal care, labour, postnatal care, gynaecological conditions, and reproductive medicine.', 200, 180, 50, true)
RETURNING id INTO qz_id;

-- Q1
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the normal duration of the first stage of labour in a primigravida?', 'First stage in primigravida lasts up to 12 hours (active phase begins at 4cm).', 1) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Up to 12 hours', true, 1),(q_id, 'Up to 6 hours', false, 2),(q_id, 'Up to 20 hours', false, 3),(q_id, 'Up to 3 hours', false, 4);

-- Q2
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which hormone is measured in a pregnancy test?', 'hCG (human chorionic gonadotropin) is produced by the trophoblast after implantation.', 2) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'hCG', true, 1),(q_id, 'LH', false, 2),(q_id, 'FSH', false, 3),(q_id, 'Progesterone', false, 4);

-- Q3
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of postpartum haemorrhage?', 'Uterine atony accounts for ~80% of PPH cases.', 3) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Uterine atony', true, 1),(q_id, 'Retained placenta', false, 2),(q_id, 'Cervical laceration', false, 3),(q_id, 'Coagulopathy', false, 4);

-- Q4
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which condition is characterised by hypertension and proteinuria after 20 weeks of pregnancy?', 'Pre-eclampsia is defined as new-onset hypertension (≥140/90) with proteinuria after 20 weeks.', 4) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Pre-eclampsia', true, 1),(q_id, 'Gestational hypertension', false, 2),(q_id, 'Chronic hypertension', false, 3),(q_id, 'HELLP syndrome', false, 4);

-- Q5
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the leading cause of maternal mortality in Nigeria?', 'Haemorrhage (especially PPH) remains the leading cause of maternal death in Nigeria.', 5) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Haemorrhage', true, 1),(q_id, 'Infection/Sepsis', false, 2),(q_id, 'Hypertensive disorders', false, 3),(q_id, 'Obstructed labour', false, 4);

-- Q6
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'At what gestational age does viability of a fetus generally begin?', 'Viability is generally accepted at 28 weeks in Nigeria, though 24 weeks is used in high-resource settings.', 6) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '28 weeks', true, 1),(q_id, '20 weeks', false, 2),(q_id, '24 weeks', false, 3),(q_id, '32 weeks', false, 4);

-- Q7
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the drug of choice for eclamptic fits?', 'Magnesium sulphate is the drug of choice for both prevention and treatment of eclamptic seizures.', 7) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Magnesium sulphate', true, 1),(q_id, 'Diazepam', false, 2),(q_id, 'Phenytoin', false, 3),(q_id, 'Phenobarbitone', false, 4);

-- Q8
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which presenting part is associated with face presentation?', 'In face presentation, the mentum (chin) is the denominator.', 8) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Mentum (chin)', true, 1),(q_id, 'Occiput', false, 2),(q_id, 'Sacrum', false, 3),(q_id, 'Acromion', false, 4);

-- Q9
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the normal fetal heart rate range?', 'Normal FHR is 110–160 bpm.', 9) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '110–160 bpm', true, 1),(q_id, '60–100 bpm', false, 2),(q_id, '80–120 bpm', false, 3),(q_id, '160–200 bpm', false, 4);

-- Q10
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which vitamin supplement is recommended in early pregnancy to prevent neural tube defects?', 'Folic acid (400–5000 mcg/day) taken periconceptionally prevents NTDs.', 10) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Folic acid', true, 1),(q_id, 'Vitamin A', false, 2),(q_id, 'Vitamin D', false, 3),(q_id, 'Iron', false, 4);

-- Q11
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is Naegele''s rule used for?', 'Naegele''s rule calculates the estimated date of delivery (EDD).', 11) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Calculating estimated date of delivery', true, 1),(q_id, 'Estimating fetal weight', false, 2),(q_id, 'Assessing cervical dilation', false, 3),(q_id, 'Diagnosing placenta praevia', false, 4);

-- Q12
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which type of placenta praevia is most likely to obstruct vaginal delivery?', 'Central (Type IV) or major placenta praevia covers the internal os completely.', 12) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Central (Type IV)', true, 1),(q_id, 'Type I (low-lying)', false, 2),(q_id, 'Type II (marginal)', false, 3),(q_id, 'Type III (partial)', false, 4);

-- Q13
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the classic symptom of placenta praevia?', 'Painless bright-red antepartum haemorrhage is classic for placenta praevia.', 13) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Painless antepartum haemorrhage', true, 1),(q_id, 'Painful antepartum haemorrhage', false, 2),(q_id, 'Abdominal pain with no bleeding', false, 3),(q_id, 'Contractions at 28 weeks', false, 4);

-- Q14
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the classic presentation of abruptio placentae?', 'Abruptio placentae presents with painful antepartum haemorrhage and a rigid, tender uterus.', 14) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Painful antepartum haemorrhage with rigid uterus', true, 1),(q_id, 'Painless antepartum haemorrhage', false, 2),(q_id, 'Fetal macrosomia', false, 3),(q_id, 'Cervical incompetence', false, 4);

-- Q15
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the normal duration of the second stage of labour in a primigravida?', 'Second stage in primigravida lasts up to 2 hours (active pushing up to 1 hour with epidural).', 15) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Up to 2 hours', true, 1),(q_id, 'Up to 30 minutes', false, 2),(q_id, 'Up to 4 hours', false, 3),(q_id, 'Up to 1 hour', false, 4);

-- Q16
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What does the APGAR score assess?', 'APGAR scores Appearance, Pulse, Grimace, Activity, and Respiration at 1 and 5 minutes.', 16) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Neonatal condition at birth', true, 1),(q_id, 'Maternal blood loss', false, 2),(q_id, 'Gestational age', false, 3),(q_id, 'Placental function', false, 4);

-- Q17
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which operation is performed for prolonged obstructed labour with a dead fetus?', 'Destructive operations (e.g. craniotomy) are performed on a dead fetus to effect delivery when other methods fail.', 17) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Craniotomy', true, 1),(q_id, 'Caesarean section', false, 2),(q_id, 'Vacuum delivery', false, 3),(q_id, 'Episiotomy', false, 4);

-- Q18
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common site of ectopic pregnancy?', 'Over 95% of ectopic pregnancies occur in the fallopian tube, most commonly the ampulla.', 18) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fallopian tube (ampulla)', true, 1),(q_id, 'Ovary', false, 2),(q_id, 'Cervix', false, 3),(q_id, 'Abdomen', false, 4);

-- Q19
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of grand multiparity?', 'Grand multiparity is having given birth 5 or more times.', 19) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '5 or more deliveries', true, 1),(q_id, '3 or more deliveries', false, 2),(q_id, '4 or more deliveries', false, 3),(q_id, '7 or more deliveries', false, 4);

-- Q20
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the mechanism of action of oxytocin in labour?', 'Oxytocin binds myometrial receptors causing uterine contractions by increasing intracellular calcium.', 20) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Stimulates uterine contractions', true, 1),(q_id, 'Relaxes uterine smooth muscle', false, 2),(q_id, 'Inhibits cervical ripening', false, 3),(q_id, 'Suppresses fetal cortisol', false, 4);

-- Q21
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which complication is a known risk of grand multiparity?', 'Grand multiparae are at increased risk of uterine rupture due to a thinned uterine wall.', 21) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Uterine rupture', true, 1),(q_id, 'Preterm labour', false, 2),(q_id, 'Placenta accreta only', false, 3),(q_id, 'Cervical incompetence', false, 4);

-- Q22
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the normal blood loss at vaginal delivery?', 'Normal blood loss at vaginal delivery is up to 500 mL; >500 mL is defined as PPH.', 22) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Up to 500 mL', true, 1),(q_id, 'Up to 1000 mL', false, 2),(q_id, 'Up to 200 mL', false, 3),(q_id, 'Up to 750 mL', false, 4);

-- Q23
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is hyperemesis gravidarum?', 'Hyperemesis gravidarum is severe, persistent nausea and vomiting in pregnancy causing dehydration and >5% weight loss.', 23) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Severe vomiting in pregnancy causing dehydration', true, 1),(q_id, 'Mild morning sickness', false, 2),(q_id, 'Vomiting due to peptic ulcer disease', false, 3),(q_id, 'Vomiting in the third trimester only', false, 4);

-- Q24
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the recommended mode of delivery for placenta praevia (type IV)?', 'Caesarean section is mandatory for type IV (central) placenta praevia.', 24) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Caesarean section', true, 1),(q_id, 'Vaginal delivery', false, 2),(q_id, 'Vacuum extraction', false, 3),(q_id, 'Forceps delivery', false, 4);

-- Q25
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Bishop score used for?', 'The Bishop score assesses cervical favourability (ripeness) for induction of labour.', 25) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Assessing cervical ripeness for induction', true, 1),(q_id, 'Estimating fetal weight', false, 2),(q_id, 'Diagnosing pre-eclampsia', false, 3),(q_id, 'Calculating EDD', false, 4);

-- Q26
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is chorioamnionitis?', 'Chorioamnionitis is infection of the fetal membranes (chorion and amnion).', 26) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Infection of the fetal membranes', true, 1),(q_id, 'Infection of the placenta only', false, 2),(q_id, 'Intrauterine growth restriction', false, 3),(q_id, 'Premature rupture of membranes', false, 4);

-- Q27
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which investigation is first line for suspected ectopic pregnancy?', 'Transvaginal ultrasound combined with serum beta-hCG is the investigation of choice.', 27) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Transvaginal ultrasound + beta-hCG', true, 1),(q_id, 'Laparotomy', false, 2),(q_id, 'MRI pelvis', false, 3),(q_id, 'Abdominal X-ray', false, 4);

-- Q28
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of pre-term labour?', 'Preterm labour is labour occurring between 24 and 37 completed weeks of gestation.', 28) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Labour before 37 completed weeks', true, 1),(q_id, 'Labour before 28 weeks', false, 2),(q_id, 'Labour before 34 weeks', false, 3),(q_id, 'Labour before 40 weeks', false, 4);

-- Q29
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the first-line tocolytic agent used in preterm labour?', 'Nifedipine (calcium channel blocker) is the preferred tocolytic in many guidelines.', 29) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Nifedipine', true, 1),(q_id, 'Salbutamol', false, 2),(q_id, 'Indomethacin', false, 3),(q_id, 'Magnesium sulphate', false, 4);

-- Q30
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the purpose of antenatal corticosteroids in preterm labour?', 'Corticosteroids (betamethasone/dexamethasone) accelerate fetal lung maturity and reduce RDS risk.', 30) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Accelerate fetal lung maturity', true, 1),(q_id, 'Stop uterine contractions', false, 2),(q_id, 'Prevent fetal anaemia', false, 3),(q_id, 'Reduce maternal blood pressure', false, 4);

-- Q31
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is gestational diabetes mellitus (GDM)?', 'GDM is glucose intolerance first diagnosed or recognised during pregnancy.', 31) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Glucose intolerance first recognised in pregnancy', true, 1),(q_id, 'Type 1 diabetes diagnosed in pregnancy', false, 2),(q_id, 'Hypoglycaemia in pregnancy', false, 3),(q_id, 'Ketoacidosis in a pregnant woman', false, 4);

-- Q32
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which fetal complication is associated with gestational diabetes?', 'GDM is associated with macrosomia (large-for-gestational-age baby).', 32) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Macrosomia', true, 1),(q_id, 'Intrauterine growth restriction', false, 2),(q_id, 'Neural tube defects', false, 3),(q_id, 'Hydrops fetalis', false, 4);

-- Q33
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is shoulder dystocia?', 'Shoulder dystocia is impaction of the anterior fetal shoulder behind the maternal pubic symphysis after delivery of the head.', 33) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Impaction of fetal shoulder behind pubic symphysis', true, 1),(q_id, 'Prolapse of the shoulder', false, 2),(q_id, 'Rupture of the brachial plexus', false, 3),(q_id, 'Breech presentation of the shoulder', false, 4);

-- Q34
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What manoeuvre is first used in shoulder dystocia?', 'McRoberts manoeuvre (hyperflexion of maternal thighs) is the first step.', 34) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'McRoberts manoeuvre', true, 1),(q_id, 'Rubin II manoeuvre', false, 2),(q_id, 'Zavanelli manoeuvre', false, 3),(q_id, 'Woods screw manoeuvre', false, 4);

-- Q35
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is PROM?', 'PROM (Premature Rupture of Membranes) is rupture of membranes before the onset of labour.', 35) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Rupture of membranes before onset of labour', true, 1),(q_id, 'Rupture of membranes during second stage', false, 2),(q_id, 'Spontaneous abortion at 10 weeks', false, 3),(q_id, 'Premature placental separation', false, 4);

-- Q36
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common chromosomal cause of spontaneous abortion?', 'Autosomal trisomy (e.g. trisomy 16) is the most common chromosomal abnormality in spontaneous abortions.', 36) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Autosomal trisomy', true, 1),(q_id, 'Monosomy X (Turner syndrome)', false, 2),(q_id, 'Triploidy', false, 3),(q_id, 'Down syndrome', false, 4);

-- Q37
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is an incompetent cervix?', 'Cervical incompetence is painless dilation of the cervix in the second trimester without contractions.', 37) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Painless mid-trimester cervical dilation', true, 1),(q_id, 'Cervicitis due to infection', false, 2),(q_id, 'Cervical stenosis', false, 3),(q_id, 'Preterm labour with contractions', false, 4);

-- Q38
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What surgical procedure is used to treat cervical incompetence?', 'Cervical cerclage (MacDonald or Shirodkar) reinforces the cervix to prevent second-trimester loss.', 38) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Cervical cerclage', true, 1),(q_id, 'Hysterotomy', false, 2),(q_id, 'LLETZ', false, 3),(q_id, 'Cone biopsy', false, 4);

-- Q39
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the cardinal movement of the fetal head during labour in occipito-anterior position?', 'The cardinal movements are: engagement, descent, flexion, internal rotation, extension, external rotation, expulsion.', 39) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Engagement, descent, flexion, internal rotation, extension, external rotation', true, 1),(q_id, 'Flexion, extension, rotation, descent, engagement', false, 2),(q_id, 'Descent, engagement, extension, flexion, rotation', false, 3),(q_id, 'Internal rotation, engagement, descent, extension', false, 4);

-- Q40
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the fetal lie?', 'Fetal lie is the relationship between the long axis of the fetus and the long axis of the uterus.', 40) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Relationship of fetal to uterine long axis', true, 1),(q_id, 'Part of fetus in lower uterine segment', false, 2),(q_id, 'Direction of fetal back', false, 3),(q_id, 'Position of fetal head', false, 4);

-- Q41-60 (continuing O&G)
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common ovarian tumour in pregnancy?', 'Corpus luteum cyst is the most common ovarian mass in pregnancy.', 41) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Corpus luteum cyst', true, 1),(q_id, 'Serous cystadenoma', false, 2),(q_id, 'Dermoid cyst', false, 3),(q_id, 'Granulosa cell tumour', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the treatment of choice for a complete hydatidiform mole?', 'Suction evacuation (suction curettage) is the treatment of choice followed by hCG monitoring.', 42) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Suction curettage', true, 1),(q_id, 'Hysterectomy as first line', false, 2),(q_id, 'Methotrexate alone', false, 3),(q_id, 'Expectant management', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What karyotype is seen in a complete hydatidiform mole?', 'Complete moles are 46,XX (androgenetic diploid) — entirely paternal in origin.', 43) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '46,XX (entirely paternal)', true, 1),(q_id, '69,XXY (triploid)', false, 2),(q_id, '46,XY (maternal and paternal)', false, 3),(q_id, '45,X (monosomy)', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Rhesus (Rh) factor and why is it important in obstetrics?', 'Rh-negative mothers can form anti-D antibodies that cross the placenta and cause haemolytic disease of the newborn (HDN).', 44) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Maternal antibodies can cause haemolytic disease of newborn', true, 1),(q_id, 'It determines placental type', false, 2),(q_id, 'It predicts pre-eclampsia', false, 3),(q_id, 'It causes gestational diabetes', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'When is anti-D immunoglobulin given in an Rh-negative mother?', 'Anti-D is given after any sensitising event (delivery, abortion, amniocentesis) and routinely at 28 weeks.', 45) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'After sensitising events and at 28 weeks', true, 1),(q_id, 'Only at delivery', false, 2),(q_id, 'Only in the first trimester', false, 3),(q_id, 'After every antenatal visit', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of primary amenorrhoea in Nigeria?', 'Imperforate hymen causing cryptomenorrhoea is a common cause of primary amenorrhoea.', 46) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Imperforate hymen', true, 1),(q_id, 'Turner syndrome', false, 2),(q_id, 'Androgen insensitivity syndrome', false, 3),(q_id, 'Kallmann syndrome', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of secondary amenorrhoea?', 'Pregnancy is always the most common cause of secondary amenorrhoea.', 47) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Pregnancy', true, 1),(q_id, 'Polycystic ovarian syndrome', false, 2),(q_id, 'Hypothyroidism', false, 3),(q_id, 'Hyperprolactinaemia', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is PCOS?', 'PCOS (Polycystic Ovarian Syndrome) is characterised by irregular periods, hyperandrogenism, and polycystic ovaries.', 48) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Syndrome of irregular periods, hyperandrogenism, and polycystic ovaries', true, 1),(q_id, 'Benign ovarian cyst disease', false, 2),(q_id, 'Autoimmune ovarian failure', false, 3),(q_id, 'Premature menopause', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which hormonal profile is typical of PCOS?', 'PCOS typically shows raised LH:FSH ratio (>2:1), raised androgens, and normal or low FSH.', 49) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Raised LH, low/normal FSH, raised androgens', true, 1),(q_id, 'Raised FSH and LH equally', false, 2),(q_id, 'Low LH, raised FSH', false, 3),(q_id, 'Low oestrogen and low LH', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is endometriosis?', 'Endometriosis is the presence of endometrial-like tissue outside the uterine cavity.', 50) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Endometrial tissue outside the uterine cavity', true, 1),(q_id, 'Infection of the endometrium', false, 2),(q_id, 'Benign tumour of the endometrium', false, 3),(q_id, 'Thickening of the endometrium', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the gold standard for diagnosing endometriosis?', 'Laparoscopy with biopsy is the gold standard for diagnosing endometriosis.', 51) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Laparoscopy with biopsy', true, 1),(q_id, 'Transvaginal ultrasound', false, 2),(q_id, 'MRI pelvis', false, 3),(q_id, 'Serum CA-125', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is adenomyosis?', 'Adenomyosis is the presence of endometrial glands and stroma within the myometrium.', 52) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Endometrial tissue within the myometrium', true, 1),(q_id, 'Endometrial polyp', false, 2),(q_id, 'Submucous fibroid', false, 3),(q_id, 'Endometrial carcinoma', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common benign uterine tumour?', 'Uterine fibroids (leiomyomas) are the most common benign uterine tumours.', 53) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Uterine fibroids (leiomyoma)', true, 1),(q_id, 'Endometrial polyp', false, 2),(q_id, 'Adenomyoma', false, 3),(q_id, 'Uterine sarcoma', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which type of fibroid is most likely to cause infertility?', 'Submucous fibroids distort the uterine cavity and are most associated with infertility and recurrent miscarriage.', 54) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Submucous fibroid', true, 1),(q_id, 'Intramural fibroid', false, 2),(q_id, 'Subserous fibroid', false, 3),(q_id, 'Pedunculated fibroid', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common gynaecological cancer in Nigeria?', 'Cervical cancer is the most common gynaecological cancer in Nigeria and sub-Saharan Africa.', 55) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Cervical cancer', true, 1),(q_id, 'Endometrial cancer', false, 2),(q_id, 'Ovarian cancer', false, 3),(q_id, 'Vulval cancer', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What HPV types are responsible for most cervical cancers?', 'HPV 16 and 18 together account for approximately 70% of all cervical cancers.', 56) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'HPV 16 and 18', true, 1),(q_id, 'HPV 6 and 11', false, 2),(q_id, 'HPV 31 and 33', false, 3),(q_id, 'HPV 45 and 52', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What investigation is used for cervical cancer screening?', 'Pap smear (cervical cytology) is the standard screening test for cervical cancer.', 57) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Pap smear (cervical cytology)', true, 1),(q_id, 'Colposcopy', false, 2),(q_id, 'Cervical biopsy', false, 3),(q_id, 'HPV DNA test only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common symptom of endometrial cancer?', 'Postmenopausal bleeding is the hallmark symptom of endometrial carcinoma.', 58) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Postmenopausal bleeding', true, 1),(q_id, 'Pelvic pain', false, 2),(q_id, 'Dyspareunia', false, 3),(q_id, 'Urinary frequency', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which ovarian tumour marker is elevated in epithelial ovarian cancer?', 'CA-125 is the most widely used tumour marker for epithelial ovarian cancer.', 59) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'CA-125', true, 1),(q_id, 'AFP', false, 2),(q_id, 'Beta-hCG', false, 3),(q_id, 'CEA', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the silent killer among gynaecological cancers?', 'Ovarian cancer is called the silent killer because it presents late with vague symptoms.', 60) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Ovarian cancer', true, 1),(q_id, 'Cervical cancer', false, 2),(q_id, 'Endometrial cancer', false, 3),(q_id, 'Vulval cancer', false, 4);

-- Q61-80
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common type of ovarian cancer?', 'Epithelial ovarian cancer accounts for ~90% of all ovarian malignancies.', 61) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Epithelial ovarian cancer', true, 1),(q_id, 'Germ cell tumour', false, 2),(q_id, 'Sex cord-stromal tumour', false, 3),(q_id, 'Metastatic cancer', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What does AFI stand for in obstetric ultrasound?', 'AFI = Amniotic Fluid Index, used to assess amniotic fluid volume.', 62) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Amniotic Fluid Index', true, 1),(q_id, 'Anterior Fetal Index', false, 2),(q_id, 'Amniotic Fundal Index', false, 3),(q_id, 'Abdominal Fetal Index', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is oligohydramnios?', 'Oligohydramnios is reduced amniotic fluid with AFI <5 cm or single deepest pocket <2 cm.', 63) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Reduced amniotic fluid (AFI < 5 cm)', true, 1),(q_id, 'Excess amniotic fluid', false, 2),(q_id, 'Normal amniotic fluid level', false, 3),(q_id, 'Ruptured membranes with normal fluid', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is polyhydramnios and with which fetal condition is it associated?', 'Polyhydramnios (AFI >25 cm) is associated with fetal anomalies like oesophageal atresia and anencephaly.', 64) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Excess amniotic fluid; associated with oesophageal atresia/anencephaly', true, 1),(q_id, 'Reduced fluid; associated with renal agenesis', false, 2),(q_id, 'Normal fluid; no association', false, 3),(q_id, 'Excess fluid; associated with IUGR', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is intrauterine growth restriction (IUGR)?', 'IUGR is when a fetus fails to reach its growth potential, resulting in EFW <10th centile for gestational age.', 65) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fetal weight < 10th centile for gestational age', true, 1),(q_id, 'Birth weight < 2.5 kg', false, 2),(q_id, 'Gestational age < 37 weeks', false, 3),(q_id, 'Fetal weight < 50th centile', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the umbilical artery Doppler used for in obstetric surveillance?', 'Umbilical artery Doppler assesses placental resistance and fetal well-being in IUGR.', 66) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Assess placental resistance and fetal well-being', true, 1),(q_id, 'Measure fetal weight', false, 2),(q_id, 'Diagnose placenta praevia', false, 3),(q_id, 'Confirm gestational age', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the mechanism of action of misoprostol?', 'Misoprostol is a prostaglandin E1 analogue that causes uterine contractions and cervical ripening.', 67) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Prostaglandin E1 analogue causing uterine contraction', true, 1),(q_id, 'Oxytocin receptor agonist', false, 2),(q_id, 'Beta-2 adrenergic agonist', false, 3),(q_id, 'Calcium channel blocker', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a vesico-vaginal fistula (VVF)?', 'VVF is an abnormal communication between the bladder and vagina, causing continuous urinary incontinence.', 68) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Abnormal connection between bladder and vagina', true, 1),(q_id, 'Prolapse of the bladder', false, 2),(q_id, 'Urinary tract infection', false, 3),(q_id, 'Vaginal cyst', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of VVF in Nigeria?', 'Prolonged obstructed labour causing pressure necrosis is the most common cause of obstetric fistula in Nigeria.', 69) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Prolonged obstructed labour', true, 1),(q_id, 'Gynaecological surgery', false, 2),(q_id, 'Radiation therapy', false, 3),(q_id, 'Malignancy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of menorrhagia?', 'Menorrhagia is heavy menstrual bleeding >80 mL per cycle or lasting >7 days.', 70) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Heavy menstrual bleeding > 80 mL per cycle', true, 1),(q_id, 'Bleeding between periods', false, 2),(q_id, 'Painful menstruation', false, 3),(q_id, 'Absence of menstruation', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is dysmenorrhoea?', 'Dysmenorrhoea is painful menstruation. Primary is without identifiable cause; secondary is due to pelvic pathology.', 71) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Painful menstruation', true, 1),(q_id, 'Absent menstruation', false, 2),(q_id, 'Irregular menstruation', false, 3),(q_id, 'Heavy menstrual bleeding', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What hormone maintains the corpus luteum in early pregnancy?', 'Beta-hCG secreted by the trophoblast maintains the corpus luteum and its progesterone production.', 72) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Beta-hCG', true, 1),(q_id, 'FSH', false, 2),(q_id, 'LH', false, 3),(q_id, 'Oestrogen', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the purpose of progesterone in early pregnancy?', 'Progesterone maintains the decidua and prevents uterine contractions in early pregnancy.', 73) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Maintains decidua and prevents contractions', true, 1),(q_id, 'Stimulates lactation', false, 2),(q_id, 'Triggers ovulation', false, 3),(q_id, 'Causes cervical ripening', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the name of the operation to remove the uterus?', 'Hysterectomy is surgical removal of the uterus.', 74) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Hysterectomy', true, 1),(q_id, 'Myomectomy', false, 2),(q_id, 'Oophorectomy', false, 3),(q_id, 'Salpingectomy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common indication for hysterectomy?', 'Uterine fibroids are the most common indication for hysterectomy worldwide and in Nigeria.', 75) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Uterine fibroids', true, 1),(q_id, 'Endometrial cancer', false, 2),(q_id, 'Ovarian cancer', false, 3),(q_id, 'Prolapse', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is puerperal pyrexia?', 'Puerperal pyrexia is a temperature ≥38°C on any 2 of the first 10 days postpartum (excluding the first 24 hours).', 76) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Temperature ≥38°C on 2 of first 10 postnatal days', true, 1),(q_id, 'Any fever within 24 hours of delivery', false, 2),(q_id, 'Fever due to breast engorgement only', false, 3),(q_id, 'Temperature >39°C after 2 weeks postpartum', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What are the 5 Ts of puerperal pyrexia?', 'The 5 Ts are: Tract (urinary), Tummy (endometritis), Tender breasts (mastitis), Thrombosis (DVT), Tonsils (URTI).', 77) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Tract, Tummy, Tender breasts, Thrombosis, Tonsils', true, 1),(q_id, 'Temperature, Tachycardia, Tenderness, Tear, Thrombocytopenia', false, 2),(q_id, 'Tract, Tissue, Thrombosis, Toxin, Temperature', false, 3),(q_id, 'Tummy, Temperature, Trauma, Tear, Toxaemia', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Kleihauer-Betke test used for?', 'The Kleihauer-Betke test detects fetal red blood cells in maternal circulation to quantify fetomaternal haemorrhage.', 78) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Detect fetal cells in maternal blood', true, 1),(q_id, 'Test for gestational diabetes', false, 2),(q_id, 'Detect chromosomal abnormalities', false, 3),(q_id, 'Assess placental function', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the difference between inevitable and incomplete abortion?', 'Inevitable abortion: cervix open, products still intact; Incomplete: some products of conception have passed.', 79) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Inevitable: os open, products intact; Incomplete: some products passed', true, 1),(q_id, 'Inevitable: os closed; Incomplete: os open with all products passed', false, 2),(q_id, 'They are identical', false, 3),(q_id, 'Inevitable occurs after 20 weeks; incomplete before 20 weeks', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a threatened abortion?', 'Threatened abortion: bleeding before 20 weeks with a closed cervical os and viable pregnancy on scan.', 80) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Bleeding < 20 weeks with closed os and viable fetus', true, 1),(q_id, 'Bleeding with open os and no products passed', false, 2),(q_id, 'Absent fetal heartbeat with closed os', false, 3),(q_id, 'Complete expulsion of products', false, 4);

-- Q81-100
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is meconium-stained amniotic fluid a sign of?', 'Meconium-stained liquor suggests fetal distress due to hypoxia causing relaxation of the anal sphincter.', 81) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fetal distress/hypoxia', true, 1),(q_id, 'Normal labour progress', false, 2),(q_id, 'Maternal infection', false, 3),(q_id, 'Placenta praevia', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the significance of absent end-diastolic flow on umbilical artery Doppler?', 'Absent end-diastolic flow indicates severe placental insufficiency and high risk of fetal demise.', 82) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Severe placental insufficiency', true, 1),(q_id, 'Normal variant', false, 2),(q_id, 'Mild fetal compromise', false, 3),(q_id, 'Polyhydramnios', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the modified biophysical profile?', 'Modified BPP uses the non-stress test (NST) + amniotic fluid index (AFI) as a quick fetal surveillance tool.', 83) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'NST + AFI', true, 1),(q_id, 'Full BPP without Doppler', false, 2),(q_id, 'Doppler + FHR only', false, 3),(q_id, 'BPP with maternal vital signs', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a non-stress test (NST)?', 'NST monitors FHR for accelerations associated with fetal movements over 20–40 minutes.', 84) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'FHR monitoring for accelerations with fetal movement', true, 1),(q_id, 'Maternal stress hormone test', false, 2),(q_id, 'Uterine contraction stress test', false, 3),(q_id, 'Fetal scalp blood sampling', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of first trimester bleeding?', 'Threatened or spontaneous abortion is the most common cause of first trimester bleeding.', 85) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Threatened/spontaneous abortion', true, 1),(q_id, 'Ectopic pregnancy', false, 2),(q_id, 'Cervical polyp', false, 3),(q_id, 'Implantation bleeding', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is Bandl''s ring?', 'Bandl''s ring is a pathological retraction ring between the upper and lower uterine segments, a sign of obstructed labour.', 86) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Pathological retraction ring in obstructed labour', true, 1),(q_id, 'Normal physiological ring', false, 2),(q_id, 'Cervical os at full dilation', false, 3),(q_id, 'Ring of placental tissue', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the difference between HELLP syndrome and pre-eclampsia?', 'HELLP syndrome is characterised by Haemolysis, Elevated Liver enzymes, and Low Platelets — a severe variant of pre-eclampsia.', 87) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'HELLP includes haemolysis, elevated liver enzymes, low platelets', true, 1),(q_id, 'HELLP has no hypertension', false, 2),(q_id, 'HELLP occurs only postpartum', false, 3),(q_id, 'They are identical conditions', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the management of HELLP syndrome?', 'Definitive treatment of HELLP is delivery; supportive care includes steroids, platelet transfusion if <50,000, and magnesium sulphate.', 88) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Delivery (definitive), steroids, magnesium sulphate', true, 1),(q_id, 'Conservative management until term', false, 2),(q_id, 'Antihypertensives alone', false, 3),(q_id, 'Heparin therapy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the classic triad of ectopic pregnancy?', 'Classic triad: amenorrhoea + lower abdominal pain + vaginal bleeding.', 89) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Amenorrhoea, lower abdominal pain, vaginal bleeding', true, 1),(q_id, 'Nausea, vomiting, shoulder tip pain', false, 2),(q_id, 'Fever, dysuria, adnexal mass', false, 3),(q_id, 'Hypertension, proteinuria, oedema', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is pelvic inflammatory disease (PID)?', 'PID is infection of the upper female genital tract including endometritis, salpingitis, and pelvic peritonitis.', 90) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Infection of upper female genital tract', true, 1),(q_id, 'Infection of the vagina only', false, 2),(q_id, 'Benign ovarian cyst', false, 3),(q_id, 'Uterine fibroid', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which organism most commonly causes PID?', 'Chlamydia trachomatis (and Neisseria gonorrhoeae) are the most common causative organisms of PID.', 91) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Chlamydia trachomatis', true, 1),(q_id, 'E. coli', false, 2),(q_id, 'Streptococcus pyogenes', false, 3),(q_id, 'Mycobacterium tuberculosis', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Fitz-Hugh-Curtis syndrome?', 'Fitz-Hugh-Curtis is perihepatitis (perihepatic adhesions) occurring as a complication of PID.', 92) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Perihepatitis complicating PID', true, 1),(q_id, 'Tubo-ovarian abscess', false, 2),(q_id, 'Bowel obstruction in PID', false, 3),(q_id, 'Septic emboli from PID', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common benign ovarian cyst in reproductive age?', 'Functional cysts (follicular and corpus luteum) are the most common benign ovarian cysts.', 93) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Functional cyst (follicular/corpus luteum)', true, 1),(q_id, 'Dermoid cyst', false, 2),(q_id, 'Endometrioma', false, 3),(q_id, 'Cystadenoma', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a Bartholin''s cyst?', 'A Bartholin''s cyst is a cystic swelling of the Bartholin gland due to blockage of its duct.', 94) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Blocked duct of Bartholin gland forming a cyst', true, 1),(q_id, 'Abscess of the greater vestibular gland', false, 2),(q_id, 'Cyst of the Skene gland', false, 3),(q_id, 'Vaginal inclusion cyst', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the treatment of a Bartholin''s abscess?', 'Treatment is incision and drainage (I&D) with marsupialization to prevent recurrence.', 95) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Incision, drainage, and marsupialization', true, 1),(q_id, 'Antibiotics alone', false, 2),(q_id, 'Excision of Bartholin gland', false, 3),(q_id, 'Needle aspiration only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is female genital mutilation (FGM)?', 'FGM is the partial or total removal of external female genitalia for non-medical reasons, common in West Africa.', 96) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Partial/total removal of female external genitalia for non-medical reasons', true, 1),(q_id, 'Surgical correction of ambiguous genitalia', false, 2),(q_id, 'Treatment of vaginal prolapse', false, 3),(q_id, 'Episiotomy during labour', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most important risk factor for uterine rupture?', 'Previous caesarean section (uterine scar) is the most important risk factor for uterine rupture.', 97) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Previous caesarean section scar', true, 1),(q_id, 'Primigravida', false, 2),(q_id, 'Maternal diabetes', false, 3),(q_id, 'Multiple pregnancy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the immediate management of uterine rupture?', 'Immediate laparotomy (repair or hysterectomy), resuscitation with IV fluids and blood transfusion.', 98) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Immediate laparotomy and resuscitation', true, 1),(q_id, 'Conservative management with oxytocin', false, 2),(q_id, 'Vacuum delivery', false, 3),(q_id, 'Caesarean section under general anaesthesia only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is precipitate labour?', 'Precipitate labour is labour lasting less than 3 hours from onset to delivery.', 99) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Labour lasting less than 3 hours', true, 1),(q_id, 'Labour lasting less than 1 hour', false, 2),(q_id, 'Labour lasting more than 24 hours', false, 3),(q_id, 'Labour with no contractions', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the third stage of labour?', 'The third stage is from delivery of the baby to expulsion of the placenta and membranes.', 100) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Delivery of placenta and membranes', true, 1),(q_id, 'Active pushing phase', false, 2),(q_id, 'Full cervical dilation', false, 3),(q_id, 'Onset of labour contractions', false, 4);

-- Q101-140
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is active management of the third stage of labour (AMTSL)?', 'AMTSL involves oxytocin 10 IU IM + controlled cord traction + uterine massage after placenta delivery.', 101) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Oxytocin + controlled cord traction + uterine massage', true, 1),(q_id, 'Waiting for spontaneous placental separation only', false, 2),(q_id, 'Immediate manual removal of placenta', false, 3),(q_id, 'Ergometrine alone', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the normal duration of the third stage of labour?', 'Third stage normally lasts up to 30 minutes; beyond this is considered prolonged and risks PPH.', 102) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Up to 30 minutes', true, 1),(q_id, 'Up to 1 hour', false, 2),(q_id, 'Up to 15 minutes', false, 3),(q_id, 'Up to 2 hours', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Mauriceau-Smellie-Veit manoeuvre used for?', 'It is used to deliver the aftercoming head in a breech presentation.', 103) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Delivery of aftercoming head in breech', true, 1),(q_id, 'Management of shoulder dystocia', false, 2),(q_id, 'Internal podalic version', false, 3),(q_id, 'Delivery of twins', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is external cephalic version (ECV)?', 'ECV is a procedure to turn a breech fetus to cephalic presentation by external manipulation of the abdomen.', 104) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'External turning of breech fetus to cephalic', true, 1),(q_id, 'Internal version under anaesthesia', false, 2),(q_id, 'C-section for breech presentation', false, 3),(q_id, 'Vacuum extraction of breech fetus', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is dichorionic-diamniotic (DCDA) twin pregnancy?', 'DCDA twins have separate chorions and amnions — each fetus has its own placenta, the least complicated twin type.', 105) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Separate chorions and amnions — two placentas', true, 1),(q_id, 'Shared chorion and amnion', false, 2),(q_id, 'Shared chorion but separate amnions', false, 3),(q_id, 'Conjoined twins', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is twin-to-twin transfusion syndrome (TTTS)?', 'TTTS occurs in monochorionic twins where blood is shunted from the donor to recipient twin through placental vascular anastomoses.', 106) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Blood shunted from donor to recipient via placental anastomoses', true, 1),(q_id, 'Anaemia affecting both twins equally', false, 2),(q_id, 'Infection in one twin only', false, 3),(q_id, 'Twin reversed arterial perfusion', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the antihypertensive of choice in pregnancy?', 'Methyldopa is the antihypertensive of first choice in pregnancy; labetalol and nifedipine are also used.', 107) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Methyldopa', true, 1),(q_id, 'ACE inhibitors', false, 2),(q_id, 'Furosemide', false, 3),(q_id, 'Atenolol', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Why are ACE inhibitors contraindicated in pregnancy?', 'ACE inhibitors cause fetal renal dysplasia, oligohydramnios, and neonatal renal failure especially in 2nd/3rd trimester.', 108) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fetal renal dysplasia and oligohydramnios', true, 1),(q_id, 'They are not contraindicated', false, 2),(q_id, 'They cause maternal hepatotoxicity', false, 3),(q_id, 'They cause premature labour', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Partograph used for?', 'The partograph is a labour monitoring tool that charts cervical dilation, fetal head descent, FHR, and contractions against time.', 109) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Monitoring labour progress', true, 1),(q_id, 'Antenatal fetal surveillance', false, 2),(q_id, 'Recording antenatal blood pressure', false, 3),(q_id, 'Postpartum haemorrhage monitoring', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the normal cervical dilation rate in active phase of labour?', 'Normal progress is at least 1 cm/hour during the active phase (from 4–10 cm) of labour.', 110) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '≥1 cm per hour', true, 1),(q_id, '0.5 cm per hour', false, 2),(q_id, '2 cm per hour minimum', false, 3),(q_id, '3 cm per hour', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of prolonged labour?', 'Prolonged labour: total duration >18 hours in primigravida or >12 hours in multigravida.', 111) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '>18 hours (primi) or >12 hours (multi)', true, 1),(q_id, '>24 hours in all women', false, 2),(q_id, '>6 hours total', false, 3),(q_id, '>10 hours in any woman', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is colostrum and when is it produced?', 'Colostrum is the first milk produced from the last trimester of pregnancy and the first few postnatal days; it is rich in IgA and antibodies.', 112) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'First milk from late pregnancy; rich in IgA', true, 1),(q_id, 'Mature breast milk at 6 weeks', false, 2),(q_id, 'Formula substitute', false, 3),(q_id, 'Milk produced only after caesarean section', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What hormone is responsible for milk ejection (let-down reflex)?', 'Oxytocin released from the posterior pituitary causes milk ejection (let-down).', 113) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Oxytocin', true, 1),(q_id, 'Prolactin', false, 2),(q_id, 'Oestrogen', false, 3),(q_id, 'Progesterone', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What hormone stimulates milk production?', 'Prolactin from the anterior pituitary stimulates milk synthesis (lactogenesis).', 114) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Prolactin', true, 1),(q_id, 'Oxytocin', false, 2),(q_id, 'FSH', false, 3),(q_id, 'hCG', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of maternal death from anaesthetic complications in obstetrics?', 'Failed intubation leading to hypoxia is the leading anaesthetic cause of maternal death in obstetrics.', 115) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Failed intubation and hypoxia', true, 1),(q_id, 'Spinal headache', false, 2),(q_id, 'Drug allergy', false, 3),(q_id, 'Aspiration of gastric contents (Mendelson syndrome)', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is Mendelson syndrome?', 'Mendelson syndrome is aspiration of acidic gastric contents causing chemical pneumonitis.', 116) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Aspiration of gastric acid causing chemical pneumonitis', true, 1),(q_id, 'Pulmonary embolism in pregnancy', false, 2),(q_id, 'Amniotic fluid embolism', false, 3),(q_id, 'Airway oedema in pre-eclampsia', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of antepartum haemorrhage?', 'Placenta praevia and abruptio placentae are the two most common causes of APH; placenta praevia is the single most common.', 117) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Placenta praevia', true, 1),(q_id, 'Cervical polyp', false, 2),(q_id, 'Vasa praevia', false, 3),(q_id, 'Show (bloody show)', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is vasa praevia?', 'Vasa praevia is fetal blood vessels crossing or running near the internal cervical os, at risk of rupture during labour.', 118) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fetal vessels crossing the internal cervical os', true, 1),(q_id, 'Placenta lying over the os', false, 2),(q_id, 'Velamentous cord insertion only', false, 3),(q_id, 'Abnormally adherent placenta', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is placenta accreta?', 'Placenta accreta is abnormal trophoblastic invasion into the myometrium without penetrating it.', 119) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Trophoblast invades into myometrium', true, 1),(q_id, 'Placenta over the cervical os', false, 2),(q_id, 'Placenta separated prematurely', false, 3),(q_id, 'Calcified placenta', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the difference between placenta accreta, increta, and percreta?', 'Accreta: into myometrium; Increta: into myometrium deeply; Percreta: through myometrium into adjacent organs.', 120) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Accreta: into; Increta: deep into; Percreta: through myometrium', true, 1),(q_id, 'They are all the same condition', false, 2),(q_id, 'Percreta is less severe than accreta', false, 3),(q_id, 'Increta involves only the decidua', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is postpartum psychosis?', 'Postpartum psychosis is a severe mental illness with hallucinations, delusions, and confusion within 2 weeks of delivery.', 121) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Severe mental illness within 2 weeks postpartum with psychotic features', true, 1),(q_id, 'Mild postnatal blues', false, 2),(q_id, 'Postnatal depression', false, 3),(q_id, 'Anxiety disorder after delivery', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What are the risk factors for postnatal depression?', 'Risk factors include previous depression, lack of social support, difficult delivery, and adverse life events.', 122) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Previous depression, poor social support, adverse life events', true, 1),(q_id, 'Normal vaginal delivery', false, 2),(q_id, 'Breastfeeding', false, 3),(q_id, 'First pregnancy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What screening tool is used for postnatal depression?', 'The Edinburgh Postnatal Depression Scale (EPDS) is the standard validated screening tool.', 123) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Edinburgh Postnatal Depression Scale (EPDS)', true, 1),(q_id, 'PHQ-9', false, 2),(q_id, 'GAD-7', false, 3),(q_id, 'HAD scale', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is lochia and what does a change in its character indicate?', 'Lochia is post-delivery uterine discharge. Lochia rubra → serosa → alba. Offensive lochia suggests endometritis.', 124) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Postpartum uterine discharge; offensive smell suggests infection', true, 1),(q_id, 'Normal menstrual period', false, 2),(q_id, 'Breastfeeding-induced discharge', false, 3),(q_id, 'Cervical mucus after delivery', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Spalding sign on X-ray?', 'Spalding sign is overlapping of fetal skull bones on X-ray, indicating intrauterine fetal death.', 125) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Overlapping of fetal skull bones indicating fetal death', true, 1),(q_id, 'Calcified placenta', false, 2),(q_id, 'Hydrocephalus', false, 3),(q_id, 'Normal fetal growth', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is uterine inversion?', 'Uterine inversion is when the uterus turns inside out, either partially or completely, usually during the third stage.', 126) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Uterus turning inside out during/after delivery', true, 1),(q_id, 'Uterine prolapse after delivery', false, 2),(q_id, 'Retroversion of the uterus', false, 3),(q_id, 'Uterine atony with haemorrhage', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the emergency treatment of acute uterine inversion?', 'Johnson''s manoeuvre (manual replacement) with immediate resuscitation; tocolytics may be used to relax the uterus.', 127) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Manual replacement (Johnson manoeuvre) and resuscitation', true, 1),(q_id, 'Immediate hysterectomy', false, 2),(q_id, 'Oxytocin infusion', false, 3),(q_id, 'Observation only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of obstetric fistula in sub-Saharan Africa?', 'Prolonged obstructed labour causing ischaemic pressure necrosis of the vesicovaginal wall is the most common cause.', 128) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Prolonged obstructed labour', true, 1),(q_id, 'Surgical trauma', false, 2),(q_id, 'Radiation injury', false, 3),(q_id, 'Malignancy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Braxton Hicks contractions?', 'Braxton Hicks are irregular, painless uterine contractions occurring throughout pregnancy, more noticeable in the third trimester.', 129) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Irregular painless practice contractions throughout pregnancy', true, 1),(q_id, 'Painful contractions heralding labour', false, 2),(q_id, 'Contractions only in first trimester', false, 3),(q_id, 'Signs of preterm labour', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of stillbirth?', 'Stillbirth: birth of a baby with no signs of life at or after 28 weeks (WHO) or 500g in Nigeria.', 130) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Baby born with no signs of life at ≥28 weeks', true, 1),(q_id, 'Baby who dies within 24 hours of birth', false, 2),(q_id, 'Baby born before 20 weeks without signs of life', false, 3),(q_id, 'Baby with Apgar score of 0 at 5 minutes', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the recommended interval between pregnancies (interpregnancy interval)?', 'WHO recommends at least 24 months (2 years) between delivery and next conception.', 131) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'At least 24 months', true, 1),(q_id, 'At least 6 months', false, 2),(q_id, 'At least 12 months', false, 3),(q_id, 'No recommendation', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the copper IUD mechanism of action?', 'Copper ions are spermicidal and the IUD also prevents implantation by creating a foreign body reaction.', 132) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Copper ions are spermicidal and prevent implantation', true, 1),(q_id, 'Inhibits ovulation', false, 2),(q_id, 'Thickens cervical mucus only', false, 3),(q_id, 'Causes luteal phase defect', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the combined oral contraceptive pill''s primary mechanism?', 'The COCP primarily inhibits ovulation via negative feedback on the hypothalamic-pituitary axis.', 133) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Inhibits ovulation', true, 1),(q_id, 'Prevents implantation only', false, 2),(q_id, 'Causes permanent sterility', false, 3),(q_id, 'Thickens cervical mucus only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Pearl Index?', 'The Pearl Index is the number of pregnancies per 100 woman-years of contraceptive use — a measure of contraceptive efficacy.', 134) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Pregnancies per 100 woman-years of use', true, 1),(q_id, 'Cost of contraceptive per user', false, 2),(q_id, 'Duration of contraceptive action', false, 3),(q_id, 'Failure rate per single use', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which contraceptive method has the lowest Pearl Index (most effective)?', 'Implants (e.g. Nexplanon) and IUDs have Pearl Indices <1, making them most effective (LARC methods).', 135) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Implants and IUDs (LARC methods)', true, 1),(q_id, 'Condoms', false, 2),(q_id, 'Diaphragm', false, 3),(q_id, 'Calendar method', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is emergency contraception and what is the window period?', 'Emergency contraception (e.g. levonorgestrel) must be taken within 72 hours of unprotected intercourse.', 136) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Contraception taken within 72 hours of unprotected sex', true, 1),(q_id, 'Regular daily contraceptive pill', false, 2),(q_id, 'Taken within 7 days', false, 3),(q_id, 'Only effective if taken before intercourse', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the lactational amenorrhoea method (LAM)?', 'LAM relies on exclusive breastfeeding-induced prolactin inhibiting GnRH, suppressing ovulation — effective for 6 months if fully breastfeeding.', 137) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Exclusive breastfeeding suppressing ovulation for 6 months', true, 1),(q_id, 'Calendar-based method', false, 2),(q_id, 'Barrier method used during lactation', false, 3),(q_id, 'Hormonal pill taken during breastfeeding', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is infertility and how is primary different from secondary?', 'Primary infertility: never conceived; Secondary: previously conceived but unable to conceive again. Infertility is defined as failure to conceive after 12 months of regular unprotected intercourse.', 138) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Primary: never conceived; Secondary: prior conception but cannot conceive now', true, 1),(q_id, 'Primary: male factor; Secondary: female factor', false, 2),(q_id, 'They are the same', false, 3),(q_id, 'Primary: <6 months; Secondary: >12 months', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common cause of infertility in Nigeria?', 'Tubal factor infertility (due to PID, STIs, and post-septic abortion) is the most common cause of female infertility in Nigeria.', 139) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Tubal factor (PID/STI/post-abortion)', true, 1),(q_id, 'Ovulatory disorders', false, 2),(q_id, 'Uterine fibroids', false, 3),(q_id, 'Endometriosis', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is hysterosalpingography (HSG)?', 'HSG is an X-ray contrast study to evaluate the uterine cavity and tubal patency in the investigation of infertility.', 140) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'X-ray to assess uterine cavity and tubal patency', true, 1),(q_id, 'Ultrasound of the uterus', false, 2),(q_id, 'Endometrial biopsy', false, 3),(q_id, 'Hysteroscopy alone', false, 4);

-- Q141-160
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the clomiphene citrate challenge test used for?', 'It is used to assess ovarian reserve by testing FSH response to clomiphene stimulation.', 141) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Assess ovarian reserve', true, 1),(q_id, 'Stimulate ovulation for IVF', false, 2),(q_id, 'Treat PCOS', false, 3),(q_id, 'Diagnose endometriosis', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is in vitro fertilisation (IVF)?', 'IVF is fertilisation of an egg by sperm outside the body, followed by transfer of the embryo to the uterus.', 142) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fertilisation outside the body with embryo transfer to uterus', true, 1),(q_id, 'Surgical correction of tubal blockage', false, 2),(q_id, 'Intrauterine insemination of sperm', false, 3),(q_id, 'Hormone treatment to stimulate ovulation', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of menopause?', 'Menopause is the permanent cessation of menstruation for 12 consecutive months, due to depletion of ovarian follicles.', 143) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '12 months of amenorrhoea due to ovarian failure', true, 1),(q_id, 'Irregular periods after age 40', false, 2),(q_id, 'FSH level >30 IU/L only', false, 3),(q_id, 'Any cessation of periods', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the average age of menopause?', 'The average age of menopause in Nigeria is approximately 48–50 years.', 144) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '48–50 years', true, 1),(q_id, '40–42 years', false, 2),(q_id, '55–60 years', false, 3),(q_id, '35–38 years', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is premature ovarian insufficiency (POI)?', 'POI is loss of normal ovarian function before age 40, resulting in amenorrhoea and elevated FSH.', 145) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Ovarian failure before age 40', true, 1),(q_id, 'Menopause at age 45', false, 2),(q_id, 'PCOS in young women', false, 3),(q_id, 'Ovarian hyperstimulation syndrome', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is hormone replacement therapy (HRT) and what are its risks?', 'HRT replaces oestrogen (±progesterone) in menopause. Risks include breast cancer, DVT, and stroke with long-term combined HRT.', 146) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Oestrogen replacement; risks include breast cancer and DVT', true, 1),(q_id, 'Contraceptive pill for older women', false, 2),(q_id, 'Growth hormone therapy', false, 3),(q_id, 'Treatment with no side effects', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is uterine prolapse?', 'Uterine prolapse is descent of the uterus into or beyond the vaginal canal due to weakened pelvic floor supports.', 147) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Descent of uterus into or beyond vaginal canal', true, 1),(q_id, 'Fibroids pressing through the cervix', false, 2),(q_id, 'Inversion of the uterus', false, 3),(q_id, 'Endometrial polyp at the cervix', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What operation is performed for uterine prolapse in a woman who has completed childbearing?', 'Vaginal hysterectomy with pelvic floor repair (colporrhaphy) is the definitive treatment.', 148) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Vaginal hysterectomy with pelvic floor repair', true, 1),(q_id, 'Abdominal hysterectomy only', false, 2),(q_id, 'Pelvic floor exercises only', false, 3),(q_id, 'Ring pessary (definitive)', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a rectocele?', 'A rectocele is herniation of the rectum into the posterior vaginal wall.', 149) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Rectum herniating into the posterior vaginal wall', true, 1),(q_id, 'Bladder herniation into the anterior vaginal wall', false, 2),(q_id, 'Uterus descending into the vagina', false, 3),(q_id, 'Small bowel herniation into the vagina', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a cystocele?', 'A cystocele is herniation of the bladder into the anterior vaginal wall.', 150) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Bladder herniating into the anterior vaginal wall', true, 1),(q_id, 'Rectum herniating posteriorly', false, 2),(q_id, 'Uterine prolapse', false, 3),(q_id, 'Urethral prolapse', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is stress urinary incontinence?', 'Stress incontinence is involuntary urine leakage on exertion (coughing, sneezing, exercise) due to urethral sphincter weakness.', 151) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Urine leakage on coughing/sneezing due to sphincter weakness', true, 1),(q_id, 'Involuntary urge to urinate', false, 2),(q_id, 'Continuous urine dribbling', false, 3),(q_id, 'Inability to initiate urination', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Sim''s position used for in gynaecology?', 'Sims'' position (left lateral) is used for vaginal examination and speculum insertion to assess pelvic organ prolapse.', 152) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Assess pelvic organ prolapse', true, 1),(q_id, 'Abdominal examination', false, 2),(q_id, 'Rectal examination', false, 3),(q_id, 'Cervical biopsy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a Sim''s speculum used for?', 'Sims'' speculum is used to depress the posterior vaginal wall for examining the anterior wall and cervix.', 153) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Examine anterior vaginal wall and cervix', true, 1),(q_id, 'Deliver the baby', false, 2),(q_id, 'Dilate the cervix', false, 3),(q_id, 'Perform colposcopy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the treatment of choice for gestational trophoblastic disease (GTD) confined to the uterus?', 'Single-agent chemotherapy (methotrexate or actinomycin D) is used for low-risk GTD after evacuation.', 154) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Single-agent chemotherapy (methotrexate)', true, 1),(q_id, 'Radiotherapy', false, 2),(q_id, 'Observation only', false, 3),(q_id, 'Immediate hysterectomy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is Asherman syndrome?', 'Asherman syndrome is intrauterine adhesions (synechiae) causing amenorrhoea, usually following uterine instrumentation.', 155) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Intrauterine adhesions causing amenorrhoea', true, 1),(q_id, 'Endometrial hyperplasia', false, 2),(q_id, 'Cervical stenosis', false, 3),(q_id, 'Polycystic ovaries', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the treatment of Asherman syndrome?', 'Hysteroscopic lysis of adhesions (hysteroscopic adhesiolysis) is the treatment.', 156) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Hysteroscopic lysis of adhesions', true, 1),(q_id, 'D&C alone', false, 2),(q_id, 'Hormone therapy alone', false, 3),(q_id, 'Laparoscopy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common site of endometriosis deposits?', 'The ovaries (forming endometriomas or "chocolate cysts") are the most common site.', 157) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Ovaries (chocolate cysts)', true, 1),(q_id, 'Bladder', false, 2),(q_id, 'Rectosigmoid colon', false, 3),(q_id, 'Appendix', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is ovarian hyperstimulation syndrome (OHSS)?', 'OHSS is an exaggerated response to ovarian stimulation (e.g. for IVF), causing enlarged ovaries, fluid shifts, ascites, and thrombosis risk.', 158) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Exaggerated response to ovulation induction with ascites and fluid shifts', true, 1),(q_id, 'Normal response to clomiphene', false, 2),(q_id, 'Ovarian torsion', false, 3),(q_id, 'Functional cyst rupture', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is ovarian torsion and how does it present?', 'Ovarian torsion is twisting of the ovary on its pedicle causing sudden severe unilateral pelvic pain, often with nausea/vomiting.', 159) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Sudden severe unilateral pelvic pain with nausea from twisted ovary', true, 1),(q_id, 'Chronic bilateral pelvic pain', false, 2),(q_id, 'Painless pelvic mass', false, 3),(q_id, 'Vaginal bleeding with no pain', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the treatment of ovarian torsion?', 'Emergency laparoscopy with detorsion (untwisting) — and salpingo-oophorectomy if the ovary is non-viable.', 160) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Emergency laparoscopy with detorsion', true, 1),(q_id, 'Conservative management with analgesia', false, 2),(q_id, 'IV antibiotics', false, 3),(q_id, 'Hormonal suppression', false, 4);

-- Q161-200
INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is precocious puberty?', 'Precocious puberty is sexual development before age 8 in girls or 9 in boys.', 161) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Sexual development before age 8 (girls) or 9 (boys)', true, 1),(q_id, 'Puberty after age 16', false, 2),(q_id, 'Primary amenorrhoea', false, 3),(q_id, 'Normal puberty onset', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Turner syndrome karyotype?', 'Turner syndrome karyotype is 45,X (monosomy X) causing primary amenorrhoea, short stature, and streak gonads.', 162) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '45,X', true, 1),(q_id, '46,XX', false, 2),(q_id, '47,XXX', false, 3),(q_id, '46,XY', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is androgen insensitivity syndrome (AIS)?', 'AIS is 46,XY individual with female phenotype due to end-organ resistance to androgens; presents with primary amenorrhoea and absent uterus.', 163) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '46,XY with female phenotype due to androgen resistance', true, 1),(q_id, '46,XX with excess androgens', false, 2),(q_id, 'Turner syndrome variant', false, 3),(q_id, 'Congenital adrenal hyperplasia', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is congenital adrenal hyperplasia (CAH)?', 'CAH is 21-hydroxylase deficiency causing excess androgens, virilisation of female genitalia, and salt-wasting crisis in neonates.', 164) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, '21-hydroxylase deficiency causing virilisation and salt-wasting', true, 1),(q_id, 'Excess oestrogen production', false, 2),(q_id, 'Turner syndrome', false, 3),(q_id, 'Primary ovarian failure', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the FIGO staging system used for?', 'FIGO (International Federation of Gynecology and Obstetrics) staging is used for gynaecological cancers including cervical, endometrial, and ovarian.', 165) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Staging gynaecological cancers', true, 1),(q_id, 'Grading fibroid severity', false, 2),(q_id, 'Classifying labour dystocia', false, 3),(q_id, 'Scoring antenatal risk', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the WHO definition of maternal death?', 'Maternal death: death of a woman during pregnancy or within 42 days of termination of pregnancy from causes related to pregnancy.', 166) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Death during pregnancy or within 42 days of delivery from pregnancy-related causes', true, 1),(q_id, 'Death within 24 hours of delivery', false, 2),(q_id, 'Death within 1 year of delivery from any cause', false, 3),(q_id, 'Death due to haemorrhage only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the maternal mortality ratio (MMR)?', 'MMR = number of maternal deaths per 100,000 live births.', 167) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Maternal deaths per 100,000 live births', true, 1),(q_id, 'Maternal deaths per 1,000 women', false, 2),(q_id, 'Maternal deaths per 1,000 pregnancies', false, 3),(q_id, 'Maternal deaths per 100 deliveries', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is abruption with a Couvelaire uterus?', 'Couvelaire uterus (uteroplacental apoplexy) occurs when blood extravasates into the myometrium causing a woody, bruised appearance.', 168) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Blood extravasation into myometrium from severe abruption', true, 1),(q_id, 'Normal placental separation', false, 2),(q_id, 'Uterine atony with bleeding', false, 3),(q_id, 'Post-CS uterine scar dehiscence', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the first antenatal visit recommended for?', 'First antenatal visit should be before 10 weeks for booking, dating scan, booking blood tests, and risk assessment.', 169) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Before 10 weeks for booking and dating', true, 1),(q_id, '20 weeks for anomaly scan', false, 2),(q_id, '28 weeks for GTT', false, 3),(q_id, '36 weeks for delivery planning', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'How many antenatal visits does WHO recommend for an uncomplicated pregnancy?', 'WHO recommends a minimum of 8 antenatal contacts for a positive pregnancy experience (2016 guidelines).', 170) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Minimum 8 contacts', true, 1),(q_id, 'Minimum 4 contacts', false, 2),(q_id, 'Monthly visits only', false, 3),(q_id, 'Weekly from 36 weeks', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the anomaly scan and at what gestational age is it done?', 'The anomaly scan (mid-trimester scan) is performed at 18–20 weeks to detect structural fetal anomalies.', 171) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Structural anomaly detection scan at 18–20 weeks', true, 1),(q_id, 'Dating scan at 12 weeks', false, 2),(q_id, 'Growth scan at 28 weeks', false, 3),(q_id, 'Nuchal translucency at 16 weeks', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is nuchal translucency (NT) and what does an increased NT suggest?', 'NT is fluid behind fetal neck on 11–14 week scan. Increased NT (>3.5 mm) suggests chromosomal abnormality (e.g. Down syndrome).', 172) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fluid behind fetal neck; increased NT suggests chromosomal abnormality', true, 1),(q_id, 'Fetal weight measurement', false, 2),(q_id, 'Placental localisation', false, 3),(q_id, 'Amniotic fluid assessment', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is amniocentesis?', 'Amniocentesis is sampling of amniotic fluid (usually at 15–20 weeks) for chromosomal analysis.', 173) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Sampling amniotic fluid for chromosomal analysis', true, 1),(q_id, 'Fetal blood sampling', false, 2),(q_id, 'Placental biopsy', false, 3),(q_id, 'Cervical smear', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is chorionic villus sampling (CVS)?', 'CVS involves biopsy of the placenta (chorionic villi) at 10–13 weeks for early chromosomal diagnosis.', 174) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Placental biopsy at 10–13 weeks for early chromosomal diagnosis', true, 1),(q_id, 'Amniocentesis at 10 weeks', false, 2),(q_id, 'Fetal blood sampling', false, 3),(q_id, 'Uterine artery biopsy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common fetal chromosomal abnormality?', 'Trisomy 21 (Down syndrome) is the most common live-born chromosomal abnormality.', 175) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Trisomy 21 (Down syndrome)', true, 1),(q_id, 'Turner syndrome', false, 2),(q_id, 'Trisomy 18 (Edwards)', false, 3),(q_id, 'Klinefelter syndrome', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the quadruple screening test in pregnancy?', 'Quad screen measures AFP, hCG, unconjugated oestriol, and inhibin A at 15–20 weeks to screen for Down syndrome and NTDs.', 176) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'AFP, hCG, oestriol, inhibin A to screen for Down syndrome/NTDs', true, 1),(q_id, 'Blood glucose and HbA1c', false, 2),(q_id, 'Renal and liver function tests', false, 3),(q_id, 'Thyroid function tests', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of macrosomia?', 'Macrosomia is a birth weight >4000 g (some use >4500 g) regardless of gestational age.', 177) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Birth weight > 4000 g', true, 1),(q_id, 'Birth weight > 3500 g', false, 2),(q_id, 'Weight >95th centile only', false, 3),(q_id, 'Birth weight > 5000 g', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the symphysis-fundal height (SFH) and when does it equal gestational age in weeks?', 'SFH in cm ≈ gestational age in weeks (±2 cm) from 20 weeks onwards.', 178) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'SFH in cm ≈ gestational age in weeks from 20 weeks', true, 1),(q_id, 'Always equals gestational age exactly', false, 2),(q_id, 'Only valid before 20 weeks', false, 3),(q_id, 'SFH equals fetal weight in grams', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common form of malpresentation in labour?', 'Breech presentation (3–4% at term) is the most common malpresentation.', 179) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Breech presentation', true, 1),(q_id, 'Face presentation', false, 2),(q_id, 'Brow presentation', false, 3),(q_id, 'Compound presentation', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common type of breech presentation?', 'Frank breech (hips flexed, knees extended) is the most common type of breech presentation.', 180) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Frank breech (extended legs)', true, 1),(q_id, 'Complete breech (flexed legs)', false, 2),(q_id, 'Footling breech', false, 3),(q_id, 'Knee breech', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is brow presentation and why is it significant?', 'Brow presentation (largest diameter presenting) cannot deliver vaginally in most cases and requires caesarean section.', 181) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Largest diameter presenting — almost always requires CS', true, 1),(q_id, 'Smallest diameter — always delivers vaginally', false, 2),(q_id, 'Same management as vertex presentation', false, 3),(q_id, 'Managed with forceps', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is cord prolapse?', 'Cord prolapse is when the umbilical cord descends below the presenting part through the os, causing life-threatening cord compression.', 182) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Umbilical cord descending below presenting part through the os', true, 1),(q_id, 'Nuchal cord only', false, 2),(q_id, 'Cord around fetal neck', false, 3),(q_id, 'Short cord preventing descent', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the immediate management of cord prolapse?', 'Manual elevation of presenting part off cord + immediate emergency caesarean section (or instrumental delivery if fully dilated).', 183) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Elevate presenting part + emergency CS', true, 1),(q_id, 'Expectant management', false, 2),(q_id, 'Oxytocin augmentation', false, 3),(q_id, 'Tocolysis alone', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the definition of post-term pregnancy?', 'Post-term pregnancy is pregnancy extending beyond 42 completed weeks (294 days) of gestation.', 184) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Pregnancy beyond 42 completed weeks', true, 1),(q_id, 'Pregnancy beyond 40 weeks', false, 2),(q_id, 'Pregnancy beyond 38 weeks', false, 3),(q_id, 'Pregnancy beyond 44 weeks', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What are the maternal risks of post-term pregnancy?', 'Maternal risks include increased need for induction, instrumental delivery, perineal trauma, caesarean section, and psychological distress.', 185) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Increased induction, instrumental delivery, and CS rates', true, 1),(q_id, 'Reduced risk of complications', false, 2),(q_id, 'Preterm birth risk', false, 3),(q_id, 'No increased maternal risk', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is placenta percreta and its most feared complication?', 'Placenta percreta penetrates through the myometrium into adjacent organs (bladder) — most feared complication is massive haemorrhage.', 186) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Penetrates through myometrium; massive haemorrhage risk', true, 1),(q_id, 'Superficial implantation with easy separation', false, 2),(q_id, 'Same as placenta praevia', false, 3),(q_id, 'Only occurs with previous myomectomy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is amniotic fluid embolism (AFE)?', 'AFE is entry of amniotic fluid into maternal circulation causing anaphylactoid reaction with cardiovascular collapse, coagulopathy, and DIC.', 187) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Amniotic fluid in maternal circulation causing cardiovascular collapse and DIC', true, 1),(q_id, 'Air embolism during delivery', false, 2),(q_id, 'Pulmonary embolism from DVT', false, 3),(q_id, 'Fat embolism from pelvic fracture', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is septic abortion?', 'Septic abortion is a uterine infection following abortion (spontaneous or induced), characterised by fever, offensive discharge, and uterine tenderness.', 188) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Uterine infection following abortion with fever and offensive discharge', true, 1),(q_id, 'Normal post-abortion bleeding', false, 2),(q_id, 'Ectopic pregnancy complicated by infection', false, 3),(q_id, 'Septicaemia unrelated to abortion', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common organism causing septic abortion?', 'E. coli and other gram-negative organisms (also Clostridium in illegal abortions) commonly cause septic abortion.', 189) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'E. coli and gram-negative organisms', true, 1),(q_id, 'Streptococcus only', false, 2),(q_id, 'Chlamydia trachomatis', false, 3),(q_id, 'Treponema pallidum', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the management of septic abortion?', 'IV antibiotics (broad spectrum) + surgical evacuation of the uterus.', 190) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'IV antibiotics and surgical uterine evacuation', true, 1),(q_id, 'Oral antibiotics alone', false, 2),(q_id, 'Observation only', false, 3),(q_id, 'Oxytocin infusion alone', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is a hydatidiform mole?', 'A hydatidiform mole is an abnormal conception with trophoblastic proliferation and grape-like vesicles; part of gestational trophoblastic disease.', 191) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Abnormal conception with trophoblastic proliferation and grape-like vesicles', true, 1),(q_id, 'Normal early pregnancy', false, 2),(q_id, 'Dermoid ovarian cyst', false, 3),(q_id, 'Bicornuate uterus', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is choriocarcinoma?', 'Choriocarcinoma is a malignant gestational trophoblastic tumour that can metastasise widely but is highly chemosensitive.', 192) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Malignant trophoblastic tumour, highly chemosensitive', true, 1),(q_id, 'Benign trophoblastic disease', false, 2),(q_id, 'Cervical cancer', false, 3),(q_id, 'Germ cell tumour of the ovary', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is haemolytic disease of the newborn (HDN)?', 'HDN is destruction of fetal/neonatal RBCs by maternal antibodies (especially anti-D IgG) crossing the placenta.', 193) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Maternal antibodies destroying fetal RBCs', true, 1),(q_id, 'Neonatal infection causing anaemia', false, 2),(q_id, 'G6PD deficiency in newborn', false, 3),(q_id, 'Vitamin K deficiency haemorrhage', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the purpose of the oral glucose tolerance test (OGTT) in pregnancy?', 'OGTT (75g at 24–28 weeks) is used to diagnose gestational diabetes mellitus.', 194) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Diagnose gestational diabetes at 24–28 weeks', true, 1),(q_id, 'Screen for pre-eclampsia', false, 2),(q_id, 'Assess placental function', false, 3),(q_id, 'Test fetal lung maturity', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the difference between direct and indirect obstetric death?', 'Direct: from obstetric complications (e.g. haemorrhage); Indirect: aggravated by pregnancy (e.g. cardiac disease).', 195) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Direct: obstetric complications; Indirect: pre-existing disease aggravated by pregnancy', true, 1),(q_id, 'Direct: before delivery; Indirect: after delivery', false, 2),(q_id, 'They mean the same', false, 3),(q_id, 'Direct: surgical; Indirect: medical', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'Which antibiotic is used for GBS prophylaxis in labour?', 'Intravenous benzylpenicillin (IV penicillin G) is the drug of choice for Group B Streptococcus prophylaxis in labour.', 196) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'IV benzylpenicillin (Penicillin G)', true, 1),(q_id, 'Oral amoxicillin', false, 2),(q_id, 'Metronidazole', false, 3),(q_id, 'Ceftriaxone', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the Zika virus complication in pregnancy?', 'Zika virus infection in pregnancy causes microcephaly and other fetal brain abnormalities.', 197) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Fetal microcephaly and brain abnormalities', true, 1),(q_id, 'Maternal death', false, 2),(q_id, 'Gestational diabetes', false, 3),(q_id, 'Preterm labour only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is cytomegalovirus (CMV) and its importance in pregnancy?', 'CMV is the most common congenital viral infection; it can cause sensorineural deafness, chorioretinitis, and intellectual disability.', 198) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Most common congenital viral infection causing deafness and disability', true, 1),(q_id, 'Benign viral illness in pregnancy', false, 2),(q_id, 'Causes only maternal fever', false, 3),(q_id, 'Associated with maternal hepatitis only', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is TORCH complex?', 'TORCH: Toxoplasma, Others (syphilis, varicella, parvovirus), Rubella, CMV, Herpes — all cause congenital infections.', 199) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Toxoplasma, Others, Rubella, CMV, Herpes — congenital infections', true, 1),(q_id, 'Thyroid disorders in pregnancy', false, 2),(q_id, 'Sexually transmitted infections in adults', false, 3),(q_id, 'Teratogenic drugs in pregnancy', false, 4);

INSERT INTO quiz_questions (quiz_id, question_text, explanation, order_index) VALUES (qz_id, 'What is the most common indication for caesarean section in Nigeria?', 'Previous caesarean section (repeat CS) is the most common indication for caesarean section in Nigeria.', 200) RETURNING id INTO q_id;
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (q_id, 'Previous caesarean section', true, 1),(q_id, 'Fetal distress', false, 2),(q_id, 'Placenta praevia', false, 3),(q_id, 'Malpresentation', false, 4);

-- Update total_questions count
UPDATE quizzes SET total_questions = 200 WHERE id = qz_id;

END $$;
