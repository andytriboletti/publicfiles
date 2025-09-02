I've found if you get stuck when Cursor/Cody gets stuck, can't fix a bug after trying more than once, u can:
-Ask AI to isolate the component youre working on in a new file.
-Ask AI to run lint or otherwise check for duplicate code.
-Ask AI to add logging.

---

A thought came to me of something new to use while coding with cursor and it keeps not being able to fix a bug. Ask it to add asserts and throw an error if a value doesn't match what it thinks it should be.

---

I found a way for AI to view the console.logs in my app so I don't have to copy/paste. MCP never worked. It's working well for me, fixing the console errors and refreshing as I type this.

https://lnkd.in/eyQEhS9e

---

Tip for hashtag#threejs hashtag#vibejam coders. If you're having trouble with too much data or actions coming in as input, can't get it working, ask cursor to try rxjs to filter input stream to what u want. Ex: had multiple ways a ui could be updated. Solved it with rxjs to just update once.

---


Use Jenkins or Github actions or other for CI/CD

---

Creating a new project for me started with hand writing a prompt in PROMPT.md, using Augment enhance prompt and saving that to prompt.md, review, then having AI create technical and functional requirements doc from the prompt into PLAN.md, then review. Then having AI create a list of the steps required to do the plan in a ROADMAP.md


---

Here is how I start a new project:
I write around 100 line readme. I hooked up CodeRabbit for this repo. I will check it in, get a review. Reviews are unlimited. Then I will ask AugmentCode to create the architecture and roadmap docs. AugmentCode has a task manager built in, and I also ask it to keep the roadmap up to date, as far as in progress/to-do. Once I review the docs and CodeRabbit reviews the docs, I respond to review comments and then ask Augment to get started on it. Every 50 tool calls it says, “Should I continue?”. That’s good to me, it means I’m getting my money’s worth as they only charge for messages I send to the agent.


---

I can't recommend @coderabbitai AI pull request reviews enough. It is so thorough. Especially for solo devs. But on teams it would be nice also cause with manual code review of other's code it's tough to catch everything.

---

I setup npm run so it 1) clears the terminal 2) kills any other npm run dev commands. It makes using Cursor easier.
---



Has anybody ever exported a task list from AugmentCode to Markdown(md) format, committed it to a branch and created a Pull Request, and had CodeRabbit review your task list, make the edits via task manager, and reimport the new master list?

Anybody ever review a LICENSE file in Github for a private project using a CodeRabbit PR Review?

Has anybody ever used a public GitHub repo for Terms of Service and Privacy policy so users can see diffs and dates?

Anybody ever successfully create a GitHub issue using CodeRabbit?

Setup RAG Retrieval Augmented Generation using Ollama or equivalent ai and database and deployed that to a GPU host like Vast.ai?

If so, I'd like to chat. Email me: andy@greenrobot.com



---

I have some open source problems I may try to solve myself later on. Looking for something to do regarding open source that would help me and others? Try working on these problems.

1) I can’t use Safety with the latest Pydantic. Here’s a pr partially solving the problem. https://lnkd.in/exqaQKxD

2) For Python Jose I am at 3.5.0, which, according to safety, has a vulnerability, and according to GitHub, it's at the latest already. Here’s a link to the CVE - https://lnkd.in/eBBprZpG

3) Unable to use vite-plugin-terminal with Vite 7.1.1
I can’t use vite-terminal-plugin with the latest vite.
https://lnkd.in/e87UE8Bh

Do you think anyone at Claude or OpenAI or Google has anyone sneaking code into AI like the reveries in Westworld?

---

I created launchday.greenrobot.com as a checklist of marketing and tech validation tasks to launch your site. It's using node hosted with firebase hosting and db. Some augmentcode discord users convinced me firebase hosting is good and to give it a try.