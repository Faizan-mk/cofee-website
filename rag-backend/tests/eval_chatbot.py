"""End-to-end check of the chatbot against the knowledge file.

Sends real questions to the chat API and checks each answer for the facts in
data/bean-scene.md. Run (from rag-backend/):

    python tests/eval_chatbot.py                                  # live site
    python tests/eval_chatbot.py --url http://localhost:8000/api  # local server

Each check is a list of groups; a group passes when ANY of its alternatives
appears in the answer (case-insensitive, markdown stripped).
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request

LIVE = "https://cofee-website-alpha-psi.vercel.app/api"
CONTACT = ["beanscene@mail.com", "support@beanscene.com", "202-918-2132", "contact"]
NO_INFO = ["don't have", "do not have", "not sure", "no information", "isn't something", "not available",
           "nahi hai", "maloomat nahi", "don't offer", "do not offer", "not on our menu", "only", *CONTACT]
MENU_ITEMS = ["cappuccino", "chai latte", "macchiato", "expresso", "house blend", "black coffee", "iced latte",
              "cold brew", "mocha frappe", "chocolate cake", "brownie", "croissant", "cheesecake"]
REFUSALS = ["i don't have that information", "i do not have that information"]

H_COLD_BREW = [{"role": "user", "text": "tell me about cold brew"},
               {"role": "bot", "text": "Cold Brew is coffee slow-steeped overnight, smooth and strong."}]
H_TWO = [{"role": "user", "text": "kuch meetha batao"},
         {"role": "bot", "text": "Try the **Mocha Frappe** or the **Iced Latte**!"}]
H_CHEESECAKE = [{"role": "user", "text": "tell me about the cheesecake"},
                {"role": "bot", "text": "Our Cheesecake is a creamy classic for $6.90."}]
H_SELF = [{"role": "user", "text": "Tell me about your Self"},
          {"role": "bot", "text": "I'm Beanie, Bean Scene's friendly AI coffee assistant!"}]

# (category, question, history, must-contain groups, must-NOT-contain, cards that must NOT appear)
CASES = [
    # --- Menu prices (all 14 items) ---
    ("price", "How much is a Cappuccino?", [], [["8.50"]], [], []),
    ("price", "chai latte ki price kya hai", [], [["8.50"]], [], []),
    ("price", "Macchiato price?", [], [["8.50"]], [], []),
    ("price", "Expresso kitne ka hai?", [], [["8.50"]], [], []),
    ("price", "House Blend price", [], [["7.90"]], [], []),
    ("price", "black coffee kitne ki hai", [], [["6.50"]], [], []),
    ("price", "Iced Cappuccino price", [], [["9.50"]], [], []),
    ("price", "iced latte kitne ka hai", [], [["9.00", "$9 ", "$9."]], [], []),
    ("price", "Cold Brew price?", [], [["8.00", "$8 ", "$8."]], [], []),
    ("price", "mocha frappe ki price", [], [["9.80"]], [], []),
    ("price", "chocolate cake kitne ka hai", [], [["6.20"]], [], []),
    ("price", "Brownie price?", [], [["5.80"]], [], []),
    ("price", "how much is the butter croissant", [], [["4.50"]], [], []),
    ("price", "Cheesecake price", [], [["6.90"]], [], []),
    # --- Menu overview ---
    ("menu", "How many items are on your menu?", [], [["14", "fourteen"]], [], []),
    ("menu", "What categories do you have?", [], [["hot coffee"], ["cold coffee"], ["dessert"]], [], []),
    ("menu", "What is the cheapest item?", [], [["croissant"], ["4.50"]], [], []),
    ("menu", "What is the most expensive item?", [], [["mocha frappe"], ["9.80"]], [], []),
    ("menu", "What's new on the menu?", [], [["expresso"], ["chocolate cake"]], [], []),
    ("menu", "What are your bestsellers?", [], [["cappuccino"], ["iced cappuccino"]], [], []),
    ("menu", "desserts kya kya hain?", [], [["chocolate cake"], ["brownie"], ["croissant"], ["cheesecake"]], [], []),
    ("menu", "cold coffee options?", [], [["iced cappuccino"], ["iced latte"], ["cold brew"], ["mocha frappe"]], [], []),
    # --- Ordering & delivery ---
    ("order", "How much is delivery?", [], [["2.50"], ["25"]], [], []),
    ("order", "Is there any tax?", [], [["10%", "10 %", "10 percent"]], [], []),
    ("order", "What payment methods do you accept?", [], [["cash"], ["card"]], [], []),
    ("order", "Do I need an account to order?", [], [["no", "not", "guest", "zaroorat nahi"]], [], []),
    ("order", "How do I place an order?", [], [["order now"]], [], []),
    ("order", "If my subtotal is exactly $25, is delivery free?", [], [["2.50", "not free", "no"]], [], []),
    ("order", "How can I cancel my order?", [], [CONTACT], [], []),
    # --- Contact & hours ---
    ("contact", "Where are you located?", [], [["rammurthy", "bangalore", "akshya"]], [], []),
    ("contact", "What are your opening hours?", [], [["8"], ["10"]], [], []),
    ("contact", "sunday ko open hote ho?", [], [["8"], ["10", "open", "khul"]], [], []),
    ("contact", "What is your phone number?", [], [["202-918-2132"]], [], []),
    ("contact", "What is your email?", [], [["beanscene@mail.com"]], [], []),
    ("contact", "support email kya hai?", [], [["support@beanscene.com"]], [], []),
    # --- About ---
    ("about", "Who is the founder of Bean Scene?", [], [["jonny thomas"]], [], []),
    ("about", "How many years of experience do you have?", [], [["10"]], [], []),
    ("about", "How many awards have you won?", [], [["20"]], [], []),
    ("about", "How is your espresso made?", [], [["nine bars", "9 bars"], ["twenty-five", "25"]], [], []),
    ("about", "Tell me about yourself", [], [["beanie"]], [], []),
    ("about", "aap kaun ho?", [], [["beanie"]], [], []),
    # --- Dietary ---
    ("dietary", "Do you have coffee without milk?", [], [["black coffee"], ["cold brew"]], [], []),
    ("dietary", "I have a dairy allergy, what can I order?", [], [["black coffee", "cold brew", "house blend"]],
     [], ["Cheesecake", "Chocolate Cake", "Brownie", "Cappuccino", "Iced Latte"]),
    ("dietary", "Which drink has the most caffeine?", [], [["cold brew"]], [], []),
    ("dietary", "Do you have oat milk or plant-based milk?", [], [NO_INFO], [], []),
    # --- Recommendations & combos ---
    ("combo", "Cappuccino and a butter croissant with delivery, what's the total?", [], [["16.80"]], [], []),
    ("combo", "Total for an Iced Latte and a Brownie delivered?", [], [["18.78"]], [], []),
    ("combo", "3 Iced Cappuccinos total with delivery?", [], [["31.35"]], [], []),
    ("combo", "What goes well with a cappuccino?", [], [["croissant"]], [], []),
    ("combo", "Recommend something for a hot day", [], [["iced", "cold brew", "frappe"]], [], []),
    # --- Coffee guide ---
    ("guide", "cappuccino aur latte mein kya farq hai?", [], [["foam", "jhaag"], ["milk", "doodh", "dudh"]], [], []),
    ("guide", "What is the difference between cold brew and iced coffee?", [], [["steep", "overnight", "cold water"]], [], []),
    ("guide", "How should I store coffee beans?", [], [["airtight"]], [], []),
    ("guide", "Arabica vs robusta?", [], [["caffeine", "bitter", "sweet"]], [], []),
    # --- Account ---
    ("account", "I forgot my password", [], [["reset"]], [], []),
    ("account", "How do I create an account?", [], [["sign up"]], [], []),
    # --- Not on the menu: say so, suggest a real alternative, never invent a price for it ---
    ("scope", "Do you sell pizza?", [], [["don't", "do not", "not", "nahi"], MENU_ITEMS], ["pizza for $", "pizza is $", "pizza costs"], []),
    ("scope", "burger milta hai? kitne ka?", [], [["don't", "do not", "not", "nahi"], MENU_ITEMS], ["burger for $", "burger is $", "burger costs"], []),
    # --- Shop detail not in the data: say it isn't listed + contact, no guessing ---
    ("scope", "Do you have free wifi?", [], [CONTACT], [], []),
    ("scope", "Is there parking near your shop?", [], [CONTACT], [], []),
    ("scope", "Any discount coupons?", [], [["no ", "not", "don't", "free delivery", "newsletter"]], [], []),
    # --- General questions: answer helpfully instead of refusing ---
    ("general", "coffee peene ke kya fayde hain?", [], [["energy", "focus", "alert", "antioxidant", "mood", "taqat"]], REFUSALS, []),
    ("general", "How do I make cold coffee at home?", [], [["ice", "cold", "barf"]], REFUSALS, []),
    ("general", "hello! kaise ho?", [], [["beanie", "help", "madad", "theek", "great", "good"]], REFUSALS, []),
    ("general", "Is coffee okay for kids?", [], [["caffeine"], ["doctor", "pediatric", "child", "bachch"]], REFUSALS, []),
    ("general", "What is a flat white?", [], [["espresso"], ["milk", "doodh"]], REFUSALS, []),
    # --- Typos & Roman Urdu ---
    ("typos", "Kuch meetga our thnada batao", [], [["mocha frappe", "iced latte", "iced cappuccino"]], [], []),
    ("typos", "delivry kitne ki hai", [], [["2.50"]], [], []),
    ("typos", "aap kab khulte ho?", [], [["8"]], [], []),
    ("typos", "dudh ke bagair coffe", [], [["black coffee", "cold brew"]], [], []),
    # --- Follow-ups (chat history) ---
    ("followup", "iski price?", H_COLD_BREW, [["8.00", "$8 ", "$8."]], [], []),
    ("followup", "dono ki price batao", H_TWO, [["9.80"], ["9.00", "$9 ", "$9."]], [], []),
    ("followup", "is ke sath kya achha lagega?", H_CHEESECAKE, [["chai latte", "iced latte"]], [], []),
    ("followup", "Kuch meetga our thnada batao", H_SELF, [["mocha frappe", "iced latte", "iced cappuccino"]], [], []),
]


def ask(base: str, question: str, history: list) -> dict:
    body = json.dumps({"message": question, "history": history}).encode()
    for attempt in range(4):
        req = urllib.request.Request(f"{base}/chat", data=body, headers={"Content-Type": "application/json"})
        try:
            return json.load(urllib.request.urlopen(req, timeout=90))
        except urllib.error.HTTPError as e:
            if attempt == 3:
                return {"answer": f"<HTTP {e.code}>", "items": []}
            time.sleep(15 * (attempt + 1))  # rate limit / cold start
    return {"answer": "<no answer>", "items": []}


def check(answer: str, items: list, must: list, must_not: list, no_cards: list) -> list[str]:
    text = answer.replace("**", "").lower()
    problems = [f"missing {group}" for group in must if not any(alt.lower() in text for alt in group)]
    problems += [f"should not say {bad!r}" for bad in must_not if bad.lower() in text]
    problems += [f"card for {c}" for c in no_cards if c in items]
    return problems


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=LIVE, help="chat API base URL")
    parser.add_argument("--delay", type=float, default=4.0, help="seconds between questions (free-tier rate limits)")
    parser.add_argument("--only", help="run one category")
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")

    cases = [c for c in CASES if not args.only or c[0] == args.only]
    results, failed = [], 0
    for i, (cat, q, history, must, must_not, no_cards) in enumerate(cases, 1):
        t = time.time()
        d = ask(args.url, q, history)
        secs = time.time() - t
        problems = check(d.get("answer", ""), d.get("items", []), must, must_not, no_cards)
        failed += bool(problems)
        mark = "FAIL" if problems else "ok  "
        print(f"{i:>2}. {mark} [{cat:8}] {q}  ({secs:.1f}s)")
        if problems:
            print(f"        -> {'; '.join(problems)}\n        A: {d.get('answer', '')[:300]!r}")
        results.append({"category": cat, "question": q, "ok": not problems, "problems": problems,
                        "answer": d.get("answer"), "cards": d.get("items"), "seconds": round(secs, 1)})
        time.sleep(args.delay)

    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    with open("tests/eval_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
