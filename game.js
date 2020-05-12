const root = document.getElementById("root");

const sleep = (ms) => {
  return new Promise((ok, err) => {
    setTimeout(() => {
      ok();
    }, ms);
  });
}

const wait_for_keyboard = async (expected_key) => {
  return new Promise((ok, err) => {
    document.addEventListener("keydown", (e) => {
      if(expected_key == null || expected_key == e.key.toLowerCase()) {
        ok();
      }
    });
  });
}

const wait_for_mouse = async (btn) => {
  return new Promise((ok, err) => {
    document.addEventListener("click", (e) => {
      if(btn == null || btn == e.button) {
        ok();
      }
    });
  })
}

const wait_for_continue = async () => {

  document.body.style.cursor = "pointer";

  const el = document.createElement("p");
  el.innerText = ">";
  el.style["float"] = "right";
  el.style["padding-right"] = "64px";
  el.style["animation"] = "fadein 1s";
  root.appendChild(el);

  await Promise.race([
    wait_for_keyboard(" "),
    wait_for_keyboard("enter"),
    wait_for_mouse(0)
  ]);

  document.body.style.cursor = "default";

  el.style["animation"] = "fadeout 0.1s"
  await sleep(100);

  el.remove();
}

const p = async (txt) => {
  const el = document.createElement("p");
  el.innerText = txt;

  root.appendChild(el);
  window.scroll({top: el.getBoundingClientRect().top + window.scrollY});

  el.style["animation"] = "fadein 1s, slidein .5s"

  await sleep(1000);
  await wait_for_continue();

  el.style["animation"] = "fadeout 0.1s"
  await sleep(100);

  el.remove();
};

const multiple = async (txts) => {
  const els = [];

  for(const txt of txts) {
    const el = document.createElement("p");
    el.innerText = txt;

    root.appendChild(el);
    window.scroll({top: el.getBoundingClientRect().top + window.scrollY});

    el.style["animation"] = "fadein 1s, slidein .5s"

    await sleep(1000);
    els.push(el);
  }

  await sleep(1000);
  await wait_for_continue();

  for(const el of els) {
    el.style["animation"] = "fadeout 0.1s"
  }

  await sleep(100);

  for(const el of els) {
    el.remove();
  }
};


const it_must_not_wither = async () => {
  const el = (type, parent) => {
    const e = document.createElement(type);
    parent.appendChild(e);
    return e;
  };

  const play = async () => {
    let curtains_open = true;
    let water = 1.0;
    let health = 1.0;
    let age = 0.0;

    const game = el("div", root);
    game.style["animation"] = "fadein 2s, slidein 1s"

    const el_water = el("div", game);
    const el_sun = el("div", game);
    const el_health = el("div", game);
    const el_age = el("div", game);

    const btn_water = el("button", game);
    btn_water.innerText = "Water Plant";

    btn_water.onclick = () => {
      water += .25;
    };
    
    const float_format = f => Math.round(f * 100) / 100;

    let did_win = false;
    while(true) {

      age += .01;
      water -= age * .1;

      if(1.1 <= water) {
        const over = water - 1.1
        health -= over * .1;
      }
      else if(1.1 > water && water > .9) {
        health += .01;
      }
      else {
        const under = .9 - water
        health -= .1 * under;
      }

      el_age.innerText = "Age: " + float_format(age) + "/1";
      el_water.innerText = "Water: " + float_format(water);
      el_health.innerText = "Health: " + float_format(health);

      if(age >= 1) {
        did_win = true;
        break;
      }

      if( health <= 0 || water <= 0) {
        break;
      }

      await sleep(500);
    }

    await new Promise(ok => {
      const local_root = el("div", game);
      local_root.style["animation"] = "fadein 2s, slidein 1s"

      const title =  el("div", local_root);

      const b = el("button", local_root);
      b.innerText = "Quit";
      b.onclick = () => ok();

      if(did_win) {
        title.innerText = "Your plant produced fruit.";
        btn_water.disabled = true;
      }
      else {
        title.innerText = "Your plant died without producing fruit.";
        btn_water.disabled = true;
      }
    });

    game.style["animation"] = "fadeout 0.1s"
    await sleep(100);
    game.remove();

    return did_win;
  }

  await play();
};

