#!/usr/bin/env python3
"""Generate Party Fever blog articles + blog index as static pages.
Reuses the shared <head>/header/footer shell from gen_info_pages.py so styling,
nav, JSON-LD and the AdSense snippet stay consistent. No emoticons in output.
Run AFTER gen_info_pages.py (imports its `page` helper)."""
import html, json, importlib.util, os

# import the shared page() shell from the sibling generator
spec = importlib.util.spec_from_file_location("gen_info_pages", os.path.join(os.path.dirname(__file__), "gen_info_pages.py"))
gen = importlib.util.module_from_spec(spec)
# prevent it from re-running its build on import by guarding — it runs at import;
# acceptable here since it just regenerates the same info pages idempotently.
spec.loader.exec_module(gen)
page = gen.page
SITE = gen.SITE
BRAND = gen.BRAND

# ---------------------------------------------------------------- articles
# Each: slug, title, description, dek, and a list of (heading, [paragraphs]).
ARTICLES = [
{
 "slug": "how-kids-learn-through-party-games",
 "title": "How Kids Learn Through Party Games",
 "description": "Party games do more than entertain children. They quietly build vocabulary, memory, social skills, and confidence. Here is what kids gain from playing together.",
 "dek": "The best learning rarely feels like learning. When children play party games with the family, they build real cognitive and social skills without a worksheet in sight.",
 "sections": [
  ("Play is how children are built to learn", [
    "Long before formal schooling, play is the original classroom. Child development researchers have consistently found that children absorb language, problem-solving, and social rules most effectively when they are engaged, relaxed, and having fun. A party game hits all three at once.",
    "When a child guesses a word in a drawing game, races to spot an object in a busy scene, or waits for their turn to spin a wheel, they are practising skills that matter for the rest of their lives. The difference is that it feels like joy, not instruction.",
  ]),
  ("Vocabulary and language grow through guessing", [
    "Word-based games are vocabulary engines. When a child hears a new word revealed as the answer to a puzzle, sees it spelled out, and connects it to a picture or a category, they are building the kind of durable, multi-sensory memory that flashcards rarely achieve.",
    "Guessing games in particular push children to reach for words at the edge of their vocabulary. The gentle pressure of a timer and the reward of a correct guess turn word retrieval into a game they want to keep playing.",
  ]),
  ("Memory, attention, and quick thinking", [
    "Matching a colour sequence, remembering which letters have already been called, or tracking objects in a detailed scene all exercise working memory and sustained attention. These are the same underlying skills children draw on in the classroom.",
    "Because the practice is wrapped in fun and social stakes, children stretch their attention spans further than they would on a solo task. They are motivated to focus because they want to win, or simply to keep up with everyone else at the table.",
  ]),
  ("Turn-taking, fair play, and handling defeat", [
    "Some of the most important lessons in a party game are social, not academic. Waiting for a turn, celebrating someone else's win, and bouncing back after a loss are emotional skills that serve children for life.",
    "Playing alongside parents, grandparents, and siblings gives children a safe space to practise these skills with people who love them. A missed guess or a lost round becomes a small, low-stakes rehearsal for resilience.",
  ]),
  ("Confidence grows when everyone plays together", [
    "When a younger child spots something the adults missed, or lands a clever guess, the pride is real and visible. Mixed-age games are powerful precisely because they let children contribute meaningfully alongside grown-ups.",
    "That sense of being a real participant, not a spectator, builds the quiet confidence that encourages children to try, to speak up, and to take small risks in the future.",
  ]),
  ("Making the most of game time with kids", [
    "Choose games that suit the youngest player at the table, and lean on ones with adjustable difficulty so nobody is left behind or bored. Keep sessions short and end on a high note. Celebrate effort and funny moments as much as winning.",
    "Party Fever was designed with exactly this in mind: quick to start, easy for all ages, and built for the whole family to play together on one screen. The learning takes care of itself when everyone is laughing.",
  ]),
 ],
},
{
 "slug": "phones-family-bonds-reclaiming-togetherness",
 "title": "Are Phones Quietly Eroding Family Bonds?",
 "description": "Families today often sit in the same room while living in separate digital worlds. Here is how shared activities can bring everyone back together.",
 "dek": "We are more connected to our devices than ever, and sometimes less connected to the people right beside us. The good news: reversing it is simpler than it sounds.",
 "sections": [
  ("Together, but apart", [
    "It is a scene most households recognise. Everyone is home, gathered in one room, and yet each person is somewhere else entirely, absorbed in a separate glowing screen. Physically close, socially distant.",
    "This quiet drift is not anyone's fault. Phones are designed to hold attention, and they do it brilliantly. But the cumulative effect of many small moments spent apart is a gradual loosening of the everyday closeness families used to take for granted.",
  ]),
  ("What we lose when we stop doing things together", [
    "Shared activity is the raw material of family bonds. Inside jokes, small rituals, playful competition, and the comfortable rhythm of doing something as a group are what turn people who live together into people who feel close.",
    "When shared time is replaced by parallel screen time, those bonding moments simply happen less often. Nobody decides to grow apart. It just quietly happens, one distracted evening at a time.",
  ]),
  ("The answer is not banning screens", [
    "The instinct to declare the home a screen-free zone is understandable, but it often backfires, creating friction rather than connection. Screens are woven into modern life, and framing them as the enemy rarely wins hearts.",
    "A more realistic approach is to reclaim shared moments, not to wage war on technology. The goal is not zero screen time. It is more time doing something together, whatever the medium.",
  ]),
  ("Turning the screen into a shared table", [
    "This is where technology can become part of the solution. A game played together on the family television, with each person joining from their own phone, flips the usual dynamic. The devices that normally isolate become the controllers that connect.",
    "Instead of six people looking at six separate screens, everyone looks at one shared screen and at each other. The laughter, the friendly arguments, and the celebrations are all pointed inward, toward the group.",
  ]),
  ("Small rituals rebuild closeness", [
    "You do not need a grand plan to rebuild family bonds. A regular game night, even a short one, creates a recurring moment everyone can count on. Rituals like these are the scaffolding of belonging.",
    "The key is to make it easy and mess-free, so it actually happens week after week instead of becoming a chore that fizzles out. The lower the barrier, the more likely it becomes a habit.",
  ]),
  ("Start where you are", [
    "Reclaiming togetherness does not require a lifestyle overhaul. It can start with a single evening, a single game, and a decision to point everyone's attention in the same direction for a while.",
    "Party Fever was built for exactly this: no setup, no clean-up, no barrier to starting. Just gather everyone, put one game on the screen, and watch the room reconnect.",
  ]),
 ],
},
{
 "slug": "best-party-games-family-game-night",
 "title": "15 Ideas for the Perfect Family Game Night",
 "description": "Fifteen practical, tried-and-tested ideas for a family game night that actually happens, keeps every age involved, and leaves nothing to clean up.",
 "dek": "The best game nights are the ones that actually happen. Here are fifteen ideas to keep the fun high, the effort low, and everyone at the table.",
 "sections": [
  ("Why game night is worth protecting", [
    "A regular family game night is one of the simplest, most reliable ways to build closeness. It creates a shared ritual, a reason to gather, and a steady supply of the small joyful moments that hold families together.",
    "The barrier is almost always effort. Boxes to find, pieces to set up, rules to explain, and a table to clear afterward. Remove that friction and game night goes from occasional to weekly. The fifteen ideas below are all built around that principle.",
  ]),
  ("1. Open with something fast and silly", [
    "The first game of the night has one job: break the ice. A quick drawing or reaction game gets everyone laughing within a minute, and a room that has already laughed together will happily sit through anything more thoughtful afterward.",
  ]),
  ("2. Let the youngest player choose first", [
    "Handing the first pick to the youngest at the table does two things at once. It guarantees they are engaged from the start, and it quietly signals that this is genuinely everyone's night, not the adults' night with children tolerated.",
  ]),
  ("3. Rotate the type of fun, not just the game", [
    "Follow a noisy reaction game with a thoughtful trivia round, then a creative drawing game. Varying the kind of challenge keeps different personalities engaged and stops the evening settling into one note.",
  ]),
  ("4. Set an end time before you start", [
    "Decide up front that you will stop at a certain point, and stop there even if things are going well. Ending while everyone still wants more is what makes people ask for it again next week. Game nights die of exhaustion, not boredom.",
  ]),
  ("5. Pair the generations into teams", [
    "Put a child with a grandparent. The child gets a mentor, the grandparent gets a role beyond spectator, and the pair produces the sort of moment families retell for years. It also quietly solves the confidence gap for shy younger players.",
  ]),
  ("6. Make the prize silly, not valuable", [
    "A ridiculous trophy, a paper crown, or the right to choose tomorrow's dinner beats anything with real value. Silly prizes keep the competition warm; real prizes make it sharp, and sharp is where game nights go wrong.",
  ]),
  ("7. Invent one house rule that is yours alone", [
    "Every family that plays regularly ends up with a rule nobody else has. A bonus for the worst drawing. A round where the youngest gets double points. These small inventions are how a game becomes your family's game.",
  ]),
  ("8. Use phones as controllers, not distractions", [
    "The phone is not the enemy. Pointed at a shared screen it becomes a controller, and the device that usually pulls everyone apart becomes the thing that brings them together. The trick is giving the phone a job in the room, not outside it.",
  ]),
  ("9. Choose snacks you can eat one-handed", [
    "Anything requiring cutlery, a plate, or a napkin will interrupt the game and create mess. Bowls of things you can grab between rounds keep the energy going and the clean-up near zero.",
  ]),
  ("10. Appoint a commentator", [
    "Give whoever is sitting out a round the job of commentating on it. It keeps them involved, it is usually funnier than the game itself, and it removes the dead time that makes people drift back to their own screens.",
  ]),
  ("11. Give the loser a revenge round", [
    "Let whoever finished last choose the next game. It gives them something to look forward to instead of something to sulk about, and it naturally varies the games you play across an evening.",
  ]),
  ("12. Theme the night occasionally", [
    "Once in a while, give the evening a shape: a holiday theme, a decade, a colour everyone wears. It costs nothing and turns an ordinary evening into one people remember specifically rather than generally.",
  ]),
  ("13. Photograph the final scoreboard", [
    "A quick photo of the scores each week builds a running history. Months later it becomes a small archive of your family's evenings, and the rivalries it documents are worth more than the numbers.",
  ]),
  ("14. Widen the circle sometimes", [
    "Invite the neighbours, cousins, or a friend who is on their own that evening. Games that support unlimited players make this effortless, and a bigger, noisier group changes the whole character of the night for the better.",
  ]),
  ("15. Finish on the favourite", [
    "End every night with the game your family loves most. Last impressions linger, and closing on the crowd-pleaser is what turns tonight's session into next week's request.",
  ]),
  ("Making it effortless enough to repeat", [
    "Look back at that list and notice how many ideas depend on one thing: low friction. No setup, no rules lecture, no clean-up. The hidden killer of game night is the aftermath, and it is why so many good intentions never become habits.",
    "Party Fever was built around exactly this. Six varied games on your television, phones as controllers, unlimited players, nothing to download, and absolutely nothing to pack away when the laughter fades.",
  ]),
 ],
},
{
 "slug": "party-games-large-groups-office-gatherings",
 "title": "Party Games for Large Groups: What Works and What Falls Flat",
 "description": "Big groups need games that scale. Here is what separates a game that keeps thirty people engaged from one that leaves half the room watching.",
 "dek": "Large groups are where most games fall apart. The trick is choosing ones that keep everyone in the action, not waiting on the sidelines.",
 "sections": [
  ("The large-group problem", [
    "Most traditional games quietly cap out at four to six players. Add more and people end up watching rather than playing, drifting off, or forming side conversations. Energy leaks out of the room.",
    "The secret to a great large-group game is simple: everyone must be able to participate at once, or at least stay meaningfully engaged while they wait. Games that keep all hands busy keep all minds present.",
  ]),
  ("Games that scale to any crowd", [
    "Look for games where every player acts simultaneously rather than one at a time. Everyone guessing a drawing, everyone hunting for hidden objects, everyone answering a trivia question on their own device keeps the whole room active.",
    "Simultaneous play is what lets a game grow from a small family to a big party without slowing down or leaving anyone out.",
  ]),
  ("Why office gatherings love party games", [
    "Team gatherings and office parties have a particular challenge: mixed familiarity, mixed ages, and a need to include everyone without anyone feeling singled out. Light, inclusive games are perfect ice-breakers.",
    "A shared game gives colleagues who do not usually work together a reason to laugh, compete gently, and connect as people. It is team-building that does not feel like team-building.",
  ]),
  ("Keep the rules simple", [
    "With a big or mixed group, the game that wins is the one nobody has to study. If you can explain it in a sentence and start in seconds, you keep the momentum and the mood.",
    "Complex rules create a two-tier room: those who understood and those who are still confused. Simplicity keeps everyone equal and engaged.",
  ]),
  ("Mind the shy players", [
    "Every large gathering has people who would rather not be the centre of attention. Games that require performing in front of a crowd can quietly exclude them, no matter how well-intentioned the invitation.",
    "The fix is choosing games where participation is private but the result is shared. Answering on your own phone, spotting objects, or making a guess lets a quieter person contribute fully without ever having to stand up and perform.",
  ]),
  ("Keep the energy moving", [
    "Large groups lose momentum fast. The moment a game drags, side conversations start and the room fragments. Short rounds and quick transitions are what hold a crowd together.",
    "Plan for variety and pace over depth. Several fast games beat one long one, and ending each round while the energy is still high is what keeps everyone asking for another.",
  ]),
  ("One screen, many phones", [
    "The cleanest way to run a large-group game is a single shared screen with everyone joining from their own phone. It scales naturally, needs no equipment beyond what people already carry, and keeps the whole group focused on one place.",
    "Party Fever is built for exactly this: unlimited players, simultaneous games, and a setup so quick it works whether it is five people at home or a room full of colleagues.",
  ]),
 ],
},
{
 "slug": "screen-time-that-brings-people-together",
 "title": "Screen Time That Brings People Together, Not Apart",
 "description": "Not all screen time is equal. Here is the difference between technology that isolates and technology that connects, and how to choose more of the latter.",
 "dek": "The problem was never screens. It was what we do on them. Some screen time pulls people apart; the right kind pulls them together.",
 "sections": [
  ("Not all screen time is the same", [
    "The debate about screen time is usually framed as more versus less. But the more useful question is what kind. An hour spent scrolling alone and an hour spent playing a game together are both screen time, and they could hardly be more different.",
    "One is solitary and passive. The other is social and active. Judging them by the same measure misses the point entirely.",
  ]),
  ("Isolating screens versus connecting screens", [
    "Isolating screen time is private by design: one person, one device, one feed, headphones in. It is engineered to hold a single pair of eyes for as long as possible.",
    "Connecting screen time points outward. A shared show, a video call with family, or a game played together turns the screen into a gathering point rather than a wall. The device becomes a bridge, not a barrier.",
  ]),
  ("The shared-screen advantage", [
    "When a screen is shared by a group, the social dynamic flips. People react to each other, not just to the content. They laugh together, groan together, and build the shared memories that solitary scrolling never produces.",
    "A family game night on the television, with everyone joining from their phones, is a perfect example. The same devices that usually isolate become the controllers that connect.",
  ]),
  ("Choosing better screen time", [
    "You do not have to eliminate screens to reclaim connection. You can simply shift the balance toward the kind of screen time that includes other people. Swap one solitary session a week for a shared one and the effect compounds.",
    "The aim is not a smaller number on a screen-time report. It is more moments where the screen is something you experience together.",
  ]),
  ("What the research actually suggests", [
    "Much of the anxiety around screen time treats every minute as equivalent, but researchers increasingly distinguish between passive consumption and active, social use. The context and the company appear to matter as much as the clock.",
    "That reframing is liberating for families. Rather than policing a total, you can simply ask a better question: is this screen bringing us together right now, or pulling us apart?",
  ]),
  ("Building the habit", [
    "Shifting the balance works best as a small, repeatable ritual rather than a grand resolution. One evening a week where the screen is shared is more sustainable than a sweeping ban that lasts three days.",
    "Make the connecting option the easy one. If the shared game takes ten minutes to set up and the solitary scroll takes zero, the scroll will win every time. Remove the friction and the habit forms itself.",
  ]),
  ("Technology on your side", [
    "The best connecting technology is invisible in the moment. It gets everyone into the fun quickly and then gets out of the way, leaving people focused on each other.",
    "Party Fever was designed around this idea: the screen is shared, the phones are just controllers, and the whole point is to look up at each other and laugh. Screen time, pointed in the right direction.",
  ]),
 ],
},
{
 "slug": "games-for-multigenerational-family-gatherings",
 "title": "How to Choose Games for Multi-Generational Family Gatherings",
 "description": "From grandparents to grandchildren, the right game lets every generation play together as equals. Here is how to pick one that works for all of them.",
 "dek": "The magic of a family gathering is having every generation in one room. The challenge is finding something they can all enjoy at once.",
 "sections": [
  ("The multi-generational challenge", [
    "Family gatherings bring together a remarkable range of ages, abilities, and interests. A game a teenager finds thrilling may baffle a grandparent, while a children's game bores the adults. Finding common ground is genuinely hard.",
    "Yet these gatherings are precisely when shared play matters most. They may be the only times all the generations are together, and a shared activity is what turns a room of relatives into a family making memories.",
  ]),
  ("Look for games everyone can win", [
    "The best cross-generational games do not reward a single narrow skill. A game that mixes observation, general knowledge, quick reactions, and a little luck gives every age a genuine chance to shine.",
    "When a grandchild can out-spot a parent and a grandparent can out-guess a teenager, the playing field feels fair, and everyone stays invested.",
  ]),
  ("Keep it simple enough for all", [
    "A game that takes ten minutes to explain will lose the youngest and the least tech-comfortable players before it even starts. Choose games that begin in seconds and explain themselves as you play.",
    "Simplicity is the great equaliser. It lets a nine-year-old and a ninety-year-old sit down at the same game with the same confidence.",
  ]),
  ("Comfort with technology matters", [
    "Not every relative is at ease with complicated apps. Games that use the phone people already own, with nothing to download and nothing to configure, remove the anxiety that keeps less tech-savvy family members on the sidelines.",
    "When joining a game is as easy as pointing a phone at a code on the television, even the most reluctant relative can be playing within moments.",
  ]),
  ("Let the eldest and youngest lead", [
    "One quiet trick for multi-generational play: let the youngest child and the eldest relative be on the same team. It gives the child a mentor and the grandparent a role beyond spectator, and it produces the kind of moment families remember for years.",
    "Pairing across generations also solves the confidence gap. A nine-year-old who might not speak up alone will happily shout an answer when a grandparent is nodding along beside them.",
  ]),
  ("Make it a tradition, not an event", [
    "The gatherings that stay warm are the ones with rituals. A game that comes out every single time, without fuss or a search through cupboards, quietly becomes part of what the family is.",
    "That is the real argument for games with no setup and no clean-up. They are easy enough to repeat, and repetition is what turns an activity into a tradition.",
  ]),
  ("Celebrating culture and togetherness", [
    "Across many cultures, especially in the Middle East, South Asia, and beyond, large multi-generational gatherings are the heart of family life. Games that welcome everyone, regardless of age or background, honour that tradition.",
    "Party Fever was built to bring the whole family to one screen, with games easy enough for the youngest and fun enough for the eldest. It is togetherness, made effortless.",
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
    root = "../"
    secs = []
    for headline, paras in a["sections"]:
        ps = "\n".join(f"        <p>{html.escape(p)}</p>" for p in paras)
        secs.append(f"      <h2>{html.escape(headline)}</h2>\n{ps}")
    body_html = "\n".join(secs)
    return f"""    <article class="prose article">
      <a class="back" href="{root}blog/">&larr; All articles</a>
      <h1>{html.escape(a['title'])}</h1>
      <p class="dek">{html.escape(a['dek'])}</p>
{body_html}
      <div class="cta">
        <a class="btn" href="/">Try Party Fever free</a>
        <a class="btn ghost" href="{root}games/">See the games</a>
      </div>
    </article>"""

for a in ARTICLES:
    page(f"blog/{a['slug']}.html", f"{a['title']} | {BRAND}", a["description"],
         article_body(a), jsonld=article_jsonld(a))

# blog index
cards = "\n".join(
  f'''      <a class="post-card" href="{a['slug']}">
        <h2>{html.escape(a['title'])}</h2>
        <p>{html.escape(a['description'])}</p>
        <span class="read-more">Read article &rarr;</span>
      </a>''' for a in ARTICLES)
page("blog/index.html", f"Blog | {BRAND}",
     "Ideas and inspiration for family game nights, party games, and screen time that brings people together.",
     f"""    <section class="hub">
      <h1>The Party Fever Blog</h1>
      <p class="hub-intro">Ideas for game nights, family bonding, and turning screen time into together time.</p>
      <div class="post-grid">
{cards}
      </div>
    </section>""",
     jsonld={"@context": "https://schema.org", "@type": "Blog", "name": f"{BRAND} Blog", "url": f"{SITE}/blog",
             "blogPost": [{"@type": "BlogPosting", "headline": a["title"], "url": f"{SITE}/blog/{a['slug']}"} for a in ARTICLES]})

print(f"Generated {len(ARTICLES)} articles + blog index")
