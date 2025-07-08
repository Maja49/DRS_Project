-- Insert podaci za User
INSERT INTO "User" (id, name, lastname, adress, city, country, phone_number, email, password, username, is_admin, is_approved, is_first_login) VALUES
(2,'Natalija','Celic','Nova Adresa 888','Banjaluka','Serbia','1234567890','natali@example.com','scrypt:32768:8:1$3nSlvX2NOByIaREp$5c1b37711eba72edbd4826bf82aedf25f8c0d9166f5284d74082194b357c7f22612006dbeea0bf7a86155242820eeb8533fd515fe611465f4561d70c753ab7b0','natali',false,true,true),
(6,'Laza','Lazic','Neka Adresa 888','Budimpestaaa','Serbia','+38761234567','laza@example.com','123','GlavniAdminnn',true,true,false),
(7,'John','Doe','123 Main St','Springfield','USA','123456789','johndoe@example.com','password123','johndoe@example.com',false,true,false),
(8,'Nadja','Sekulic','Castle ','Banja Luka','Republika Srpska','+38765256888','nadja@example.com','nadjeks','nadja',false,true,false),
(10,'resi','dkc','ndncjn','dndn','DOCPKKD','00000','resi@example.com','resi','idemo',false,true,false),
(11,'mjau','jwdj','nkwdnk','ndwdn','jdjdw','0000000','mjau@example.com','mjau','maca',false,true,false),
(12,'proba','probic','lalaland','lalaland','lali','065888888','proba@example.com','proba','probica',false,true,false),
(15,'molim te','boze','dubai dd','dubai','emirati','888','boze@example.com','123','boze',false,true,false),
(16,'Maya','Pavik','Kosovska 90','Ruma','Srbija','0652280502','maya@example.com','maja123','maya',false,true,true),
(17,'sonja','celic','aa','aa','	aa','0616114396','sonja@example.com','sonja','sonjic',false,true,false);

-- Insert podaci za theme
INSERT INTO theme (id, name, description, created_at, updated_at) VALUES
(5,'Movies','All genres and top 10 recommondations','2024-12-09 15:41:40','2024-12-09 15:41:40'),
(6,'Fakulteti','Obrazovne ustanove','2024-12-09 16:18:26','2024-12-09 16:18:26'),
(8,'Restorani u Novom Sadu','Opisite Vasa iskustva u restoranima u Novom Sadu kako bi pomogli drugima prilikom odabira istog','2025-07-03 09:42:50','2025-07-03 09:42:50');

-- Insert podaci za discussion
INSERT INTO discussion (id, text, theme_id, likes, dislikes, user_id, created_at, updated_at, title) VALUES
(6,'Ovo je tekst diskusije',5,1,1,11,'2024-12-09 15:24:55','2025-06-27 16:19:01','Naslov diskusije'),
(7,'Resavamo ovo najlaganije',6,1,0,11,'2024-12-09 15:38:44','2025-07-02 09:56:40','Ide gas'),
(8,'ovo je proba za temu proba',6,1,0,6,'2025-06-27 15:46:31','2025-07-02 09:59:29','proba'),
(11,'Blokiracu NS dokle god me ne uhapse\n\nI dalje se slazem sa ovim \n',6,2,0,8,'2025-07-02 10:28:39','2025-07-07 09:44:10','BLOKADA'),
(12,'Gde mogu da gledam sve delove pirata sa kariba',5,1,0,7,'2025-07-02 13:50:40','2025-07-03 09:41:27','Pirati sa kariba'),
(13,'Sve preporuke',8,3,1,6,'2025-07-03 09:43:25','2025-07-03 09:53:40','Tocionica'),
(14,'Da li da idem sa devojkom na prvi dejt u Petrus na veceru?',8,0,1,7,'2025-07-03 10:01:26','2025-07-03 10:01:53','Petrus'),
(17,'nema nicega\n',5,0,0,7,'2025-07-07 06:35:50',NULL,'isprobavanje'),
(20,'filimic za dejtic',5,1,0,6,'2025-07-07 10:53:25','2025-07-07 14:28:59','filmic');

-- Insert podaci za comment
INSERT INTO comment (id, user_id, text, mentioned_user_id, discussion_id) VALUES
(2,2,'Test comment',NULL,6),
(3,6,'ovo je prvi komentar',NULL,6),
(4,6,'ovo je drugi komentar',NULL,6),
(5,6,'ovo je treci komentar',NULL,6),
(7,8,'Sla??em se sa @natali.',NULL,6),
(8,8,'Sla??em se sa @natali',NULL,6),
(9,8,'Sla??em se sa @maca',NULL,6),
(10,8,'Sla??em se sa @marko. Ovo je odli??an komentar!',NULL,6),
(11,8,'Sla??em se sa @natali . Ovo je odli??an komentar!',2,6),
(12,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),
(13,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),
(14,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),
(16,8,'Sla??em se sa @idemo . Ovo je odli??an komentar!',10,6),
(17,8,'Sla??em se sa @natali . Ovo je odli??an komentar!',2,6),
(18,8,'Slazem se sa @natali . Ovo je odlican komentar!',2,6),
(19,8,'Slazem se sa @natali . Ovo je odlican komentar!',2,6),
(21,8,'@natali',2,6),
(22,8,'@natali',2,6),
(23,8,'@natali',2,6),
(24,8,'@idemo',10,6),
(25,8,'@idemo',10,6),
(26,8,'@idemo',10,6),
(27,8,'evo jos jednog',NULL,7),
(30,7,'evo komentara',NULL,7),
(32,7,'Bravo nadja, nesto pametno i od tebe',NULL,11),
(33,10,'e hrana je odlicna plus je i osoblje veoma ljubazno i prijatno',NULL,13),
(34,7,'Meni se takodje veoma svidelo',NULL,13),
(35,11,'UZAS NE PREPORUCUJEM NIKOME HRANA JE TOLIKO GADNA BILA DA NEMA RECI I TOLIKO BEZOBRAZNO OSOBLJE OVO JE PAKAO!!!!',NULL,13),
(36,8,'NE NIKAKO NEMOJ DA JE VODIS TAMO. To je toliko bejzik da je postalo dosadno',NULL,14),
(37,7,'@nadja zasto to mislis?',8,14);

-- Insert podaci za commentdiscussion
INSERT INTO commentdiscussion (comment_id, discussion_id) VALUES
(4,6),(5,6),(7,6),(8,6),(9,6),(27,7),(30,7),(32,11),(33,13),(34,13),(35,13),(36,14),(37,14);

-- Insert podaci za comments
INSERT INTO comments (id, user_id, discussion_id, text, mentioned_user_id) VALUES
(1,6,6,'ovo je prvi komentar',NULL);

-- Insert podaci za like_dislike
INSERT INTO like_dislike (id, user_id, discussion_id, action) VALUES
(8,7,6,'dislike'),
(10,8,6,'like'),
(16,7,7,'like'),
(17,7,8,'like'),
(26,8,11,'like'),
(27,7,11,'like'),
(28,8,12,'like'),
(29,8,13,'like'),
(30,10,13,'like'),
(31,7,13,'like'),
(32,11,13,'dislike'),
(33,8,14,'dislike'),
(40,6,20,'like');
