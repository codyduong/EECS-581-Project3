/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file This code is compiled and executed in the "game" place on the server
 */

import setupEvents from "./events";
import { GameActor } from "./Game/Game";

GameActor.SendMessage("StartGame");
setupEvents();
