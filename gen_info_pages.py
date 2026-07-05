#!/usr/bin/env python3
"""Generate Party Fever static info/marketing pages for Cloudflare Pages.
Output goes to public/ so files are served directly, taking precedence over the
SPA catch-all in _redirects. No emoticons in any user-visible text."""
import os, html, json

OUT = "public"
SITE = "https://partyfever.cc"
BRAND = "Party Fever"
EMAIL = "oneminutewonders85@gmail.com"
TAGLINE = "Endless fun. Zero mess. All together."

# ---------------------------------------------------------------- shared shell
def page(path, title, description, body, jsonld=None, canonical=None):
    clean = path.replace('index.html', '').rstrip('/')
    if clean.endswith('.html'):
        clean = clean[:-5]
    canonical = canonical or (f"{SITE}/{clean}" if clean else SITE)
    depth = path.count("/")
    root = "../" * depth  # relative path back to site root for assets/links
    ld = ""
    if jsonld:
        ld = '\n  <script type="application/ld+json">\n' + json.dumps(jsonld, indent=2) + "\n  </script>"
    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9261445903624865"
     crossorigin="anonymous"></script>
  <link rel="canonical" href="{canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="{BRAND}" />
  <meta property="og:title" content="{html.escape(title)}" />
  <meta property="og:description" content="{html.escape(description)}" />
  <meta property="og:url" content="{canonical}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="{root}info.css" />{ld}
</head>
<body>
  <header class="site-head">
    <a class="wordmark" href="{root or '/'}">Party<span>Fever</span></a>
    <nav class="site-nav">
      <a href="{root}games/">Games</a>
      <a href="{root}how-to-play">How to Play</a>
      <a href="{root}about">About</a>
      <a href="{root or '/'}">Play Now</a>
    </nav>
  </header>
  <main>
{body}
  </main>
  <footer class="site-foot">
    <div class="foot-brand">
      <span class="wordmark small">Party<span>Fever</span></span>
      <p class="tagline">{TAGLINE}</p>
    </div>
    <nav class="foot-nav">
      <a href="{root}games/">Games</a>
      <a href="{root}how-to-play">How to Play</a>
      <a href="{root}about">About</a>
      <a href="{root}contact">Contact</a>
      <a href="{root}privacy">Privacy</a>
    </nav>
    <p class="copyright">&copy; 2026 {BRAND}. All rights reserved.</p>
  </footer>