const to_keep_me_alive = () => {
  return new Promise(ok => {
    const el = (type, parent) => {
      const e = document.createElement(type);
      parent.appendChild(e);
      return e;
    };

    const game = el("div", root);
    game.style["animation"] = "fadein 2s, slidein 1s"

    const el_food = el("div", game);
    const el_energy = el("div", game);
    const el_distance = el("div", game);

    const btn_scavenge = el("button", game);
    const btn_travel = el("button", game);
    const btn_rest = el("button", game);

    let food = 2;
    let energy = 0;
    let distance = 0;

    function rand_int(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    let did_win = false;
    let did_lose = false;

    const update = () => {
      if(did_win || did_lose) {
        return;
      }

      energy = Math.max(energy, 0);
      food = Math.max(food, 0);

      btn_scavenge.disabled = energy <= 0;
      btn_travel.disabled = energy <= 0;
      btn_rest.disabled = food <= 0;

      el_food.innerText = "Food: " + food;
      el_energy.innerText = "Energy: " + energy;
      el_distance.innerText = "Distance: " + distance + " /10";

      if(distance >= 10) {
        did_win = true;
      }
      else if(energy <= 0 && food <= 0) {
        did_lose = true;
      }

      if(did_lose || did_win) {
        const local_root = el("div", game);
        local_root.style["animation"] = "fadein 2s, slidein 1s"

        const title =  el("div", local_root);

        const b = el("button", local_root);
        b.innerText = "Quit";

        b.onclick = async () => {

          game.style["animation"] = "fadeout 0.1s"
          await sleep(100);
          game.remove();

          ok();
        };

        if(did_win) {
          title.innerText = "You arrived at your destination.";
        }
        else {
          title.innerText = "You failed to get to your destination.";
        }

        btn_scavenge.disabled = true;
        btn_travel.disabled = true;
        btn_rest.disabled = true;
      }
    };

    btn_scavenge.innerText = "Scavenge";
    btn_travel.innerText = "Travel";
    btn_rest.innerText = "Rest";

    btn_scavenge.onclick = () => {
      food += rand_int(2) + 1;
      energy -= rand_int(2) + 1;

      update();
    };

    btn_travel.onclick = () => {
      energy -= 1;
      distance += 1;

      update();
    };

    btn_rest.onclick = () => {
      energy += rand_int(2) + 1;
      food -= 1;

      update();
    };

    update();
  })
};

const loop = async (cont) => {

  if(cont) {
    await p("you are preparing to play a game.");
  }
  else {
    await p("You are preparing to play a game.");
  }

  await p("Maybe you have just finished your own, and are now eager to see what others have done with their time.");

  await p("You find yourself in a specific state, one that leaves you wanting nothing more but to swiftly sort through this arbitrary set of games."); 

  await p("You do not expect much from something that has been quickly thrown together, yet you do not deny yourself the experience of finding a game you enjoy, which you will later amplify the reach of, and perhaps steal the nuggets of wisdom embedded within for later use in life.");

  await multiple([
    "As you look through the list, a title stands out. It feels incoherent.",
    `"It Must Not Wither"`
  ]);

  await p("Given the header of the game, you form an image wherein you are asked to manage something that can wither.");
  await p("When it comes to the 'it', it seems that it has nothing concrete to bind to, leaving you to speculate it to be botanic subject.");
  await p("The 'must not' immediately gives you an initial insight into what the lose state is.");

  await p("With time having been invested into analyzing the title, it is too late to ignore the game itself.");
  await multiple([
    "The game is readied for launch.",
    "You begin playing It Must Not Wither."
  ]);

  await it_must_not_wither();

  await p("You close It Must Not Wither.");

  await p("It is time to enter a familiar state.");

  await p("You will find something positive about the game, swiftly write it down, employing a subset of your polite vocabulary which does not ask you to exert too much effort.");

  await p("Shortly after, the words will be sent off to somebody who may have been involved in the making of the game, leaving you to continue on with the burden emerging from this seemingly bottomless barrel of games.");

  await multiple([
    "For the n-th time today, an image surfaces in your mind.",
    "One of writing for the sake of placing down symbols to fill the page, drawing something for the sake of having the tool touch the medium."
  ]);

  await p("It is time to continue.");

  await multiple([
    "Your eyes dart onto a thumbnail. It looks unfinished.",
    `"To Keep Me Alive"`
  ]);

  await p("You imagine the game taking the form of a mash of genres, resulting in an experience in which a defense from harm, maybe famine - generally, misfortune - is required.");

  await p("You begin playing To Keep Me Alive.");

  await to_keep_me_alive();

  await p("You close To Keep Me Alive.");

  await p("It is time to repeat the dance. You cannot say it was bad per-se, while being unable to say it was good either.")

  await p("What surfaces is a refrain from saying that interacting with it was eventful or insightful. Words are written and sent.")

  await p("Maybe a node fires. Maybe a connection is made.")

  await p("Maybe you are reminded of a series of sentences someone said somewhere in some standing situation, seeing a sea of silhouettes silently staring.")

  await p("In your mind surfaces a sequence of letters, or rather, a handle, f6ta63pbc6Q, with an optional ampersand (and a 'tee' of two-zero-four).")

  await p("However, it is time to continue.")

  await multiple([
    "A name catches your attention. It does not sound like a game.",
    `"In A Game Wherein"`
  ]);

  await p("The title sounds unfinished, as if someone collapsed in the middle of writing it.")

  await p("It sounds like a trick.")

  await p("Having contemplated its nonsensical nature, you find yourself preparing the game for consumption.")

  await p("You begin playing In A Game Wherein");

  await loop(true);
};

loop(false);
