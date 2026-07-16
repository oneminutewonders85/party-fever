#!/usr/bin/env python3
"""Generate Party Fever blog articles + index as static pages.

Editorial policy for this blog:
  - Articles are genuinely useful writing about play, family and game nights.
  - They do NOT promote the product. No product name in the body, no CTA blocks,
    no references to phones-as-controllers or TV screens. The site nav and footer
    are the only places the reader is invited anywhere.
  - Headings are Title Case. No em dashes. Varied paragraph rhythm.

Reuses the shared <head>/header/footer shell from gen_info_pages.py.
Run AFTER gen_info_pages.py (imports its `page` helper).
"""
import html, importlib.util, os

spec = importlib.util.spec_from_file_location(
    "gen_info_pages", os.path.join(os.path.dirname(__file__), "gen_info_pages.py"))
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)
page = gen.page
SITE = gen.SITE
BRAND = gen.BRAND

ARTICLES = [
{
 "slug": "how-kids-learn-through-party-games",
 "title": "How kids learn through party games",
 "description": "Party games look like pure silliness. Underneath, children are building vocabulary, memory, patience and confidence, and none of it feels like work.",
 "dek": "Nobody has to tell a child to play. It is the one kind of learning that never needed a curriculum.",
 "sections": [
  ("Play was the first classroom", [
    "Children have been learning through play for as long as there have been children. Long before anyone invented a worksheet, kids worked out how the world functions by messing about in it, testing what happened, copying the adults, and arguing furiously over rules they had made up ten seconds earlier.",
    "That instinct does not switch off at five. It just gets squeezed into smaller corners of the day.",
    "A party game is one of those corners. It looks like nothing but noise. It is doing considerably more than that.",
  ]),
  ("Words stick when you win them", [
    "Ask a child to memorise twenty new words and you will get a fight. Let them guess one word to beat their older brother and they will still know it in ten years.",
    "Something about winning a word makes it stay put. The child hears it, sees it written, connects it to a picture or a category, and pins the whole thing to a small burst of triumph. That is several routes into memory at once, which happens to be exactly what vocabulary needs.",
    "Guessing games also push kids to reach past the words they are comfortable with. The pressure helps. So does the sibling.",
  ]),
  ("Attention is a muscle", [
    "Sitting still and concentrating is hard for children because it is genuinely hard, not because they are being difficult. Attention builds with practice, and practice is easier to come by when the child actually wants to do the thing.",
    "Watch a seven year old hunting for a hidden object in a busy picture, or holding a colour sequence in their head, or tracking which letters have already been called. That is sustained focus, and they are volunteering for it. Nobody had to negotiate.",
  ]),
  ("Losing is a skill too", [
    "The most useful thing that happens at a game night is often the losing.",
    "Waiting your turn when you desperately want to go. Watching someone else say the answer you were about to say. Coming last and having to sit through the next round anyway. These are small, low stakes rehearsals for disappointment, and a child gets to run them in a room full of people who love them.",
    "It is worth letting that happen rather than smoothing it over. A child who can lose a game without falling apart has learned something plenty of adults never quite managed.",
  ]),
  ("Being taken seriously builds confidence", [
    "There is a particular look on a child's face when they spot something the grown ups missed. Not delight exactly. More like being promoted.",
    "Games where a nine year old can genuinely beat an adult are worth their weight in gold, because the child is not being humoured. They are competing on real terms and winning. That is where the quiet sort of confidence comes from, the kind that makes a kid put their hand up in class a month later.",
  ]),
  ("What actually helps", [
    "Pick games the youngest person can win. If a child cannot realistically compete, they will disengage, and no amount of encouragement fixes that.",
    "Keep it short. Kids run out of road faster than adults, and a game that overstays turns a good evening into a bad memory.",
    "Praise the funny failures as loudly as the wins. A terrible drawing that made everyone laugh is worth more, socially, than a correct answer nobody reacted to. Children work this out fast, and they play far more freely once they know the room is not only counting points.",
  ]),
 ],
},
{
 "slug": "phones-family-bonds-reclaiming-togetherness",
 "title": "Are phones quietly eroding family bonds?",
 "description": "Families often sit in the same room while living in separate worlds. Nobody decides to drift apart. It happens one distracted evening at a time.",
 "dek": "We are more connected than ever, and sometimes less connected to the people sitting right beside us.",
 "sections": [
  ("Together, but somewhere else", [
    "You know the scene. Everyone is home. Everyone is in the same room. And everyone is somewhere else entirely.",
    "This is not a moral failing. Phones are built by very clever people to hold your attention, and they are extremely good at it. Losing an evening to one is not weakness, it is the product working as designed.",
    "The trouble is that evenings add up.",
  ]),
  ("What actually goes missing", [
    "The thing that quietly disappears is not conversation. It is the low grade, ambient business of doing something together.",
    "Inside jokes come from shared activity. So do small rituals, the comfortable rhythm of a group that knows each other well, and the accumulated pile of daft moments that make a family feel like a family rather than a set of people with a shared address.",
    "None of that happens in parallel. It needs everyone pointed at the same thing.",
  ]),
  ("Banning phones rarely works", [
    "The instinct is to declare the house a phone free zone. It is understandable and it almost never survives contact with reality.",
    "Part of the problem is that it casts the phone as the enemy, which turns the whole thing into a fight nobody wanted. Teenagers dig in. Adults break their own rule by Wednesday. And the underlying issue, which was never really the phone, goes unaddressed.",
    "The more honest question is not how much time everyone spends looking at screens. It is how much time everyone spends doing anything at all together.",
  ]),
  ("The repair is smaller than you think", [
    "It does not take a family retreat or a solemn agreement. It takes one activity, repeated.",
    "Cooking together. A walk. A game. It genuinely does not matter which, and the more ordinary it is the better, because ordinary things are repeatable and grand gestures are not. The point is the repetition, not the event.",
    "Rituals are what closeness is made of, and rituals are boring by definition. That is the whole trick.",
  ]),
  ("It is not only the children", [
    "The conversation about phones nearly always points at teenagers, which is convenient, because it means the adults do not have to look at their own hands.",
    "Children calibrate almost entirely on what they see. A parent who checks work email through dinner has already lost the argument about screens at the table, and no rule will recover it. This is uncomfortable and it is also the most useful thing in the room, because it is the one variable you fully control.",
  ]),
  ("Start with one evening", [
    "Pick a night. Do something together on it. Do it again next week.",
    "That is the entire method. It sounds far too small to work, which is exactly why most people skip it in favour of a plan they will abandon in a fortnight.",
    "The families who stay close are rarely the ones who tried hardest. They are the ones who had something they did every week and never got around to stopping.",
  ]),
 ],
},
{
 "slug": "best-party-games-family-game-night",
 "title": "15 ideas for a family game night that actually happens",
 "description": "Fifteen practical ideas for a game night people look forward to, built around the only thing that really matters: making it easy enough to do again next week.",
 "dek": "The best game night is not the most elaborate one. It is the one that happens again next week.",
 "sections": [
  ("Why most game nights quietly die", [
    "Almost every family has tried this and let it lapse. The failure is rarely the games. It is the friction: finding the box, explaining the rules, someone sulking, and a table to clear at eleven at night.",
    "So most of what follows is not really about games. It is about lowering the cost of doing it again.",
  ]),
  ("1. Hype it before it happens", [
    "Announce it. Talk it up at breakfast. Make a small deal of it in advance and it becomes an event people are turning up for, rather than a thing that got suggested at half past eight when everyone had already settled in somewhere else.",
  ]),
  ("2. Same night, every week", [
    "Pick a night and keep it. Friday, Sunday, whatever fits. The magic is entirely in the repetition, because a fixed slot needs no decision, and a decision is where these things die.",
  ]),
  ("3. Let the kids run it", [
    "Hand a child the job of picking the games and keeping score. They will take it far more seriously than any adult would, and a kid who is running the evening is never a kid who is bored of it.",
  ]),
  ("4. Feed everyone first", [
    "Hungry people are bad at games and worse at losing. Get food in before you start, and keep something to pick at within reach, ideally something that does not need a fork.",
  ]),
  ("5. Pick games the youngest can win", [
    "This is the most important rule here. If the youngest person at the table cannot realistically win, they will drift, and once one person drifts the whole thing starts to unravel. Choose accordingly, even if it leaves the adults slightly under stretched.",
  ]),
  ("6. Let everyone be loud", [
    "Laugh, yell, groan, argue, accuse each other of cheating. A game night conducted in polite murmurs is not a game night, it is a meeting. The noise is not a side effect of the fun. It largely is the fun.",
  ]),
  ("7. Have a rule about the rules lawyer", [
    "Every family has one. Agree in advance that a dispute gets thirty seconds, somebody adjudicates, and the game moves on. Nothing kills an evening faster than a ten minute debate about whether that counted.",
  ]),
  ("8. Play in teams", [
    "Pair the youngest with the oldest. The child gets a co-conspirator, the grandparent gets a job, and between them they will produce the moment everyone remembers. Teams also quietly rescue anyone having a bad night.",
  ]),
  ("9. Keep a trophy, and make it ugly", [
    "A chipped mug. A plastic dinosaur. Something with no value whatsoever that the winner keeps until next week. Silly prizes keep the competition warm. Real prizes make it sharp, and sharp is where family game nights go wrong.",
  ]),
  ("10. Make up your own rules", [
    "Every family that plays regularly ends up with a house rule nobody else has. Double points for the worst drawing. The youngest goes twice. Let those accumulate. They are how a game stops being a game you play and starts being your family's game.",
  ]),
  ("11. Let the loser pick what is next", [
    "Whoever came last chooses the following game. It gives them something to look forward to instead of something to stew about, and it varies the evening without anyone having to organise it.",
  ]),
  ("12. Put the phones somewhere else", [
    "Not confiscated. Just in a bowl in the next room. The point is not discipline, it is removing the small temptation to check something during a lull, because one person checking is how a room empties out.",
  ]),
  ("13. Stop while it is still fun", [
    "End early. End while people are still asking for one more. A game night that runs until everyone is tired and fractious is one nobody suggests again, and finishing on a high is the cheapest possible way to guarantee a next time.",
  ]),
  ("14. Take a photo of the scores", [
    "One photo of the final scoreboard, every week. It takes two seconds, and after six months you have an accidental archive of your family's evenings, rivalries included. Nobody ever regrets having taken it.",
  ]),
  ("15. Finish on the favourite", [
    "Whatever game your lot loves most, play it last. People remember endings, and closing on the one everybody wants is what turns tonight into a habit rather than an anecdote.",
  ]),
  ("The common thread", [
    "Read that list back and almost every item is about removing an excuse. Less setup, fewer arguments, no boredom for the youngest, nothing left to tidy at midnight.",
    "Get the friction low enough and the evening stops needing willpower. That is the whole thing. A family game night is not hard to have. It is only hard to have twice.",
  ]),
 ],
},
{
 "slug": "party-games-large-groups-office-gatherings",
 "title": "Party games for large groups: what works and what falls flat",
 "description": "Most games quietly break somewhere around the seventh player. Here is what separates a game that holds a big room together from one that leaves half of it watching.",
 "dek": "Big groups are where most games fall apart, usually about twenty minutes in, when four people are playing and eleven have drifted off.",
 "sections": [
  ("The seventh player problem", [
    "Most games are secretly designed for four to six people. Add more and they do not break loudly. They break quietly: turns get slower, someone starts a side conversation, and within twenty minutes you have a game happening in the middle of a room that has stopped paying attention.",
    "The failure is almost always about waiting. Any game where you spend more time watching than doing will lose a big group, however good it is.",
  ]),
  ("Simultaneous beats sequential", [
    "The single best predictor of whether a game survives a crowd is whether everyone acts at once.",
    "Games where all players guess, answer, hunt or draw at the same time scale almost indefinitely. Games where you go round the table one at a time hit a wall, and the wall arrives faster than people expect. Twelve players taking thirty second turns means six minutes between your goes. Nobody survives that.",
  ]),
  ("Mind the ones who hate performing", [
    "Every large gathering contains people who would rather not stand up in front of everybody. Charades style games ask them to, and the polite refusal that follows quietly writes them out of the evening.",
    "Games where taking part is private but the result is public are far kinder. You can be fully involved without ever having to perform, which is the difference between including someone and inviting them to be watched.",
  ]),
  ("Rules you can explain in a sentence", [
    "With a big or mixed group, whoever is still confused after the explanation is effectively out. And they will not say so. They will just disengage quietly, and you will not notice until they have gone to get a drink and not come back.",
    "If you cannot explain it in one sentence, it is the wrong game for a crowd.",
  ]),
  ("Why it works at work", [
    "Office gatherings have a specific difficulty. People know each other unevenly, the age range is wide, and nobody wants to be embarrassed in front of colleagues they will see again on Monday.",
    "A light, inclusive game handles all three at once, because it gives people a reason to talk that is neither work nor small talk. That is genuinely useful, and it does not require anyone to share a fun fact about themselves.",
  ]),
  ("Keep it moving", [
    "Short rounds. Quick transitions. Stop before the energy dips rather than after.",
    "Crowds have less patience than small groups, not more, and momentum is the only thing holding a big room together. Several fast games will always beat one long one.",
  ]),
 ],
},
{
 "slug": "getting-teenagers-to-join-game-night",
 "title": "How to get teenagers to actually join game night",
 "description": "Teenagers are the hardest people in the house to get to the table, and the ones most worth the effort. A few things that work, and several that reliably do not.",
 "dek": "The teenager is the hardest sell in the house. They are also the person most worth getting to the table.",
 "sections": [
  ("Why they say no", [
    "It is rarely the game. It is the risk.",
    "Family game night asks a teenager to be visibly enthusiastic in front of people, and enthusiasm is the exact thing they are currently least willing to spend. Add the possibility of being bad at it in front of a younger sibling and declining is simply the safer play.",
    "Understand that and most of the usual tactics reveal themselves as counterproductive.",
  ]),
  ("What does not work", [
    "Making it compulsory. You will get a body at the table and nothing else, and the sulking will cost you more than the absence would have.",
    "Guilt. Same result, worse atmosphere.",
    "Pitching it as family bonding. Naming the goal is what kills it. Nobody at any age wants to be told they are about to bond.",
  ]),
  ("Give them a job", [
    "The most reliable trick is to hand over some authority. Let them pick the games. Let them keep score. Let them explain the rules to everyone else.",
    "A role converts them from participant to organiser, and an organiser cannot be caught being uncool, because they are running it. This works far more often than it has any right to.",
  ]),
  ("Let them win sometimes", [
    "Teenagers will tolerate a great deal for the chance to beat a parent at something. Choose games that reward speed, current knowledge or quick thinking, where they have a genuine edge, and the resistance drops noticeably.",
    "It is much less appealing when the format quietly favours the adults every single time.",
  ]),
  ("Keep it short and let them leave", [
    "Announce that it will take half an hour and mean it. The freedom to go afterwards, without a negotiation, is often what makes staying possible in the first place.",
    "Most of the time they will not leave. But they need to know they could.",
  ]),
  ("Do not make them the youngest person's entertainment", [
    "A common mistake is drafting the teenager in to keep a younger sibling occupied. They will spot it immediately, and they will be right, because that is not an invitation to play, it is a shift.",
    "If they are there, they are a player like everyone else, with the same right to win and the same right to be annoyed about losing. The moment game night becomes childcare with extra steps, they are gone and it is difficult to get them back.",
  ]),
  ("Their friends are an asset", [
    "If a teenager asks whether a friend can join, say yes without hesitating.",
    "An audience of one peer changes the entire calculation. Being at a family game night is embarrassing. Hosting a family game night that a mate turned up to is something else, and you will often see a version of them you have not seen in months.",
  ]),
  ("Do not comment on it afterwards", [
    "This is the one everybody gets wrong. They turned up, they laughed, they had a good time, and there is an almost irresistible urge to say something warm about it.",
    "Do not. Say nothing, do it again next week, and let it become normal. The fastest way to lose a teenager is to make them self conscious about having enjoyed something.",
  ]),
 ],
},
{
 "slug": "games-for-multigenerational-family-gatherings",
 "title": "How to choose games for multi-generational family gatherings",
 "description": "Getting a nine year old and a ninety year old to enjoy the same game is genuinely hard. It comes down to a few specific choices about what the game rewards.",
 "dek": "Getting a nine year old and a ninety year old to enjoy the same thing is a real problem, and the usual answer of picking something for the middle satisfies nobody.",
 "sections": [
  ("The actual difficulty", [
    "A family gathering can span seventy years of age, three levels of eyesight, wildly different reference points, and at least one person who is only there under duress.",
    "The instinct is to find something in the middle. This is usually a mistake, because the middle is where things are mildly acceptable to everyone and genuinely fun for nobody. What you want is a game that gives different people different ways to be good at it.",
  ]),
  ("Reward more than one kind of clever", [
    "A game that only tests general knowledge belongs to whoever reads the most. A game that only tests reflexes belongs to the teenagers. Either way you have handed the evening to one demographic, and everyone else is playing a supporting role in someone else's win.",
    "The games that work across generations reward several things at once: a sharp eye, a good memory, a bit of nerve, and enough luck that nobody is ever completely out of it. When a grandchild can out spot a parent and a grandparent can out guess a teenager, the whole table stays interested.",
  ]),
  ("Simple enough to start cold", [
    "The explanation is where you lose people. Anything requiring a five minute briefing has already lost the youngest child and quietly humiliated the relative who did not follow it and will not ask.",
    "A game you can start playing before you have entirely finished explaining is worth ten clever ones. Simplicity is not a compromise here. It is the whole qualification.",
  ]),
  ("Watch out for the technology gap", [
    "Not everyone is comfortable with anything that needs setting up. If joining in involves an account, an install, or a settings menu, some relatives will decide in advance that this is not for them, and they will be polite about it and mean it absolutely.",
    "Whatever you choose, the barrier to joining should be close to zero. The moment it feels like a technical task, half the room opts out.",
  ]),
  ("Let the oldest and youngest team up", [
    "Pair them deliberately. The child gets an ally and someone to show off to. The grandparent gets an actual role rather than a chair at the edge of things.",
    "It also solves the confidence problem. A nine year old who would never shout an answer alone will happily shout one with a grandparent nodding along beside them.",
  ]),
  ("Make it the thing you always do", [
    "The gatherings people remember fondly tend to have something that always happens. Not a schedule. A habit.",
    "If it is easy enough to repeat without anyone having to organise it, a game stops being an activity somebody suggested and becomes part of what the family is. That is worth more than picking the perfect game, and it is a much lower bar than most people assume.",
  ]),
 ],
},
]