</body>
</html>
"""
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(doc)
    return path

# ---------------------------------------------------------------- game content
GAMES = [
  dict(
    slug="quick-doodle", name="Quick Doodle", icon="quick_doodle.png",
    hook="Draw it. Guess it. Lose it laughing.",
    players="3 or more", ages="6 and up", time="5 to 15 minutes",
    lead=("Somebody has sixty seconds and a blank canvas to make \u201coctopus\u201d recognisable, and good luck with that. "
          "Quick Doodle is the fast-draw guessing game in Party Fever, where one player sketches a secret word on their phone "
          "and it appears live on the TV for everyone else to shout out. You cannot write letters, you cannot mime, and the "
          "clock is merciless. Half the fun is the masterpiece; the other half is watching the whole family scream guesses "
          "while an increasingly frantic artist keeps adding more legs."),
    body2=("With hundreds of words spanning easy doodles like cat and cake to fiendish challenges like harpsichord and penny "
           "farthing, every round finds the sweet spot between confidence and chaos. Pick your colours, choose your brush, "
           "and let the guessing begin."),
    how=("One player is the drawer each round and sees a secret word on their phone. They draw it on their phone canvas using "
         "a pen, marker, or calligraphy brush in any of eight colours, while the drawing streams live to the TV. Everyone else "
         "races to type their guesses. The first correct guess scores points for both the guesser and the artist, then a new "
         "drawer takes the pen. Play rotates so everyone gets a turn to draw."),
    skill="No artistic skill required, and honestly, less skill is funnier.",
    faqs=[("How many players do you need for Quick Doodle?", "Quick Doodle works best with three or more players and suits any group size for a family game night."),
          ("Do you need to be good at drawing?", "Not at all. The game is designed so that rough, funny sketches create the most laughter. Guessing the wobbly drawings is half the fun."),
          ("What ages can play Quick Doodle?", "It is suitable for ages six and up, making it a genuine all-ages family game.")]),
  dict(
    slug="quizzards", name="Quizzards", icon="quizzards.png",
    hook="Where trivia legends are crowned.",
    players="2 or more", ages="8 and up", time="5 to 10 minutes",
    lead=("Think you are the smartest one at the table? Quizzards is here to settle it. This lightning-round trivia showdown "
          "fires questions at the TV while every player answers on their phone. The fastest correct answer climbs the "
          "leaderboard, and every question comes with a fun fact, so you learn something even when you lose."),
    body2=("With three difficulty levels, Easy for the young ones, Moderate for the confident, and Pro for the truly fearless, "
           "and hundreds of questions across science, geography, history, sport, food, and pop culture, no two game nights play "
           "the same. Quizzards even remembers which questions it has already asked you, so repeats are rare and the trivia "
           "stays fresh across dozens of rounds."),
    how=("A question and four answer options appear on the TV. Every player picks their answer on their phone before the timer "
         "runs out. Points reward both accuracy and speed, so hesitation costs you. After each question, the correct answer and "
         "a bite-sized fact are revealed. The player with the most points after all questions wins the crown."),
    skill="Choose your difficulty level to match the room, from curious kids to the family know-it-all.",
    faqs=[("How many players can play Quizzards?", "Quizzards supports two or more players, and you can pick a difficulty level to suit the group."),
          ("Are the trivia questions repeated?", "Quizzards remembers which questions your household has already seen and avoids repeats until the pool is exhausted, keeping each game fresh."),
          ("What topics does Quizzards cover?", "Questions span science, geography, history, sport, food, and pop culture, with a global mix of subjects.")]),
  dict(
    slug="scrutineye", name="Scrutineye", icon="scrutineye.png",
    hook="Spot it before they do.",
    players="2 or more", ages="6 and up", time="5 to 10 minutes",
    lead=("Somewhere in that gloriously busy scene is a tiny hidden umbrella, and whoever spots it first gets the points. "
          "Scrutineye is the hidden-object hunt in Party Fever, where a beautifully illustrated scene fills the TV and players "
          "race to find and name the objects hiding in plain sight. There is a twist: each round gives you a set of starting "
          "letters, and only words beginning with those letters count. Sharp eyes win, but a quick vocabulary wins faster."),
    body2=("With fourteen richly detailed scenes ranging from a bustling global bazaar and a deep-space research lab to a sunken "
           "Atlantis and a Japanese castle festival, and a huge dictionary of findable objects, Scrutineye rewards the observant "
           "and the quick-witted in equal measure. It is the I-spy of your childhood, supercharged for the whole family."),
    how=("A detailed scene appears on the TV alongside a set of allowed starting letters. Players scan the scene and type the "
         "objects they spot on their phones, but only words beginning with the allowed letters score. Rarer, harder-to-spot "
         "objects are worth more points. When time is up, whoever spotted the most wins."),
    skill="A great equaliser between kids and adults, where a sharp eye beats age every time.",
    faqs=[("What is Scrutineye?", "Scrutineye is a hidden-object party game where players race to find and name objects in a detailed scene shown on the TV, scoring more for rarer finds."),
          ("How does the letter rule work?", "Each round provides a set of starting letters, and only objects whose names begin with those letters count toward your score."),
          ("How many scenes are there?", "There are fourteen detailed scenes, each packed with objects to discover.")]),
  dict(
    slug="spin-and-spell", name="Spin & Spell", icon="spin_spell.png",
    hook="Spin the wheel. Steal the glory.",
    players="2 or more", ages="8 and up", time="10 to 15 minutes",
    lead=("Wheel of fortune meets family game night. Spin and Spell hides a secret phrase on the TV, such as a movie, a place, "
          "or a famous idiom, with every letter blanked out. Spin the wheel on your phone for a point value, call a letter, and "
          "if it is in the phrase you bank the points for every time it appears. Land on Fever and your next letter pays double. "
          "Land on Bankrupt and watch your round winnings vanish. Know the answer? Solve it for a big bonus, but guess wrong and "
          "your turn is gone."),
    body2=("With more than two hundred phrases across categories like Movies and TV, Food and Drink, Famous Places, Idioms, "
           "Music, Sports, Around the House, and Animals and Nature, seasoned with global favourites, Spin and Spell delivers "
           "the exact drama that makes the format a classic, along with all the cheers and groans that come with it."),
    how=("A masked phrase and its category appear on the TV. On your turn, spin the wheel on your phone to set a point value, "
         "then pick a letter. Correct letters reveal on the board and score you the wheel value for each occurrence. Spin again, "
         "or gamble on solving the whole phrase for a big bonus. Beware Bankrupt and Lose a Turn. Points bank when the puzzle is "
         "solved, and the highest score after all rounds wins."),
    skill="Turn-based drama at its finest, rewarding both a sharp vocabulary and steady nerves.",
    faqs=[("How do you play Spin and Spell?", "Players take turns spinning a wheel for points, guessing letters in a hidden phrase, and choosing when to solve the whole puzzle for a bonus."),
          ("What happens if you land on Bankrupt?", "Landing on Bankrupt wipes the points you have banked in the current round and passes the turn to the next player."),
          ("How many phrases are in the game?", "There are more than two hundred phrases across eight categories, with a globally varied mix of topics.")]),
  dict(
    slug="cups", name="Cups", icon="cups.png",
    hook="Match the stack. Buzz to win.",
    players="2 or more", ages="6 and up", time="about 5 minutes",
    lead=("It looks simple. It is not. Cups flashes a colourful stack of items, such as balloons, birds on a wire, parked cars, "
          "or a row of frogs, on the TV, and your job is to recreate that exact colour order on your phone, then hit the buzzer "
          "before anyone else. First to match correctly scores big; buzz wrong and it costs you. It is a pure test of quick eyes, "
          "steady nerves, and the confidence to commit under pressure while everyone else is fumbling their order."),
    body2=("With eight playful themes and colour sequences that reset every round, Cups is deceptively addictive, the kind of "
           "game where one more round turns into twenty. It is perfect for a fast, high-energy burst of competition when "
           "attention spans are short and the table is loud."),
    how=("A sequence of coloured items appears on the TV, stacked or in a row. Each player rebuilds the exact same order on "
         "their phone, then hits the buzzer. The first player to buzz with a correct match wins the round and scores, while a "
         "wrong buzz costs points, so speed and accuracy both matter. The highest score after all rounds takes it."),
    skill="Fast, frantic, and fiercely competitive, with rounds short enough to keep everyone hooked.",
    faqs=[("What is the game Cups about?", "Cups is a fast memory and reaction game where players recreate a colour sequence shown on the TV and race to buzz in first with a correct match."),
          ("How long does a game of Cups take?", "A full game takes only a few minutes, making it ideal for quick, high-energy rounds."),
          ("Is Cups suitable for children?", "Yes, it suits ages six and up and rewards quick eyes over specialist knowledge.")]),
  dict(
    slug="werewolf", name="Werewolf", icon="werewolf.svg",
    hook="Trust no one. Especially not them.",
    players="5 or more", ages="10 and up", time="10 to 20 minutes",
    lead=("Night falls on the village, and one among you is not who they seem. Werewolf is the Party Fever game of secrets, "
          "suspicion, and shameless bluffing. Each player is secretly dealt a role on their phone. Most are innocent Villagers, "
          "one is the Doctor who can save a life each night, and lurking among them is a single Werewolf who picks off a victim "
          "while everyone sleeps. When day breaks, the survivors must argue, accuse, and vote to unmask the wolf before it is "
          "too late. Are you clever enough to spot the liar, or cunning enough to be one?"),
    body2=("Built for five or more players, Werewolf turns your living room into a courtroom of accusations and dramatic "
           "betrayals. It is the social deduction classic that has fuelled game nights for generations, now dealt and refereed "
           "automatically so nobody has to be the narrator."),
    how=("Roles are dealt secretly to each phone: one Werewolf, one Doctor, and the rest Villagers. Each night, the Werewolf "
         "secretly chooses a victim and the Doctor secretly chooses someone to protect. By day, the TV reveals what happened, "
         "and the surviving players debate and vote to banish the person they suspect. Villagers win by unmasking the Werewolf; "
         "the Werewolf wins by outlasting the village."),
    skill="The ultimate test of who can keep a straight face while the accusations fly.",
    faqs=[("How many players do you need for Werewolf?", "Werewolf needs at least five players and gets better with larger groups."),
          ("Who are the roles in Werewolf?", "There is one Werewolf, one Doctor who can protect a player each night, and the remaining players are Villagers."),
          ("Does someone have to be the narrator?", "No. Party Fever deals the roles and runs the night and day phases automatically, so everyone can play.")]),
]

def game_jsonld(g):
    return {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": f"{g['name']} \u2013 Party Fever",
      "description": g["lead"],
      "url": f"{SITE}/games/{g['slug']}",
      "genre": "Party game",
      "gamePlatform": ["Web browser", "Smart TV", "Mobile phone"],
      "playMode": "MultiPlayer",
      "numberOfPlayers": {"@type": "QuantitativeValue", "minValue": int(''.join(filter(str.isdigit, g['players'].split()[0])) or 2)},
      "publisher": {"@type": "Organization", "name": BRAND, "url": SITE},
      "isPartOf": {"@type": "VideoGameSeries", "name": BRAND},
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
          for q, a in g["faqs"]
        ],
      },
    }

def game_body(g, root="../"):
    faqs = "\n".join(
        f'      <div class="faq"><h3>{html.escape(q)}</h3><p>{html.escape(a)}</p></div>'
        for q, a in g["faqs"])
    return f"""    <article class="game-page">
      <a class="back" href="{root}games/">&larr; All games</a>
      <div class="game-hero">
        <img class="game-icon" src="{root}icons/{g['icon']}" alt="{html.escape(g['name'])} icon" width="120" height="120" />
        <div>
          <h1>{html.escape(g['name'])}</h1>
          <p class="hook">{html.escape(g['hook'])}</p>
        </div>
      </div>
      <div class="meta-row">
        <span><strong>Players</strong>{html.escape(g['players'])}</span>
        <span><strong>Ages</strong>{html.escape(g['ages'])}</span>
        <span><strong>Length</strong>{html.escape(g['time'])}</span>
      </div>
      <p class="lead">{html.escape(g['lead'])}</p>
      <p>{html.escape(g['body2'])}</p>
      <h2>How it works</h2>
      <p>{html.escape(g['how'])}</p>
      <p class="skill">{html.escape(g['skill'])}</p>
      <h2>Common questions</h2>
      <div class="faqs">
{faqs}
      </div>
      <div class="cta">
        <a class="btn" href="{root or '/'}">Start playing on your TV</a>
      </div>
    </article>"""

# ---------------------------------------------------------------- build games
for g in GAMES:
    page(f"games/{g['slug']}.html",
         f"{g['name']} \u2013 {g['hook']} | {BRAND}",
         g['lead'][:155],
         game_body(g),
         jsonld=game_jsonld(g))

# games hub
cards = "\n".join(
  f'''      <a class="game-card" href="{g['slug']}">
        <img src="../icons/{g['icon']}" alt="{html.escape(g['name'])} icon" width="72" height="72" />
        <h2>{html.escape(g['name'])}</h2>
        <p>{html.escape(g['hook'])}</p>
        <span class="card-meta">{html.escape(g['players'])} players &middot; ages {html.escape(g['ages'])}</span>
      </a>''' for g in GAMES)
page("games/index.html",
     f"The Games | {BRAND}",
     "Six family party games you play on your TV with phones as controllers: Quick Doodle, Quizzards, Scrutineye, Spin and Spell, Cups, and Werewolf.",
     f"""    <section class="hub">
      <h1>Six games. One screen. Everyone plays.</h1>
      <p class="hub-intro">{TAGLINE} Party Fever turns your TV into the game board and every phone into a controller. Pick a game and gather round.</p>
      <div class="game-grid">
{cards}
      </div>
    </section>""",
     jsonld={
       "@context": "https://schema.org", "@type": "CollectionPage",
       "name": f"The Games \u2013 {BRAND}", "url": f"{SITE}/games",
       "hasPart": [{"@type": "VideoGame", "name": g["name"], "url": f"{SITE}/games/{g['slug']}"} for g in GAMES],
     })

# ---------------------------------------------------------------- about
page("about.html",
     f"About Party Fever | Family Game Nights, No Mess",
     "Party Fever turns your TV into a game board and phones into controllers. All the joy of family board games, with none of the setup or clean-up.",
     f"""    <section class="prose">
      <h1>Your living room is the arcade.</h1>
      <p class="lead">Party Fever turns your TV into a game board and everyone's phone into a controller. No cards to shuffle, no tiny pieces to lose under the sofa, no box to squeeze back into the cupboard. Just gather the family, open the game on your TV, and scan a code to jump in.</p>
      <p>It is built for the moments that matter: a rainy afternoon, a birthday, a holiday when three generations are finally in the same room. Party Fever brings back the joy of family games night without any of the setup or the clean-up. Pick a game, grab your phones, and play. When you are done, there is nothing to pack away.</p>
      <p>From quick-draw doodling and trivia showdowns to spotting hidden objects and racing to spell the secret phrase, every game is designed to be picked up in seconds and enjoyed by all ages together. Grandparents, children, and everyone in between share the same screen, the same laughter, and the same table.</p>
      <p class="strap">{TAGLINE}</p>
      <div class="cta"><a class="btn" href="/">Play Now</a> <a class="btn ghost" href="/games/">Explore the games</a></div>
    </section>""",
     jsonld={
       "@context": "https://schema.org", "@type": "Organization",
       "name": BRAND, "url": SITE, "email": EMAIL,
       "description": "Party Fever turns your TV into a game board and phones into controllers for family party games.",
       "slogan": TAGLINE,
     })

# ---------------------------------------------------------------- how to play
htp_games = "\n".join(
  f'      <div class="step-game"><h3>{html.escape(g["name"])}</h3><p>{html.escape(g["how"])}</p></div>'
  for g in GAMES)
page("how-to-play.html",
     f"How to Play | {BRAND}",
     "Getting started with Party Fever takes under a minute. Open the game on your TV, join from your phone by scanning a QR code, and play together.",
     f"""    <section class="prose">
      <h1>Up and running in under a minute.</h1>
      <ol class="steps">
        <li><strong>Open Party Fever on your TV.</strong> Use a smart TV browser, a laptop, or any screen the family can gather around.</li>
        <li><strong>Choose a game on the TV.</strong> The TV is your shared game board and shows the action, the scores, and who is winning.</li>
        <li><strong>Join from your phone.</strong> Each player opens Party Fever on their phone, enters a name and picks a colour once, then scans the QR code on the TV to join.</li>
        <li><strong>Play together.</strong> Your phone is your personal controller, where you draw, answer, buzz, and make your moves.</li>
        <li><strong>Play again.</strong> When a game ends, the leaderboard appears and everyone returns to their home screen with a tap. Pick a new game on the TV and scan again.</li>
      </ol>
      <p class="note">All you need is a shared screen and a phone each. Designed for two or more players, ages young and old.</p>
      <h2>How each game works</h2>
      <div class="step-games">
{htp_games}
      </div>
      <div class="cta"><a class="btn" href="/">Start a game</a></div>
    </section>""",
     jsonld={
       "@context": "https://schema.org", "@type": "HowTo",
       "name": "How to play Party Fever",
       "step": [
         {"@type": "HowToStep", "name": "Open on your TV", "text": "Open Party Fever on a smart TV browser, laptop, or any shared screen."},
         {"@type": "HowToStep", "name": "Choose a game", "text": "Select a game from the menu on the TV."},
         {"@type": "HowToStep", "name": "Join from your phone", "text": "Enter a name and colour once on your phone, then scan the QR code shown on the TV."},
         {"@type": "HowToStep", "name": "Play together", "text": "Use your phone as a controller to draw, answer, buzz, and make moves."},
         {"@type": "HowToStep", "name": "Play again", "text": "After the leaderboard, return home and scan a new game to keep playing."},
       ],
     })

# ---------------------------------------------------------------- contact
page("contact.html",
     f"Contact | {BRAND}",
     "Get in touch with the Party Fever team. Questions, feedback, and support enquiries are welcome.",
     f"""    <section class="prose">
      <h1>Get in touch.</h1>
      <p class="lead">We would love to hear from you, whether it is feedback after a great game night, a question about how something works, or an idea for a game you would like to see next.</p>
      <p>Email us any time at <a href="mailto:{EMAIL}">{EMAIL}</a> and we will get back to you.</p>
      <p class="note">Party Fever is operated from the United Arab Emirates.</p>
      <div class="cta"><a class="btn" href="/">Back to the games</a></div>
    </section>""",
     jsonld={
       "@context": "https://schema.org", "@type": "ContactPage",
       "name": f"Contact {BRAND}", "url": f"{SITE}/contact",
       "mainEntity": {"@type": "Organization", "name": BRAND, "email": EMAIL},
     })

# ---------------------------------------------------------------- privacy
page("privacy.html",
     f"Privacy Policy | {BRAND}",
     "How Party Fever handles your information. We collect as little as possible and never sell your data.",
     f"""    <section class="prose policy">
      <h1>Privacy Policy</h1>
      <p class="updated">Last updated: February 2026</p>
      <p>{BRAND} (\u201cwe\u201d, \u201cour\u201d, or \u201cthe app\u201d) is committed to protecting your privacy. This policy explains what information we handle when you use Party Fever at partyfever.cc. Party Fever is operated from the United Arab Emirates.</p>

      <h2>Information we collect</h2>
      <p>Party Fever is designed to collect as little as possible. When you join a game, you provide a display name and choose a colour. This is stored temporarily to run the game session and is associated with your gameplay, such as scores, for the duration of play. Your name and colour preference may be saved locally on your own device so you do not have to re-enter them; this stays on your device and you can clear it at any time through your browser settings.</p>

      <h2>How we use information</h2>
      <p>The information is used solely to operate the game: to display players in a session, track scores, and show results. We do not use it to build advertising profiles, and we do not sell it.</p>

      <h2>Cookies and advertising</h2>
      <p>Party Fever uses Google AdSense to display advertisements on player screens. Google and its partners may use cookies to serve ads based on your prior visits to this or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visits to our site and other sites on the internet. You may opt out of personalised advertising by visiting Google Ads Settings at adssettings.google.com. For more on how Google uses data, see google.com/policies/technologies/ads.</p>

      <h2>Families and younger players</h2>
      <p>Party Fever is a family game intended to be set up and managed by an adult account holder and played together. We do not knowingly collect personal information from children beyond a chosen display name and colour used only to run the game. We encourage parents and guardians to supervise younger players and to manage the device on which the game is opened.</p>

      <h2>Data retention</h2>
      <p>Game session data is transient and tied to active play. Locally saved preferences, namely your name and colour, remain on your device until you clear them.</p>

      <h2>Third-party services</h2>
      <p>Party Fever relies on hosting and database infrastructure to run games in real time, and on Google AdSense for advertising. These providers process data only as needed to deliver their services.</p>

      <h2>Your choices</h2>
      <p>You can clear your saved name and colour by clearing your browser's local storage for partyfever.cc. You can manage or disable cookies through your browser settings.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. Changes will be posted on this page with a revised date.</p>

      <h2>Contact</h2>
      <p>For any questions about this policy, contact us at <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
    </section>""",
     jsonld={
       "@context": "https://schema.org", "@type": "PrivacyPolicy",
       "name": f"Privacy Policy \u2013 {BRAND}", "url": f"{SITE}/privacy",
     })

print("Generated pages:")
for root_, _, files in os.walk(OUT):
    for fn in files:
        if fn.endswith(".html"):
            print("  ", os.path.join(root_, fn))
