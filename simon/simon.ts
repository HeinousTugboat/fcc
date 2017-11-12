/**

    Simon says!

    Buttons:
        Green
        Red
        Yellow
        Blue
        Skill (1-4)
        Longest
        Last
        Start/Reset

    Skill levels:
        1    8
        2   14
        3   20
        4   31

    Tones:
        Green:  415Hz   (G#4/415.305Hz)
        Red:    310Hz   (D#4/311.127Hz)
        Yellow: 252Hz    (B3/247.942Hz)
        Blue:   209Hz   (G#3/207.652Hz)
        Fail:   42Hz

    Links:
        https://en.wikipedia.org/wiki/Simon_%28game%29
        https://www.hasbro.com/common/instruct/Simon.PDF
        http://www.waitingforfriday.com/?p=586

    Timings:
        Seq  1- 5:  0.42s on    0.05s off
        Seq  6-13:  0.32s on    0.05s off
        Seq 14-31:  0.22s on    0.05s off

        Timeout:    3.0s
        Delay after Press: 0.8s
        Failure:    0.8s on
        Victory:    0.02s on    0.02s off
           5x       0.07s on    0.02s off
        Fancy Victory: RYBGGGRY (0.10s on, ??? off)
            Failure Signal
            Flash BG > RYBG > RY

    RNG:
        Increment counter 1-4 each loop, use counter to select next button on button press


**/


/**
 * User Stories!
 *
 * User Story: I am presented with a random series of button presses.
 *
 * User Story: Each time I input a series of button presses correctly, I see the
 * same series of button presses but with an additional step.
 *
 * User Story: I hear a sound that corresponds to each button both when the
 * series of button presses plays, and when I personally press a button.
 *
 * User Story: If I press the wrong button, I am notified that I have done so,
 * and that series of button presses starts again to remind me of the pattern so
 * I can try again.
 *
 * User Story: I can see how many steps are in the current series of button
 * presses.
 *
 * User Story: If I want to restart, I can hit a button to do so, and the game
 * will return to a single step.
 *
 * User Story: I can play in strict mode where if I get a button press wrong, it
 * notifies me that I have done so, and the game restarts at a new random series
 * of button presses.
 *
 * User Story: I can win the game by getting a series of 20 steps correct. I am
 * notified of my victory, then the game starts over.
 **/