def article_jsonld(a):
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": a["title"],
      "description": a["description"],
      "url": f"{SITE}/blog/{a['slug']}",
      "author": {"@type": "Organization", "name": BRAND},
      "publisher": {"@type": "Organization", "name": BRAND, "url": SITE},
      "mainEntityOfPage": f"{SITE}/blog/{a['slug']}",
    }

def article_body(a):
    secs = []
    for headline, paras in a["sections"]:
        ps = "\n".join(f"        <p>{html.escape(p)}</p>" for p in paras)
        secs.append(f"      <h2>{html.escape(headline)}</h2>\n{ps}")
    body_html = "\n".join(secs)
    # No call to action. The nav and footer are the only invitations.
    return f"""    <article class="prose article">
      <a class="back" href="../blog/">&larr; All articles</a>
      <h1>{html.escape(a['title'])}</h1>
      <p class="dek">{html.escape(a['dek'])}</p>
{body_html}
    </article>"""

for a in ARTICLES:
    page(f"blog/{a['slug']}.html", f"{a['title']} | {BRAND}", a["description"],
         article_body(a), jsonld=article_jsonld(a))

cards = "\n".join(
  f'''      <a class="post-card" href="{a['slug']}">
        <h2>{html.escape(a['title'])}</h2>
        <p>{html.escape(a['description'])}</p>
        <span class="read-more">Read article &rarr;</span>
      </a>''' for a in ARTICLES)
page("blog/index.html", f"Blog | {BRAND}",
     "Writing about family game nights, play, and the small habits that keep people close.",
     f"""    <section class="hub">
      <h1>The Party Fever blog</h1>
      <p class="hub-intro">Writing about play, family game nights, and the small habits that keep people close.</p>
      <div class="post-grid">
{cards}
      </div>
    </section>""",
     jsonld={"@context": "https://schema.org", "@type": "Blog", "name": f"{BRAND} Blog", "url": f"{SITE}/blog",
             "blogPost": [{"@type": "BlogPosting", "headline": a["title"], "url": f"{SITE}/blog/{a['slug']}"} for a in ARTICLES]})

print(f"Generated {len(ARTICLES)} articles + blog index")
